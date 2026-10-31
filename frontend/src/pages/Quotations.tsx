import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import api from '../services/api'

type Subscription = {
  id: number
  subscription_code: string
  customer_id: number
  status: string
  plan_name: string
  plan_price: string | number
  currency: string
  billing_frequency: string
  start_date: string
}

type Customer = { id: number; full_name: string }

const Quotations = () => {
  const navigate = useNavigate()
  const [subs, setSubs] = useState<Subscription[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [s, c] = await Promise.all([
        api.get<Subscription[]>('/subscriptions'),
        api.get<Customer[]>('/customers'),
      ])
      setSubs(s.data)
      setCustomers(c.data)
    } catch {
      setError('Could not load quotations. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const confirmQuotation = async (id: number) => {
    try {
      setActionError('')
      await api.patch(`/subscriptions/${id}/status`, { status: 'CONFIRMED' })
      await loadData()
    } catch (err) {
      let text = 'Could not confirm the quotation.'
      if (axios.isAxiosError(err) && typeof err.response?.data?.detail === 'string') {
        text = err.response.data.detail
      }
      setActionError(text)
    }
  }

  const customerName = (id: number) =>
    customers.find((c) => c.id === id)?.full_name ?? `Customer #${id}`

  const quotations = subs.filter((s) => s.status === 'QUOTATION')
  const draftCount = subs.filter((s) => s.status === 'DRAFT').length
  const totalValue = quotations.reduce((sum, s) => sum + Number(s.plan_price), 0)
  const currency = quotations[0]?.currency ?? ''

  const stats = [
    { label: 'Total Quotations', value: String(quotations.length), note: 'Subscriptions in QUOTATION status' },
    { label: 'Draft Subscriptions', value: String(draftCount), note: 'Can be moved to QUOTATION' },
    { label: 'Quoted Value', value: `${currency} ${totalValue.toFixed(2)}`.trim(), note: 'Sum of quoted plan prices' },
  ]

  return (
    <div className="min-h-screen bg-[#F7F9FD] p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-400">Sales / Quotations</p>
          <h1 className="mt-2 text-3xl font-bold text-[#101B35]">Quotations</h1>
          <p className="mt-2 text-sm text-slate-500">
            Subscriptions currently at the quotation stage.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/subscriptions')}
          className="rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Create via Subscriptions
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-[#101B35]">
              {loading || error ? '—' : item.value}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {loading ? 'Loading...' : error ? 'Unavailable' : item.note}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-[#101B35]">All Quotations</h2>
          <p className="mt-1 text-xs text-slate-400">
            To create one: make a subscription, then move it to QUOTATION on the Subscriptions page.
          </p>
        </div>

        {actionError && (
          <p className="border-b border-slate-100 bg-amber-50 px-5 py-3 text-sm text-amber-800">
            {actionError}
          </p>
        )}

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Loading quotations...</div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : quotations.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              📄
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#101B35]">No quotations available</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              No subscriptions are in QUOTATION status right now.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Start</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-[#101B35]">{s.subscription_code}</td>
                    <td className="px-5 py-3">{customerName(s.customer_id)}</td>
                    <td className="px-5 py-3">
                      {s.plan_name} ({s.billing_frequency})
                    </td>
                    <td className="px-5 py-3">
                      {s.currency} {Number(s.plan_price).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">{s.start_date}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => confirmQuotation(s.id)}
                        className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Confirm
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Quotations