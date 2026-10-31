
import { useCallback, useEffect, useState } from 'react'
import {
  getCurrentUser,
  getCustomers,
  getSubscriptionPlans,
  getSubscriptions,
  createSubscription,
  updateSubscriptionStatus,
  type Customer,
  type Subscription,
  type SubscriptionPlan,
} from '../services/api'

const statuses = [
  'DRAFT',
  'QUOTATION',
  'CONFIRMED',
  'ACTIVE',
  'PAUSED',
  'CLOSED',
] as const

const allowedTransitions: Record<string, string[]> = {
  DRAFT: ['QUOTATION', 'CONFIRMED', 'CLOSED'],
  QUOTATION: ['DRAFT', 'CONFIRMED', 'CLOSED'],
  CONFIRMED: ['ACTIVE', 'CLOSED'],
  ACTIVE: ['PAUSED', 'CLOSED'],
  PAUSED: ['ACTIVE', 'CLOSED'],
  CLOSED: [],
}

const initialForm = {
  subscription_code: '',
  customer_id: '',
  plan_id: '',
  start_date: '',
  end_date: '',
  next_billing_date: '',
}

const inputClass =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

const labelClass = 'text-sm font-semibold text-slate-700'

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [isStaff, setIsStaff] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const user = await getCurrentUser()
      const staff = ['ADMIN', 'STAFF'].includes(user.role.toUpperCase())
      setIsStaff(staff)

      const subscriptionData = await getSubscriptions()
      setSubscriptions(subscriptionData)

      if (staff) {
        const [customerData, planData] = await Promise.all([
          getCustomers(),
          getSubscriptionPlans(),
        ])

        setCustomers(customerData.filter((customer) => customer.is_active))
        setPlans(planData.filter((plan) => plan.is_active))
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load subscriptions.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!form.customer_id || !form.plan_id || !form.start_date) {
      setError('Please select a customer, plan, and start date.')
      return
    }

    if (form.end_date && form.end_date < form.start_date) {
      setError('End date cannot be before start date.')
      return
    }

    if (
      form.next_billing_date &&
      form.next_billing_date < form.start_date
    ) {
      setError('Next billing date cannot be before start date.')
      return
    }

    setSaving(true)

    try {
      await createSubscription({
        subscription_code: form.subscription_code.trim(),
        customer_id: Number(form.customer_id),
        plan_id: Number(form.plan_id),
        start_date: form.start_date,
        end_date: form.end_date || null,
        next_billing_date: form.next_billing_date || null,
      })

      setMessage('Subscription created successfully.')
      setForm(initialForm)
      setShowForm(false)
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not create subscription.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (
    subscriptionId: number,
    newStatus: string,
  ) => {
    setError('')
    setMessage('')

    try {
      await updateSubscriptionStatus(subscriptionId, newStatus)
      setMessage('Subscription status updated.')
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update status.',
      )
    }
  }

  const closeForm = () => {
    setShowForm(false)
    setForm(initialForm)
    setError('')
  }

  const activeCount = subscriptions.filter(
    (item) => item.status === 'ACTIVE',
  ).length

  const pausedCount = subscriptions.filter(
    (item) => item.status === 'PAUSED',
  ).length

  const statusClass = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      PAUSED: 'bg-amber-100 text-amber-700',
      CLOSED: 'bg-red-100 text-red-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      QUOTATION: 'bg-purple-100 text-purple-700',
      DRAFT: 'bg-slate-100 text-slate-600',
    }

    return styles[status] || 'bg-slate-100 text-slate-600'
  }

  return (
    <div className="min-h-screen bg-[#F7F9FD] p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-400">
            Subscriptions / Management
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#101B35]">
            Subscriptions
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Track and manage customer subscription lifecycles.
          </p>
        </div>

        {isStaff && (
          <button
            type="button"
            onClick={() => {
              setError('')
              setMessage('')
              setShowForm(true)
            }}
            className="rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + New Subscription
          </button>
        )}
      </div>

      {message && (
        <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { title: 'Total Subscriptions', value: subscriptions.length },
          { title: 'Active Subscriptions', value: activeCount },
          { title: 'Paused Subscriptions', value: pausedCount },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.title}</p>
            <p className="mt-3 text-3xl font-bold text-[#101B35]">
              {loading ? '...' : item.value}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Live backend data
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-[#101B35]">
            All Subscriptions
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Subscription details and lifecycle status.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-5">
          {statuses.map((status) => (
            <span
              key={status}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusClass(status)}`}
            >
              {status}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading subscriptions...
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center p-8 text-center">
            <div className="text-4xl">📋</div>
            <h3 className="mt-4 font-bold text-[#101B35]">
              No subscriptions available
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Subscriptions will appear here when created.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-4">Subscription</th>
                  <th className="p-4">Customer ID</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">Status</th>
                  {isStaff && <th className="p-4">Update Status</th>}
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr
                    key={subscription.id}
                    className="border-t border-slate-100"
                  >
                    <td className="p-4 font-semibold text-[#101B35]">
                      {subscription.subscription_code}
                    </td>
                    <td className="p-4">{subscription.customer_id}</td>
                    <td className="p-4">
                      <div className="font-medium">
                        {subscription.plan_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {subscription.billing_frequency}
                      </div>
                    </td>
                    <td className="p-4">
                      {subscription.currency}{' '}
                      {Number(subscription.plan_price).toFixed(2)}
                    </td>
                    <td className="p-4">{subscription.start_date}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(subscription.status)}`}
                      >
                        {subscription.status}
                      </span>
                    </td>
                    {isStaff && (
                      <td className="p-4">
                        {allowedTransitions[subscription.status]?.length ? (
                          <select
                            className="rounded-lg border border-slate-200 p-2 text-xs"
                            value=""
                            onChange={(event) => {
                              if (event.target.value) {
                                void handleStatusChange(
                                  subscription.id,
                                  event.target.value,
                                )
                              }
                            }}
                          >
                            <option value="">Change status</option>
                            {allowedTransitions[subscription.status].map(
                              (status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ),
                            )}
                          </select>
                        ) : (
                          <span className="text-xs text-slate-400">
                            No actions
                          </span>
                        )}
                      </td>
                    )}
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
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#101B35]">
                  Create Subscription
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select a customer and an active subscription plan.
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

            <form onSubmit={handleCreate} className="mt-6 space-y-5">
              <div>
                <label className={labelClass}>Subscription Code</label>
                <input
                  required
                  minLength={2}
                  maxLength={50}
                  value={form.subscription_code}
                  onChange={(e) =>
                    updateField('subscription_code', e.target.value)
                  }
                  placeholder="Example: SUB-2026-001"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Customer</label>
                <select
                  required
                  value={form.customer_id}
                  onChange={(e) => updateField('customer_id', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name} ({customer.customer_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Subscription Plan</label>
                <select
                  required
                  value={form.plan_id}
                  onChange={(e) => updateField('plan_id', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select plan</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — {plan.currency}{' '}
                      {Number(plan.base_price).toFixed(2)} /{' '}
                      {plan.billing_frequency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input
                    required
                    type="date"
                    value={form.start_date}
                    onChange={(e) => updateField('start_date', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>End Date</label>
                  <input
                    type="date"
                    min={form.start_date || undefined}
                    value={form.end_date}
                    onChange={(e) => updateField('end_date', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Next Billing Date</label>
                  <input
                    type="date"
                    min={form.start_date || undefined}
                    value={form.next_billing_date}
                    onChange={(e) =>
                      updateField('next_billing_date', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <p className="rounded-xl bg-blue-50 p-4 text-xs text-blue-700">
                New subscriptions are automatically created with DRAFT status.
                Plan pricing and billing frequency are copied from the selected
                plan by the backend.
              </p>

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
                  disabled={saving || customers.length === 0 || plans.length === 0}
                  className="rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Subscription'}
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
