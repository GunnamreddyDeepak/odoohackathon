import { Component, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard/Dashboard";
import Subscriptions from "./pages/Subscriptions/Subscriptions";
import Invoices from "./pages/Invoices/Invoices";
import Payments from "./pages/Payments/Payments";
import Account from "./pages/Account/Account";
import Support from "./pages/Support/Support";
import Settings from "./pages/Settings/Settings";
import Login from "./pages/Login/Login";
import { isLoggedIn } from "./services/auth";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <pre style={{ padding: 24, color: "#b91c1c", whiteSpace: "pre-wrap", fontSize: 14 }}>
          {"Something crashed:\n\n" + this.state.error.message + "\n\n" + (this.state.error.stack ?? "")}
        </pre>
      );
    }
    return this.props.children;
  }
}

function Layout() {
  return (
    <div className="flex min-h-screen bg-[#f5f7fc]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="min-w-0 flex-1">
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function RequireAuth() {
  return isLoggedIn() ? <Layout /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/account" element={<Account />} />
            <Route path="/support" element={<Support />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;