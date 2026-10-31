import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  getCurrentUser,
  getInvoices,
  getInvoiceDetails,
  getPaymentHistory,
  recordPayment,
  reversePayment,
  type User,
  type Invoice,
  type Payment,
} from '../services/api'

const canManagePayments = (role: string) =>
  ['ADMIN', 'STAFF'].includes(role.toUpperCase())

const money = (value: number | string, currency: string) =>
  `${currency} ${Number(value).toFixed(2)}`

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString()

export default function Invoices() {
  const [user, setUser] = useState<User | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 16),
  )
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')

  const canManage = canManagePayments(user?.role ?? '')

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [currentUser, invoiceData] = await Promise.all([
        getCurrentUser(),
        getInvoices(),
      ])
      setUser(currentUser)
      setInvoices(invoiceData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load invoices.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadInvoices()
  }, [loadInvoices])

  const selectInvoice = async (invoiceId: number) => {
    try {
      setDetailsLoading(true)
      setError('')
      setSuccess('')

      const [invoice, history] = await Promise.all([
        getInvoiceDetails(invoiceId),
        getPaymentHistory(invoiceId),
      ])

      setSelectedInvoice(invoice)
      setPayments(history)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load invoice.')
    } finally {
      setDetailsLoading(false)
    }
  }

  const refreshSelectedInvoice = async () => {
    if (!selectedInvoice) return

    const [invoice, history] = await Promise.all([
      getInvoiceDetails(selectedInvoice.id),
      getPaymentHistory(selectedInvoice.id),
    ])

    setSelectedInvoice(invoice)
    setPayments(history)
    await loadInvoices()
  }

  const handleRecordPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedInvoice || !canManage) return

    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid payment amount greater than zero.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      await recordPayment(selectedInvoice.id, {
        amount: numericAmount,
        payment_method: paymentMethod,
        payment_date: new Date(paymentDate).toISOString(),
        reference: reference.trim() || null,
        note: note.trim() || null,
      })

      setAmount('')
      setReference('')
      setNote('')
      setSuccess('Payment recorded successfully.')
      await refreshSelectedInvoice()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record payment.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReversePayment = async (paymentId: number) => {
    if (!selectedInvoice || !canManage) return

    if (!window.confirm('Are you sure you want to reverse this payment?')) {
      return
    }

    try {
      setError('')
      setSuccess('')
      await reversePayment(selectedInvoice.id, paymentId)
      setSuccess('Payment reversed successfully.')
      await refreshSelectedInvoice()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reverse payment.')
    }
  }

  const latestBalancePayment = [...payments].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0]

  if (loading) {
    return <p className="text-slate-600">Loading invoices...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Invoices & Payments
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View invoices and manage payment records.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b p-4">
          <h2 className="font-semibold text-slate-800">Invoice list</h2>
        </div>

        {invoices.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No invoices found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4">Invoice</th>
                  <th className="p-4">Issue date</th>
                  <th className="p-4">Due date</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t">
                    <td className="p-4 font-medium">{invoice.invoice_number}</td>
                    <td className="p-4">{formatDate(invoice.issue_date)}</td>
                    <td className="p-4">{formatDate(invoice.due_date)}</td>
                    <td className="p-4">
                      {money(invoice.total, invoice.currency)}
                    </td>
                    <td className="p-4">{invoice.payment_status}</td>
                    <td className="p-4">
                      <button
                        onClick={() => void selectInvoice(invoice.id)}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailsLoading && (
        <p className="text-slate-600">Loading invoice details...</p>
      )}

      {selectedInvoice && !detailsLoading && (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {selectedInvoice.invoice_number}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Invoice status: {selectedInvoice.status}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-sm text-blue-600 hover:underline"
              >
                Close details
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">Subtotal</p>
                <p className="mt-1 font-semibold">
                  {money(selectedInvoice.subtotal, selectedInvoice.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Discount</p>
                <p className="mt-1 font-semibold">
                  {money(selectedInvoice.discount_amount, selectedInvoice.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tax</p>
                <p className="mt-1 font-semibold">
                  {money(selectedInvoice.tax_amount, selectedInvoice.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Invoice total</p>
                <p className="mt-1 font-semibold">
                  {money(selectedInvoice.total, selectedInvoice.currency)}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Outstanding balance</p>
              <p className="mt-1 text-lg font-bold text-slate-800">
                {latestBalancePayment
                  ? money(
                      latestBalancePayment.outstanding_balance,
                      selectedInvoice.currency,
                    )
                  : 'Unavailable from current API response'}
              </p>
              {!latestBalancePayment && (
                <p className="mt-1 text-xs text-slate-500">
                  The backend currently provides this value only in payment
                  records. It is unavailable when payment history is empty.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-slate-800">Payment history</h2>

            {payments.length === 0 ? (
              <p className="text-sm text-slate-500">No payments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Status</th>
                      {canManage && <th className="p-3">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-t">
                        <td className="p-3">{formatDate(payment.payment_date)}</td>
                        <td className="p-3">
                          {money(payment.amount, selectedInvoice.currency)}
                        </td>
                        <td className="p-3">{payment.payment_method}</td>
                        <td className="p-3">{payment.reference || '—'}</td>
                        <td className="p-3">{payment.status}</td>
                        {canManage && (
                          <td className="p-3">
                            {payment.status === 'RECORDED' && (
                              <button
                                onClick={() => void handleReversePayment(payment.id)}
                                className="font-medium text-red-600 hover:underline"
                              >
                                Reverse
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {canManage && (
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-slate-800">
                Record payment
              </h2>

              <form onSubmit={handleRecordPayment} className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Amount
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                    placeholder="Enter amount"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Payment method
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank transfer</option>
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Payment date
                  <input
                    type="datetime-local"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Reference (optional)
                  <input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                    placeholder="Transaction reference"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  Note (optional)
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                    placeholder="Payment note"
                  />
                </label>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Recording...' : 'Record payment'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      )}
    </div>
  )
}