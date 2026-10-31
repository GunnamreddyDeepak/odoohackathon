import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Wallet,
  UserRound,
  Settings,
  Headphones,
  LogOut,
  Sparkles,
} from "lucide-react";
import { logout } from "../../services/auth";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, to: "/" },
  { name: "My Subscriptions", icon: CreditCard, to: "/subscriptions" },
  { name: "My Invoices", icon: FileText, to: "/invoices" },
  { name: "Payment History", icon: Wallet, to: "/payments" },
  { name: "My Account", icon: UserRound, to: "/account" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-[48px] w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition ${
    isActive
      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`;

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sticky top-0 flex h-screen w-[255px] shrink-0 flex-col bg-[#101c3b] px-5 py-8 text-white">
      <div className="mb-12 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600">
          <Sparkles size={23} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planora</h1>
          <p className="mt-0.5 text-xs text-slate-400">Customer Portal</p>
        </div>
      </div>

      <p className="mb-5 px-3 text-[11px] font-semibold uppercase tracking-[2px] text-slate-500">
        Main Menu
      </p>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.name} to={item.to} end={item.to === "/"} className={linkClass}>
              <Icon size={20} className="shrink-0" />
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="mb-5 border-t border-slate-700" />

        <div className="flex flex-col gap-2">
          <NavLink to="/support" className={linkClass}>
            <Headphones size={20} />
            <span className="text-sm font-medium">Help & Support</span>
          </NavLink>

          <NavLink to="/settings" className={linkClass}>
            <Settings size={20} />
            <span className="text-sm font-medium">Settings</span>
          </NavLink>
        </div>

        <div className="mt-6 border-t border-slate-700 pt-5">
          <button
            onClick={handleLogout}
            className="flex min-h-[48px] w-full items-center gap-4 rounded-xl px-4 py-3 text-red-300 transition hover:bg-red-500/10"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;