import { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../services/api'

const statuses = ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED'] as const

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['QUOTATION', 'CONFIRMED', 'CLOSED'],
  QUOTATION: ['DRAFT', 'CONFIRMED', 'CLOSED'],
  CONFIRMED: ['ACTIVE', 'CLOSED'],
  ACTIVE: ['PAUSED', 'CLOSED'],
  PAUSED: ['ACTIVE', 'CLOSED'],
  CLOSED: [],
}

type Subscription = {
  id: number
  subscription_code: string
  customer_id: number
  plan_id: number | null
  status: string
  start_date: string
  end_date: string | null
  next_billing_date: string | null
  plan_name: string
  plan_price: string | number
  currency: string
  billing_frequency: string
}

type Customer = { id: number; customer_code: string; full_name: string; is_active: boolean }
type Plan = {
  id: number
  name: string
  plan_code: string
  base_price: string | number
  currency: string
  billing_frequency: string
  is_active: boolean
}

const getErrorText = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return 'Please check the entered values (dates and code).'
  }
  return fallback
}

const Subscriptions = () => {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('ALL')
  const [actionError, setActionError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [code, setCode] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [planId, setPlanId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const loadAll = async () => {
    try {
      setLoading(true)
      setError(null)
      const [s, c, p] = await Promise.all([
        api.get<Subscription[]>('/subscriptions'),
        api.get<Customer[]>('/customers'),
        api.get<Plan[]>('/plans'),
      ])
      setSubs(s.data)
      setCustomers(c.data)
      setPlans(p.data)
    } catch {
      setError('Could not load subscriptions. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const closeForm = () => {
    setShowForm(false)
    setMessage('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setSaving(true)
      setMessage('')
      await api.post('/subscriptions', {
        subscription_code: code,
        customer_id: Number(customerId),
        plan_id: Number(planId),
        start_date: startDate,
        end_date: endDate || null,
      })
      setCode('')
      setCustomerId('')
      setPlanId('')
      setStartDate('')
      setEndDate('')
      setShowForm(false)
      await loadAll()
    } catch (err) {
      setMessage(getErrorText(err, 'Could not save the subscription.'))
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async (id: number, status: string) => {
    if (!status) return
    try {
      setActionError('')
      await api.patch(`/subscriptions/${id}/status`, { status })
      await loadAll()
    } catch (err) {
      setActionError(getErrorText(err, 'Could not change status.'))
    }
  }

  const customerName = (id: number) =>
    customers.find((c) => c.id === id)?.full_name ?? `Customer #${id}`

  const activeCustomers = customers.filter((c) => c.is_active)
  const activePlans = plans.filter((p) => p.is_active)
  const visible = filter === 'ALL' ? subs : subs.filter((s) => s.status === filter)

  const stats = [
    { label: 'Total Subscriptions', value: subs.length },
    { label: 'Active Subscriptions', value: subs.filter((s) => s.status === 'ACTIVE').length },
    { label: 'Paused Subscriptions', value: subs.filter((s) => s.status === 'PAUSED').length },
  ]

  const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
  const labelClass = 'text-sm font-semibold text-slate-700'

  return (
    <div className="min-h-screen bg-[#F7F9FD] p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-400">Subscriptions / Management</p>
          <h1 className="mt-2 text-3xl font-bold text-[#101B35]">Subscriptions</h1>
          <p className="mt-2 text-sm text-slate-500">
            Track and manage customer subscription lifecycles.
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
          + New Subscription
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
              {loading ? 'Loading...' : error ? 'Unavailable' : 'From backend'}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-[#101B35]">All Subscriptions</h2>
          <p className="mt-1 text-xs text-slate-400">
            Monitor subscription details and lifecycle status.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-5">
          {['ALL', ...statuses].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                filter === s ? 'bg-[#5277F7] text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {actionError && (
          <p className="border-b border-slate-100 bg-amber-50 px-5 py-3 text-sm text-amber-800">
            {actionError}
          </p>
        )}

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Loading subscriptions...</div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadAll}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              🔄
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#101B35]">No subscriptions available</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {filter === 'ALL'
                ? 'No subscriptions have been created yet.'
                : `No subscriptions with status ${filter}.`}
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
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Change</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
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
                    <td className="px-5 py-3">{s.status}</td>
                    <td className="px-5 py-3">
                      {ALLOWED_TRANSITIONS[s.status]?.length ? (
                        <select
                          value=""
                          onChange={(e) => changeStatus(s.id, e.target.value)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        >
                          <option value="">Move to...</option>
                          {ALLOWED_TRANSITIONS[s.status].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#101B35]">Create Subscription</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the subscription details below. New subscriptions start as DRAFT.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg px-3 py-1 text-2xl text-slate-400 hover:bg-slate-100"
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Subscription Code *</label>
                  <input
                    required
                    minLength={2}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. SUB-001"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Customer *</label>
                  <select
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select customer</option>
                    {activeCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customer_code} - {c.full_name}
                      </option>
                    ))}
                  </select>
                  {activeCustomers.length === 0 && (
                    <p className="mt-1 text-xs text-amber-700">No active customers. Create one first.</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Plan *</label>
                  <select
                    required
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select plan</option>
                    {activePlans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.plan_code} - {p.name} ({p.currency} {Number(p.base_price).toFixed(2)},{' '}
                        {p.billing_frequency})
                      </option>
                    ))}
                  </select>
                  {activePlans.length === 0 && (
                    <p className="mt-1 text-xs text-amber-700">No active plans. Create one first.</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Start Date *</label>
                  <input
                    required
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>End Date</label>
                  <input
                    type="date"
                    min={startDate || undefined}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {message && (
                <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{message}</p>
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
                  disabled={saving}
                  className="rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Create Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Subscriptions