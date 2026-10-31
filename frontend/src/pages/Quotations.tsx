
import { useState } from 'react'

const statuses = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'] as const

type QuotationStatus = (typeof statuses)[number]

type QuotationForm = {
  customerId: string
  productId: string
  planId: string
  quotationDate: string
  expiryDate: string
  amount: string
  status: QuotationStatus
}

const initialForm: QuotationForm = {
  customerId: '',
  productId: '',
  planId: '',
  quotationDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  amount: '',
  status: 'DRAFT',
}

const Quotations = () => {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<QuotationForm>(initialForm)
  const [message, setMessage] = useState('')

  const updateField = (field: keyof QuotationForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      form.expiryDate &&
      form.quotationDate &&
      form.expiryDate < form.quotationDate
    ) {
      setMessage('Expiry date cannot be earlier than quotation date.')
      return
    }

    setMessage(
      'Quotation details validated. Connect the backend API to save this quotation.',
    )
  }

  const closeForm = () => {
    setShowForm(false)
    setForm(initialForm)
    setMessage('')
  }

  const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  const labelClass = 'text-sm font-semibold text-slate-700'

  return (
    <div className="min-h-screen bg-[#F7F9FD] p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-400">Sales / Quotations</p>
          <h1 className="mt-2 text-3xl font-bold text-[#101B35]">
            Quotations
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Prepare and manage customer subscription quotations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setMessage('')
            setShowForm(true)
          }}
          className="rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Create Quotation
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          'Total Quotations',
          'Pending Quotations',
          'Accepted Quotations',
        ].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item}</p>
            <p className="mt-3 text-3xl font-bold text-[#101B35]">—</p>
            <p className="mt-2 text-xs text-slate-400">
              Awaiting backend data
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-[#101B35]">
            All Quotations
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            View quotation details and customer offers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-5">
          {statuses.map((status) => (
            <span
              key={status}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500"
            >
              {status}
            </span>
          ))}
        </div>

        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            📄
          </div>
          <h3 className="mt-5 text-lg font-bold text-[#101B35]">
            No quotations available
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Customer quotations will appear here when connected to the backend.
          </p>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#101B35]">
                  Create Quotation
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter customer and quotation information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="rounded-lg px-3 py-1 text-2xl text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Customer ID</label>
                  <input
                    required
                    value={form.customerId}
                    onChange={(e) => updateField('customerId', e.target.value)}
                    placeholder="Enter customer ID"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Product ID</label>
                  <input
                    required
                    value={form.productId}
                    onChange={(e) => updateField('productId', e.target.value)}
                    placeholder="Enter product ID"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Subscription Plan ID</label>
                  <input
                    required
                    value={form.planId}
                    onChange={(e) => updateField('planId', e.target.value)}
                    placeholder="Enter plan ID"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Quotation Amount</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => updateField('amount', e.target.value)}
                    placeholder="Enter amount"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Quotation Date</label>
                  <input
                    required
                    type="date"
                    value={form.quotationDate}
                    onChange={(e) =>
                      updateField('quotationDate', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Expiry Date</label>
                  <input
                    required
                    type="date"
                    min={form.quotationDate || undefined}
                    value={form.expiryDate}
                    onChange={(e) => updateField('expiryDate', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Quotation Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateField('status', e.target.value)}
                    className={inputClass}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {message && (
                <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                  {message}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Review Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Quotations
