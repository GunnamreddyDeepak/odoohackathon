
import { useEffect, useState, type FormEvent } from 'react'
import { apiRequest } from '../services/api'

const frequencies = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const

type Subscription = {
  id: number
  subscription_code: string
  customer_id: number
  plan_id: number
  status: string
  start_date: string
  end_date: string | null
  next_billing_date: string
  plan_name: string
  plan_price: string
  currency: string
  billing_frequency: string
}

type SubscriptionForm = {
  subscription_code: string
  customer_id: string
  plan_id: string
  start_date: string
  end_date: string
  next_billing_date: string
  plan_name: string
  plan_price: string
  currency: string
  billing_frequency: typeof frequencies[number]
  created_by: string
}

const initialForm: SubscriptionForm = {
  subscription_code: '',
  customer_id: '',
  plan_id: '',
  start_date: '',
  end_date: '',
  next_billing_date: '',
  plan_name: '',
  plan_price: '',
  currency: 'INR',
  billing_frequency: 'MONTHLY',
  created_by: '',
}

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<SubscriptionForm>(initialForm)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const data = await apiRequest<Subscription[] | { items?: Subscription[]; data?: Subscription[] }>('/subscriptions')
      setSubscriptions(Array.isArray(data) ? data : data.items || data.data || [])
      setMessage('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const updateField = (field: keyof SubscriptionForm, value: string) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await apiRequest<Subscription>('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          subscription_code: form.subscription_code.trim(),
          customer_id: Number(form.customer_id),
          plan_id: Number(form.plan_id),
          start_date: form.start_date,
          end_date: form.end_date || null,
          next_billing_date: form.next_billing_date,
          plan_name: form.plan_name.trim(),
          plan_price: Number(form.plan_price),
          currency: form.currency.trim().toUpperCase(),
          billing_frequency: form.billing_frequency,
          created_by: Number(form.created_by),
          creation_source: 'USER',
        }),
      })

      setShowForm(false)
      setForm(initialForm)
      setMessage('Subscription created successfully!')
      await loadSubscriptions()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create subscription')
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

  const activeCount = subscriptions.filter(s => s.status === 'ACTIVE').length
  const pausedCount = subscriptions.filter(s => s.status === 'PAUSED').length

  return (
    <div className="min-h-screen bg-[#F7F9FD] p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-400">Subscriptions / Management</p>
          <h1 className="mt-2 text-3xl font-bold text-[#101B35]">Subscriptions</h1>
          <p className="mt-2 text-sm text-slate-500">Track and manage customer subscription lifecycles.</p>
        </div>
        <button onClick={() => { setMessage(''); setShowForm(true) }}
          className="rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          + New Subscription
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ['Total Subscriptions', subscriptions.length],
          ['Active Subscriptions', activeCount],
          ['Paused Subscriptions', pausedCount],
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
            <h2 className="text-lg font-bold text-[#101B35]">All Subscriptions</h2>
            <p className="mt-1 text-xs text-slate-400">Monitor subscription details and lifecycle status.</p>
          </div>
          <button onClick={loadSubscriptions} className="text-sm font-semibold text-blue-600">Refresh</button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-5">
          {frequencies.map(f => (
            <span key={f} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">{f}</span>
          ))}
        </div>

        {loading ? (
          <p className="p-10 text-center text-slate-500">Loading subscriptions...</p>
        ) : subscriptions.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Subscription</th>
                  <th className="p-4">Customer ID</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Next Billing</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(s => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="p-4 font-semibold">{s.subscription_code}</td>
                    <td className="p-4">{s.customer_id}</td>
                    <td className="p-4">{s.plan_name}</td>
                    <td className="p-4">{s.currency} {s.plan_price}</td>
                    <td className="p-4">{s.next_billing_date}</td>
                    <td className="p-4">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-[250px] flex-col items-center justify-center p-8 text-center">
            <div className="text-4xl">🔄</div>
            <h3 className="mt-4 text-lg font-bold text-[#101B35]">No subscriptions available</h3>
            <p className="mt-2 text-sm text-slate-500">Create your first subscription.</p>
          </div>
        )}
      </div>

      {message && !showForm && (
        <p className="mt-4 break-words rounded-xl bg-blue-50 p-4 text-sm text-blue-700">{message}</p>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#101B35]">Create Subscription</h2>
                <p className="mt-1 text-sm text-slate-500">Enter the subscription details below.</p>
              </div>
              <button type="button" onClick={closeForm} className="text-2xl text-slate-400">×</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ['subscription_code', 'Subscription Code', 'SUB001'],
                  ['customer_id', 'Customer ID', '1'],
                  ['plan_id', 'Plan ID', '1'],
                  ['created_by', 'Created By (User ID)', '1'],
                  ['plan_name', 'Plan Name', 'Premium Plan'],
                  ['plan_price', 'Plan Price', '999'],
                  ['currency', 'Currency', 'INR'],
                ] as const).map(([field, label, placeholder]) => (
                  <div key={field}>
                    <label className={labelClass}>{label}</label>
                    <input required
                      type={['customer_id', 'plan_id', 'created_by', 'plan_price'].includes(field) ? 'number' : 'text'}
                      min={['customer_id', 'plan_id', 'created_by', 'plan_price'].includes(field) ? '0' : undefined}
                      step={field === 'plan_price' ? '0.01' : undefined}
                      value={form[field]}
                      onChange={e => updateField(field, e.target.value)}
                      placeholder={placeholder} className={inputClass} />
                  </div>
                ))}

                <div>
                  <label className={labelClass}>Billing Frequency</label>
                  <select value={form.billing_frequency}
                    onChange={e => updateField('billing_frequency', e.target.value)}
                    className={inputClass}>
                    {frequencies.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Start Date</label>
                  <input required type="date" value={form.start_date}
                    onChange={e => updateField('start_date', e.target.value)} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>End Date</label>
                  <input type="date" min={form.start_date || undefined} value={form.end_date}
                    onChange={e => updateField('end_date', e.target.value)} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Next Billing Date</label>
                  <input required type="date" value={form.next_billing_date}
                    onChange={e => updateField('next_billing_date', e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600">Cancel</button>
                <button type="submit" disabled={saving}
                  className="rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
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
