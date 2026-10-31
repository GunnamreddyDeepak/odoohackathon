import { useEffect, useState } from 'react'
import api from '../services/api'

type Customer = {
  id: number
  customer_code: string
  full_name: string
  email: string | null
  phone: string | null
  address: string | null
  user_id: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get<Customer[]>('/customers')
      setCustomers(res.data)
    } catch {
      setError('Could not load customers. Check that the backend is running and the customers table exists.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const activeCount = customers.filter((c) => c.is_active).length
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const newCount = customers.filter((c) => new Date(c.created_at).getTime() > thirtyDaysAgo).length
  const stats = [
    { label: 'Total Customers', value: customers.length },
    { label: 'Active Customers', value: activeCount },
    { label: 'New Customers (30 days)', value: newCount },
  ]

  return (
    <div className="min-h-screen bg-[#F7F9FD] p-5 md:p-8">
      <div>
        <p className="text-sm text-slate-400">Management / Customers</p>
        <h1 className="mt-2 text-3xl font-bold text-[#101B35]">
          Customers
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          View and manage customer information.
        </p>
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
          <h2 className="text-lg font-bold text-[#101B35]">Customer Directory</h2>
          <p className="mt-1 text-xs text-slate-400">
            Customer records from the backend appear here.
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Loading customers...</div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadCustomers}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              👥
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#101B35]">
              No customer records available
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              No customers have been created yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-[#101B35]">{c.customer_code}</td>
                    <td className="px-5 py-3">{c.full_name}</td>
                    <td className="px-5 py-3">{c.email ?? '—'}</td>
                    <td className="px-5 py-3">{c.phone ?? '—'}</td>
                    <td className="px-5 py-3">{c.is_active ? 'Active' : 'Inactive'}</td>
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

export default Customers