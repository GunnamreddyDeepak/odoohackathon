import { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../services/api'

type Plan = {
  id: number
  name: string
  description: string | null
  plan_code: string
  billing_frequency: string
  base_price: string | number
  currency: string
  is_active: boolean
}

const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [planCode, setPlanCode] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState('MONTHLY')
  const [basePrice, setBasePrice] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const loadPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get<Plan[]>('/plans')
      setPlans(res.data)
    } catch {
      setError('Could not load subscription plans. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const closeModal = () => {
    setShowModal(false)
    setMessage('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setSaving(true)
      setMessage('')
      await api.post('/plans', {
        name,
        plan_code: planCode,
        description: description || null,
        billing_frequency: frequency,
        base_price: Number(basePrice),
        currency: currency.toUpperCase(),
        is_active: true,
      })
      setName('')
      setPlanCode('')
      setDescription('')
      setFrequency('MONTHLY')
      setBasePrice('')
      setCurrency('INR')
      setShowModal(false)
      await loadPlans()
    } catch (err) {
      let text = 'Could not save the plan.'
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail
        if (typeof detail === 'string') text = detail
        else if (Array.isArray(detail)) text = 'Please check the entered values (name and code need at least 2 characters, currency needs 3 letters).'
      }
      setMessage(text)
    } finally {
      setSaving(false)
    }
  }

  const activeCount = plans.filter((p) => p.is_active).length
  const monthlyCount = plans.filter((p) => p.billing_frequency === 'MONTHLY').length
  const stats = [
    { label: 'Total Plans', value: plans.length },
    { label: 'Active Plans', value: activeCount },
    { label: 'Monthly Plans', value: monthlyCount },
  ]

  return (
    <div className="min-h-screen bg-[#F7F9FD] p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-400">Billing / Subscription Plans</p>
          <h1 className="mt-2 text-3xl font-bold text-[#101B35]">Subscription Plans</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create and manage recurring billing plans.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
        >
          + Add Plan
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
          <h2 className="text-lg font-bold text-[#101B35]">All Plans</h2>
          <p className="mt-1 text-xs text-slate-400">Plans and their billing details</p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Loading plans...</div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadPlans}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              🔁
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#101B35]">No subscription plans yet</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              No plans have been created yet.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-5 rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Create your first plan
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Billing</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-[#101B35]">{p.plan_code}</td>
                    <td className="px-5 py-3">{p.name}</td>
                    <td className="px-5 py-3">{p.billing_frequency}</td>
                    <td className="px-5 py-3">
                      {p.currency} {Number(p.base_price).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">{p.is_active ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101B35]/50 p-4">
          <div className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#101B35]">Add Plan</h2>
                <p className="mt-1 text-sm text-slate-500">Enter plan information</p>
              </div>
              <button onClick={closeModal} className="text-xl text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Plan Name *</label>
                  <input
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Basic Monthly"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Plan Code *</label>
                  <input
                    required
                    minLength={2}
                    value={planCode}
                    onChange={(e) => setPlanCode(e.target.value)}
                    placeholder="e.g. PLAN-001"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Describe the plan"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Billing *</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Base Price *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="499"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Currency *</label>
                  <input
                    required
                    minLength={3}
                    maxLength={3}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="INR"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {message && (
                <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{message}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-1/2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 rounded-xl bg-[#5277F7] py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubscriptionPlans