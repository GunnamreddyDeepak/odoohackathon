
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/dashboard')
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071426] px-4 py-10">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#102b50] via-[#123c70] to-[#0878b9] p-12 text-white lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-2xl font-bold">
                P
              </div>
              <span className="text-2xl font-bold">Planora</span>
            </div>

            <div className="mt-28">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">
                Subscription made simple
              </p>
              <h1 className="max-w-md text-5xl font-bold leading-tight">
                Manage smarter.
                <br />
                Grow faster.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-8 text-blue-100">
                Your subscriptions, products and renewals — all in one
                powerful management platform.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
            <p className="text-lg font-medium leading-7">
              A simpler way to manage every subscription and keep your
              business moving forward.
            </p>
            <p className="mt-4 text-sm text-blue-200">
              — Planora Management Platform
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-7 py-12 sm:px-12 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <span className="text-2xl font-bold text-slate-900">Planora</span>
            </div>

            <div className="mb-9">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
                Welcome
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Access your workspace
              </h2>
              <p className="mt-3 text-slate-500">
                Continue to the Planora Admin and Staff dashboard.
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-800">
                Hackathon Demo Mode
              </p>
              <p className="mt-1 text-sm text-blue-700">
                Authentication API is not connected yet. You can enter the
                frontend demo without credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              className="mt-7 w-full rounded-xl bg-blue-600 py-4 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Enter Workspace →
            </button>

            <p className="mt-9 text-center text-xs text-slate-400">
              © 2026 Planora. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Login


