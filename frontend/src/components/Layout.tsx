import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: '▦' },
  { name: 'Products', path: '/products', icon: '◈' },
  { name: 'Subscription Plans', path: '/subscription-plans', icon: '▤' },
  { name: 'Subscriptions', path: '/subscriptions', icon: '⟳' },
  { name: 'Quotations', path: '/quotations', icon: '▧' },
  { name: 'Customers', path: '/customers', icon: '♙' },
]

const Layout = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">

      <aside className="w-full bg-[#0b1930] p-6 text-white lg:min-h-screen lg:w-64">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold">
            S
          </div>
          <h1 className="text-xl font-bold">Planora</h1>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Workspace
        </p>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? 'bg-blue-600 font-semibold text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">Need help?</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Contact your administrator for assistance.
          </p>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="mt-8 w-full rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10"
        >
          ↪ Sign out
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 lg:px-10">
          <div>
            <p className="text-xs text-slate-400">SUBSCRIPTION MANAGEMENT</p>
            <h2 className="mt-1 text-lg font-bold text-slate-800">
              Welcome to Planora
            </h2>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
            A
          </div>
        </header>

        <main className="p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout