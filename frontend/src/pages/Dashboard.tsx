import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const Dashboard = () => {
  const navigate = useNavigate()
  const [subs, setSubs] = useState<Subscription[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      setError('Could not load dashboard data. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const customerName = (id: number) =>
    customers.find((c) => c.id === id)?.full_name ?? `Customer #${id}`

  const activeSubs = subs.filter((s) => s.status === 'ACTIVE')
  const monthlyActive = activeSubs.filter((s) => s.billing_frequency === 'MONTHLY')
  const estimatedRevenue = monthlyActive.reduce((sum, s) => sum + Number(s.plan_price), 0)
  const revenueCurrency = monthlyActive[0]?.currency ?? ''
  const recent = subs.slice(0, 5)

  const metrics = [
    { title: 'Total Subscriptions', value: String(subs.length), note: 'From backend' },
    { title: 'Active Subscriptions', value: String(activeSubs.length), note: 'From backend' },
    {
      title: 'Monthly Revenue',
      value: `${revenueCurrency} ${estimatedRevenue.toFixed(2)}`.trim(),
      note: 'Estimated from active monthly subscriptions',
    },
    { title: 'Pending Renewals', value: '—', note: 'Not connected yet' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <main className="min-w-0 flex-1 p-6 lg:p-10">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Overview</p>
            <h2 className="mt-1 text-3xl font-bold text-slate-900">Dashboard</h2>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back! Here's your subscription workspace.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Notifications
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              A
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button
              onClick={loadData}
              className="ml-4 rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm font-medium text-slate-500">{item.title}</p>
              <h3 className="mt-4 text-3xl font-bold text-slate-900">
                {loading || error ? '—' : item.value}
              </h3>
              <p className="mt-3 text-xs text-slate-400">
                {loading ? 'Loading...' : error ? 'Unavailable' : item.note}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
            <h3 className="text-lg font-bold text-slate-900">Subscription Overview</h3>
            <p className="mt-2 text-sm text-slate-500">
              Subscription analytics will appear here when the backend API is connected.
            </p>

            <div className="mt-8 flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-400">Analytics chart coming soon</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>

            <div className="mt-6 space-y-3">
              {[
                { label: 'Create Product', path: '/products' },
                { label: 'Create Subscription Plan', path: '/subscription-plans' },
                { label: 'Create Quotation', path: '/quotations' },
              ].map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  + {action.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Recent Subscriptions</h3>
          <p className="mt-2 text-sm text-slate-500">Latest subscription records from the backend.</p>

          {loading ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-400">
              Loading...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-400">
              Unavailable
            </div>
          ) : recent.length === 0 ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-400">No subscription data available yet.</p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((s) => (
                    <tr key={s.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">{s.subscription_code}</td>
                      <td className="px-4 py-3">{customerName(s.customer_id)}</td>
                      <td className="px-4 py-3">
                        {s.plan_name} ({s.billing_frequency})
                      </td>
                      <td className="px-4 py-3">
                        {s.currency} {Number(s.plan_price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Dashboard