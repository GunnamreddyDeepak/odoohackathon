
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, setAccessToken } from '../services/api'

type LoginResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

type RegisterResponse = {
  id: number
  full_name: string
  email: string
  role: string
  is_active: boolean
}

type AuthMode = 'login' | 'register'

function Login() {
  const navigate = useNavigate()

  const [mode, setMode] = useState<AuthMode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setError('')
    setSuccess('')
    setPassword('')
    setConfirmPassword('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (mode === 'register' && password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      if (mode === 'register') {
        await apiRequest<RegisterResponse>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            full_name: fullName.trim(),
            email: email.trim(),
            password,
          }),
        })

        // Registration succeeded. Sign in with the new account.
        const result = await apiRequest<LoginResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        })

        if (!result.access_token) {
          throw new Error('Account created, but login did not return a token.')
        }

        setAccessToken(result.access_token)
        await apiRequest('/auth/me')
        navigate('/dashboard')
      } else {
        const result = await apiRequest<LoginResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        })

        if (!result.access_token) {
          throw new Error('Login response did not contain an access token.')
        }

        setAccessToken(result.access_token)
        await apiRequest('/auth/me')
        navigate('/dashboard')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080F25] px-4 py-10">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-2">

        {/* Left branding panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#172B67] via-[#2446A0] to-[#416CF5] p-12 text-white lg:flex">

          <div className="absolute -right-24 top-28 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-12 top-40 h-48 w-48 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-black text-blue-700 shadow-lg">
                P
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Planora
              </span>
            </div>

            <div className="mt-28">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">
                Subscription made simple
              </p>

              <h1 className="mt-5 text-5xl font-bold leading-tight">
                Manage smarter.
                <br />
                Grow faster.
              </h1>

              <p className="mt-6 max-w-sm text-base leading-7 text-blue-100">
                One powerful workspace to manage products, subscription plans,
                customers and recurring business operations.
              </p>
            </div>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm leading-6 text-blue-50">
              Everything your subscription business needs, organized in one
              place.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-blue-200">
              Brightloop · Subscription Management
            </p>
          </div>
        </div>

        {/* Right authentication panel */}
        <div className="flex items-center justify-center bg-white px-7 py-12 sm:px-12 lg:px-14">
          <div className="w-full max-w-md">

            {/* Mobile branding */}
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-black text-white">
                P
              </div>
              <span className="text-2xl font-bold text-slate-900">
                Planora
              </span>
            </div>

            <div className="mb-7">
              <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                Welcome to Planora
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-[#101B35]">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {mode === 'login'
                  ? 'Sign in to access your subscription management workspace.'
                  : 'Get started with your subscription management workspace.'}
              </p>
            </div>

            {/* Mode switch */}
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === 'login'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === 'register'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">

              {mode === 'register' && (
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                  <span className="mr-3 text-slate-400">✉</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                  <span className="mr-3 text-slate-400">●</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="ml-2 text-xs font-semibold text-slate-500 hover:text-blue-600"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#416CF5] to-[#3157D5] py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Sign in to Planora'
                    : 'Create my account'}
                {!loading && <span>→</span>}
              </button>
            </form>

            <div className="mt-7 text-center">
              <p className="text-sm text-slate-500">
                {mode === 'login'
                  ? "Don't have an account?"
                  : 'Already have an account?'}
                <button
                  type="button"
                  onClick={() =>
                    switchMode(mode === 'login' ? 'register' : 'login')
                  }
                  className="ml-1 font-semibold text-blue-600 hover:text-blue-800"
                >
                  {mode === 'login' ? 'Create account' : 'Sign in'}
                </button>
              </p>
            </div>

            <div className="mt-9 border-t border-slate-100 pt-6 text-center">
              <p className="text-xs text-slate-400">
                © 2026 Brightloop. All rights reserved.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Secure subscription management workspace
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
