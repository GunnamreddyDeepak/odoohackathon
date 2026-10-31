
import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import SubscriptionPlans from './pages/SubscriptionPlans'
import Subscriptions from './pages/Subscriptions'
import Invoices from './pages/Invoices'
import Quotations from './pages/Quotations'
import Customers from './pages/Customers'
import Layout from './components/Layout'

import {
  clearToken,
  getCurrentUser,
  getToken,
  type User,
} from './services/api'

function ProtectedRoute() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }

    getCurrentUser()
      .then(setUser)
      .catch(() => {
        clearToken()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Checking authentication...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route
              path="/subscription-plans"
              element={<SubscriptionPlans />}
            />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/customers" element={<Customers />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
