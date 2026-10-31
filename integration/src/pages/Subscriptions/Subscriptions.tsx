import { CheckCircle2, Clock, PauseCircle, XCircle, ArrowRight } from "lucide-react";

type Status = "Active" | "Pending" | "Paused" | "Closed";

interface Subscription {
  id: string;
  plan: string;
  product: string;
  frequency: string;
  price: string;
  startDate: string;
  renewalDate: string;
  status: Status;
}

const subscriptions: Subscription[] = [
  { id: "SUB-1001", plan: "Pro Plan", product: "Planora Pro", frequency: "Monthly", price: "₹4,999", startDate: "May 05, 2026", renewalDate: "Nov 05, 2026", status: "Active" },
  { id: "SUB-1002", plan: "Storage Add-on", product: "Cloud Storage", frequency: "Monthly", price: "₹999", startDate: "Jun 12, 2026", renewalDate: "Nov 12, 2026", status: "Active" },
  { id: "SUB-1003", plan: "Business Plan", product: "Planora Business", frequency: "Yearly", price: "₹24,999", startDate: "Aug 01, 2026", renewalDate: "Aug 01, 2027", status: "Active" },
  { id: "SUB-1004", plan: "Starter Plan", product: "Planora Starter", frequency: "Monthly", price: "₹499", startDate: "Jan 10, 2026", renewalDate: "-", status: "Closed" },
];

const badge: Record<Status, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-orange-50 text-orange-700",
  Paused: "bg-slate-100 text-slate-600",
  Closed: "bg-red-50 text-red-600",
};

const summary = [
  { label: "Active", icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
  { label: "Pending", icon: Clock, bg: "bg-orange-50", color: "text-orange-600" },
  { label: "Paused", icon: PauseCircle, bg: "bg-slate-100", color: "text-slate-600" },
  { label: "Closed", icon: XCircle, bg: "bg-red-50", color: "text-red-600" },
] as const;

/* Inline spacing: cannot be overridden by a global CSS reset */
const sp = {
  page: { maxWidth: 1400, margin: "0 auto", padding: "clamp(20px, 3.5vw, 56px)" },
  stat: { padding: 28 },
  card: { padding: "clamp(22px, 2.6vw, 40px)" },
  th: { padding: "16px 24px" },
  td: { padding: "20px 24px" },
  pill: { padding: "6px 16px" },
  btn: { padding: "10px 16px" },
};

const card = "rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]";

function Subscriptions() {
  const count = (s: Status) => subscriptions.filter((x) => x.status === s).length;

  return (
    <div className="flex w-full flex-col gap-10" style={sp.page}>
      <section className="flex flex-col gap-3">
        <p className="text-xs font-bold tracking-[2px] text-blue-600">CUSTOMER PORTAL</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#101c3b] sm:text-4xl">My Subscriptions</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          View your plans, billing frequency and renewal dates.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map(({ label, icon: Icon, bg, color }) => (
          <div key={label} style={sp.stat} className={`${card} flex items-center justify-between gap-4`}>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <h3 className="text-3xl font-bold text-[#101c3b]">
                {String(count(label)).padStart(2, "0")}
              </h3>
            </div>
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg} ${color}`}>
              <Icon size={22} />
            </div>
          </div>
        ))}
      </section>

      <section style={sp.card} className={`${card} flex flex-col gap-8`}>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-[#101c3b]">All Subscriptions</h2>
          <p className="text-sm text-slate-500">Your current and past subscriptions.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th style={sp.th} className="rounded-l-xl">Subscription</th>
                <th style={sp.th}>Product</th>
                <th style={sp.th}>Billing</th>
                <th style={sp.th}>Price</th>
                <th style={sp.th}>Start Date</th>
                <th style={sp.th}>Next Renewal</th>
                <th style={sp.th}>Status</th>
                <th style={sp.th} className="rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                  <td style={sp.td} className="whitespace-nowrap">
                    <p className="text-sm font-semibold text-[#101c3b]">{s.plan}</p>
                    <p className="mt-1 text-xs text-blue-600">{s.id}</p>
                  </td>
                  <td style={sp.td} className="whitespace-nowrap text-sm text-slate-700">{s.product}</td>
                  <td style={sp.td} className="whitespace-nowrap text-sm text-slate-500">{s.frequency}</td>
                  <td style={sp.td} className="whitespace-nowrap text-sm font-semibold text-slate-800">{s.price}</td>
                  <td style={sp.td} className="whitespace-nowrap text-sm text-slate-500">{s.startDate}</td>
                  <td style={sp.td} className="whitespace-nowrap text-sm text-slate-500">{s.renewalDate}</td>
                  <td style={sp.td}>
                    <span style={sp.pill} className={`inline-flex rounded-full text-xs font-semibold ${badge[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={sp.td}>
                    {s.status !== "Closed" && (
                      <button
                        style={sp.btn}
                        className="flex items-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        Manage
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Subscriptions;