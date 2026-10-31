import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">Planora</h1>
          <p className="mt-2 text-slate-400">
            Subscription Management System
          </p>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">
            Welcome to Planora
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Manage products, subscription plans, subscriptions and quotations
            from one workspace.
          </p>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-8 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Enter Workspace
          </button>

          <p className="mt-5 text-xs text-slate-500">
            Hackathon demo access
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login