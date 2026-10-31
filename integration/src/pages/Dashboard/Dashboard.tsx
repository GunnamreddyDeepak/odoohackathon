import {
  CreditCard,
  Wallet,
  FileText,
  CalendarDays,
  ArrowUpRight,
  CheckCircle2,
  Headphones,
  ArrowRight,
  BarChart3,
  Download,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "May", revenue: 12000 },
  { month: "Jun", revenue: 22000 },
  { month: "Jul", revenue: 18000 },
  { month: "Aug", revenue: 31000 },
  { month: "Sep", revenue: 26000 },
  { month: "Oct", revenue: 42000 },
];

const stats = [
  { title: "Active Subscriptions", value: "03", change: "+12.5%", icon: CreditCard, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { title: "Total Payments", value: "₹15,000", change: "+8.2%", icon: Wallet, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  { title: "Total Invoices", value: "12", change: "+4.3%", icon: FileText, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { title: "Next Payment", value: "₹2,500", change: "Nov 05, 2026", icon: CalendarDays, iconBg: "bg-orange-50", iconColor: "text-orange-600" },
];

const invoices = [
  { id: "INV-2026", description: "Pro Subscription", date: "Oct 28, 2026", amount: "₹4,999", status: "Paid" },
  { id: "INV-2025", description: "Cloud Storage Add-on", date: "Oct 21, 2026", amount: "₹999", status: "Paid" },
  { id: "INV-2024", description: "Business Plan", date: "Oct 15, 2026", amount: "₹2,499", status: "Pending" },
];

/* Inline spacing: cannot be overridden by any global CSS reset */
const sp = {
  page: { maxWidth: 1400, margin: "0 auto", padding: "clamp(20px, 3.5vw, 56px)" },
  card: { padding: "clamp(22px, 2.6vw, 40px)" },
  stat: { padding: "clamp(20px, 2vw, 28px)" },
  banner: { padding: "clamp(28px, 4vw, 56px)" },
  btn: { padding: "14px 24px" },
  btnSm: { padding: "10px 16px" },
  pill: { padding: "6px 16px" },
  th: { padding: "16px 24px" },
  td: { padding: "20px 24px" },
};

const card =
  "rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]";

function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-[#f6f8fc]">
      <div className="flex w-full flex-col gap-10" style={sp.page}>

        {/* PAGE HEADER */}
        <section className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold tracking-[2px] text-blue-600">CUSTOMER PORTAL</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#101c3b] sm:text-4xl">
              Dashboard Overview
            </h1>
            <p className="text-sm text-slate-500 sm:text-base">
              Manage your subscriptions, payments and account details.
            </p>
          </div>

          <button
            style={sp.btn}
            className="flex w-fit items-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
          >
            <Download size={18} />
            Download Report
          </button>
        </section>

        {/* WELCOME BANNER */}
        <section
          style={sp.banner}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#101c3b] via-[#163a7b] to-[#2563b9] text-white shadow-sm"
        >
          <div className="relative z-10 flex max-w-2xl flex-col items-start gap-5">
            <span
              style={sp.pill}
              className="rounded-full border border-white/20 bg-white/10 text-xs font-semibold tracking-wider text-blue-100"
            >
              WELCOME TO PLANORA
            </span>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              Welcome back, Customer!
            </h2>
            <p className="max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
              Here's your account overview. Stay updated with your subscriptions,
              payments and latest activities.
            </p>
          </div>

          <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-5 -top-16 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 right-24 h-72 w-72 rounded-full bg-blue-300/10" />

          <div
            style={{ padding: 32 }}
            className="absolute right-16 top-1/2 hidden -translate-y-1/2 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm xl:block"
          >
            <BarChart3 size={60} className="text-blue-100" />
          </div>
        </section>

        {/* ACCOUNT SUMMARY */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-[#101c3b]">Account Summary</h2>
            <p className="text-sm text-slate-500">A quick look at your account activity.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const isNext = stat.title === "Next Payment";
              return (
                <div
                  key={stat.title}
                  style={sp.stat}
                  className={`${card} flex min-w-0 flex-col gap-6 transition duration-200 hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg} ${stat.iconColor}`}>
                      <Icon size={22} />
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold tracking-tight text-[#101c3b]">{stat.value}</h3>

                  <div className="flex flex-wrap items-center gap-2">
                    {!isNext && <ArrowUpRight size={15} className="text-emerald-600" />}
                    <span className={`text-xs font-semibold ${isNext ? "text-blue-600" : "text-emerald-600"}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-slate-400">
                      {isNext ? "Upcoming payment" : "vs last month"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* REVENUE + CURRENT PLAN */}
        <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">

          {/* Revenue */}
          <div style={sp.card} className={`${card} flex min-w-0 flex-col gap-8 xl:col-span-2`}>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <BarChart3 size={23} />
                  </div>
                  <h2 className="text-2xl font-bold text-[#101c3b]">Revenue Overview</h2>
                </div>
                <p className="text-sm text-slate-500">Your revenue trends over the last six months.</p>
              </div>

              <span
                style={sp.btnSm}
                className="w-fit whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600"
              >
                Last 6 Months
              </span>
            </div>

            <div className="h-[320px] w-full min-w-0 sm:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 15, right: 20, left: 5, bottom: 10 }}>
                  <defs>
                    <linearGradient id="planoraRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#edf0f5" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={12} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    tickFormatter={(v) => `₹${v / 1000}k`}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                    }}
                    formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#planoraRevenue)"
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Current subscription */}
          <div
            style={sp.card}
            className="relative flex min-w-0 flex-col justify-between gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#101c3b] to-[#19468e] text-white shadow-sm"
          >
            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold tracking-[2px] text-blue-200">YOUR CURRENT PLAN</p>
                  <h2 className="text-2xl font-bold">Current Subscription</h2>
                </div>
                <span
                  style={sp.pill}
                  className="shrink-0 rounded-full bg-emerald-400/15 text-xs font-semibold text-emerald-300"
                >
                  Active
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-3xl font-bold">Pro Plan</h3>
                <p className="text-3xl font-bold">
                  ₹4,999
                  <span className="ml-2 text-base font-normal text-blue-200">/ month</span>
                </p>
              </div>

              <div className="border-t border-white/15" />

              <div className="flex flex-col gap-4">
                {["Access to premium features", "Priority support", "Unlimited projects"].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
                    <span className="text-sm text-blue-50">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              style={sp.btn}
              className="relative z-10 flex w-full items-center justify-center gap-3 rounded-xl bg-white text-sm font-bold text-[#101c3b] transition hover:bg-blue-50"
            >
              Manage Subscription
              <ArrowRight size={18} />
            </button>

            <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full border border-blue-200/15" />
          </div>
        </section>

        {/* RECENT INVOICES */}
        <section style={sp.card} className={`${card} flex flex-col gap-8`}>
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-[#101c3b]">Recent Invoices</h2>
              <p className="text-sm text-slate-500">View your latest billing activity.</p>
            </div>

            <button
              style={sp.btnSm}
              className="flex items-center gap-2 rounded-xl text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              View All
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th style={sp.th} className="rounded-l-xl">Invoice ID</th>
                  <th style={sp.th}>Description</th>
                  <th style={sp.th}>Date</th>
                  <th style={sp.th}>Amount</th>
                  <th style={sp.th} className="rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                    <td style={sp.td} className="whitespace-nowrap text-sm font-semibold text-blue-600">{inv.id}</td>
                    <td style={sp.td} className="whitespace-nowrap text-sm text-slate-700">{inv.description}</td>
                    <td style={sp.td} className="whitespace-nowrap text-sm text-slate-500">{inv.date}</td>
                    <td style={sp.td} className="whitespace-nowrap text-sm font-semibold text-slate-800">{inv.amount}</td>
                    <td style={sp.td}>
                      <span
                        style={sp.pill}
                        className={`inline-flex rounded-full text-xs font-semibold ${
                          inv.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SUPPORT */}
        <section
          style={sp.card}
          className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-100"
        >
          <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <Headphones size={27} />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-[#101c3b]">Need Help?</h2>
                <p className="max-w-xl text-sm leading-7 text-slate-600">
                  Have questions about your subscriptions or payments? Our support
                  team is here to help you.
                </p>
              </div>
            </div>

            <button
              style={{ padding: "16px 28px" }}
              className="flex w-fit shrink-0 items-center justify-center gap-3 rounded-xl bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Contact Support
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 text-center" style={{ paddingTop: 32 }}>
          <p className="text-xs text-slate-400">© 2026 Planora. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;