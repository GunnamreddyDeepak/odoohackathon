

import { useEffect, useState, type FormEvent } from 'react'
import { apiRequest } from '../services/api'

const frequencies = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const

type BillingFrequency = (typeof frequencies)[number]

type Plan = {
  id: number
  name: string
  description: string | null
  plan_code: string
  billing_frequency: string
  base_price: string
  currency: string
  is_active: boolean
}

type PlanForm = {
  name: string
  description: string
  plan_code: string
  billing_frequency: BillingFrequency
  base_price: string
  currency: string
}

const initialForm: PlanForm = {
  name: '',
  description: '',
  plan_code: '',
  billing_frequency: 'MONTHLY',
  base_price: '',
  currency: 'INR',
}

function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PlanForm>(initialForm)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadPlans = async () => {
    try {
      setLoading(true)
      const data = await apiRequest<Plan[] | { items?: Plan[]; data?: Plan[] }>('/plans')
      setPlans(Array.isArray(data) ? data : data.items || data.data || [])
      setMessage('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const updateField = (field: keyof PlanForm, value: string) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await apiRequest<Plan>('/plans', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          plan_code: form.plan_code.trim(),
          description: form.description.trim() || null,
          base_price: Number(form.base_price),
          is_active: true,
        }),
      })

      setMessage('Plan created successfully!')
      setForm(initialForm)
      setShowForm(false)
      await loadPlans()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create plan')
    } finally {
      setSaving(false)
    }
  }

  const closeForm = () => {
    setShowForm(false)
    setForm(initialForm)
    setMessage('')
  }

  const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  const labelClass = 'text-sm font-semibold text-slate-700'

  return (
    <div className="min-h-screen bg-[#F7F9FD] p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-400">Products / Subscription Plans</p>
          <h1 className="mt-2 text-3xl font-bold text-[#101B35]">Subscription Plans</h1>
          <p className="mt-2 text-sm text-slate-500">Create and manage recurring subscription plans.</p>
        </div>
        <button onClick={() => { setMessage(''); setShowForm(true) }}
          className="rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          + Create Plan
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ['Total Plans', plans.length],
          ['Monthly Plans', plans.filter(p => p.billing_frequency === 'MONTHLY').length],
          ['Yearly Plans', plans.filter(p => p.billing_frequency === 'YEARLY').length],
        ].map(([item, count]) => (
          <div key={item} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item}</p>
            <p className="mt-3 text-3xl font-bold text-[#101B35]">{count}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-[#101B35]">All Plans</h2>
            <p className="mt-1 text-xs text-slate-400">View and manage your subscription plans.</p>
          </div>
          <button onClick={loadPlans} className="text-sm font-semibold text-blue-600">Refresh</button>
        </div>

        {loading ? (
          <p className="p-10 text-center text-slate-500">Loading plans...</p>
        ) : plans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Code</th>
                  <th className="p-4">Frequency</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={plan.id} className="border-t border-slate-100">
                    <td className="p-4 font-semibold text-[#101B35]">{plan.name}</td>
                    <td className="p-4">{plan.plan_code}</td>
                    <td className="p-4">{plan.billing_frequency}</td>
                    <td className="p-4">{plan.currency} {plan.base_price}</td>
                    <td className="p-4">{plan.is_active ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-[250px] flex-col items-center justify-center p-8 text-center">
            <div className="text-4xl">📦</div>
            <h3 className="mt-4 text-lg font-bold text-[#101B35]">No subscription plans available</h3>
            <p className="mt-2 text-sm text-slate-500">Create your first subscription plan.</p>
          </div>
        )}
      </div>

      {message && !showForm && (
        <p className="mt-4 break-words rounded-xl bg-blue-50 p-4 text-sm text-blue-700">{message}</p>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#101B35]">Create Subscription Plan</h2>
                <p className="mt-1 text-sm text-slate-500">Enter the plan information below.</p>
              </div>
              <button type="button" onClick={closeForm} className="text-2xl text-slate-400">×</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className={labelClass}>Plan Name</label>
                <input required minLength={2} value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="Enter plan name" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Plan Code</label>
                <input required value={form.plan_code}
                  onChange={e => updateField('plan_code', e.target.value)}
                  placeholder="Example: BASIC001" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea value={form.description}
                  onChange={e => updateField('description', e.target.value)}
                  placeholder="Describe this plan" rows={2} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Billing Frequency</label>
                <select value={form.billing_frequency}
                  onChange={e => updateField('billing_frequency', e.target.value)}
                  className={inputClass}>
                  {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Price</label>
                  <input required type="number" min="0" step="0.01"
                    value={form.base_price}
                    onChange={e => updateField('base_price', e.target.value)}
                    placeholder="999" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Currency</label>
                  <input required value={form.currency}
                    onChange={e => updateField('currency', e.target.value)}
                    placeholder="INR" className={inputClass} />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
                  {saving ? 'Saving...' : 'Create Plan'}
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
