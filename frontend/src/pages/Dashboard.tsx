
import { useNavigate } from 'react-router-dom'
const Dashboard = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">

      {/* Main content */}
      <main className="min-w-0 flex-1 p-6 lg:p-10">

        {/* Header */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Overview</p>
            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              Dashboard
            </h2>
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

        {/* Metric cards - waiting for backend API */}
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { title: 'Total Subscriptions', value: '—', note: 'Awaiting API data' },
            { title: 'Active Subscriptions', value: '—', note: 'Awaiting API data' },
            { title: 'Monthly Revenue', value: '—', note: 'Awaiting API data' },
            { title: 'Pending Renewals', value: '—', note: 'Awaiting API data' },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm font-medium text-slate-500">
                {item.title}
              </p>
              <h3 className="mt-4 text-3xl font-bold text-slate-900">
                {item.value}
              </h3>
              <p className="mt-3 text-xs text-slate-400">
                {item.note}
              </p>
            </div>
          ))}
        </section>

        {/* Dashboard content */}
        <section className="mt-8 grid gap-6 xl:grid-cols-3">

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
            <h3 className="text-lg font-bold text-slate-900">
              Subscription Overview
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Subscription analytics will appear here when the backend API is connected.
            </p>

            <div className="mt-8 flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-400">
                Analytics chart coming soon
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
  <h3 className="text-lg font-bold text-slate-900">
    Quick Actions
  </h3>

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

        {/* Recent subscriptions */}
        <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Recent Subscriptions
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Recent subscription records will be displayed here once the backend API is connected.
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-400">
              No subscription data available yet.
            </p>
          </div>
        </section>

      </main>
    </div>
  )
}

export default Dashboard
