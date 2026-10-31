import { useState } from "react";
import { Search, Wallet, CheckCircle2, XCircle } from "lucide-react";

type Status = "Success" | "Pending" | "Failed";

interface Payment {
  id: string;
  invoice: string;
  date: string;
  method: string;
  amount: number;
  status: Status;
  note: string;
}

const payments: Payment[] = [
  { id: "TXN-9001", invoice: "INV-2026", date: "Oct 28, 2026", method: "UPI", amount: 4999, status: "Success", note: "Full payment" },
  { id: "TXN-9002", invoice: "INV-2025", date: "Oct 21, 2026", method: "Credit Card", amount: 999, status: "Success", note: "Full payment" },
  { id: "TXN-9003", invoice: "INV-2024", date: "Oct 16, 2026", method: "Credit Card", amount: 2499, status: "Failed", note: "Card declined" },
  { id: "TXN-9004", invoice: "INV-2023", date: "Oct 05, 2026", method: "UPI", amount: 1000, status: "Success", note: "Partial · ₹2,499 remaining" },
  { id: "TXN-9005", invoice: "INV-2023", date: "Sep 30, 2026", method: "Net Banking", amount: 1500, status: "Success", note: "Partial · 1st installment" },
];

const badge: Record<Status, string> = {
  Success: "bg-emerald-50 text-emerald-700",
  Pending: "bg-orange-50 text-orange-700",
  Failed: "bg-red-50 text-red-600",
};

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const sp = {
  page: { maxWidth: 1400, margin: "0 auto", padding: "clamp(20px, 3.5vw, 56px)" },
  stat: { padding: 28 },
  card: { padding: "clamp(22px, 2.6vw, 40px)" },
  th: { padding: "16px 20px" },
  td: { padding: "20px" },
  pill: { padding: "6px 16px" },
  input: { padding: "12px 16px 12px 44px" },
  chip: { padding: "10px 18px" },
};

const card = "rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]";
const filters = ["All", "Success", "Pending", "Failed"] as const;

function Payments() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const shown = payments.filter(
    (p) =>
      (filter === "All" || p.status === filter) &&
      (p.id + p.invoice + p.method).toLowerCase().includes(query.toLowerCase())
  );

  const totalPaid = payments.filter((p) => p.status === "Success").reduce((s, p) => s + p.amount, 0);
  const count = (s: Status) => payments.filter((p) => p.status === s).length;

  const summary = [
    { label: "Total Paid", value: money(totalPaid), icon: Wallet, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Successful Payments", value: String(count("Success")).padStart(2, "0"), icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Failed Payments", value: String(count("Failed")).padStart(2, "0"), icon: XCircle, bg: "bg-red-50", color: "text-red-600" },
  ];

  return (
    <div className="flex w-full flex-col gap-10" style={sp.page}>
      <section className="flex flex-col gap-3">
        <p className="text-xs font-bold tracking-[2px] text-blue-600">CUSTOMER PORTAL</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#101c3b] sm:text-4xl">Payment History</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          Track every payment made against your invoices.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {summary.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} style={sp.stat} className={`${card} flex items-center justify-between gap-4`}>
            <div className="flex min-w-0 flex-col gap-3">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <h3 className="text-3xl font-bold text-[#101c3b]">{value}</h3>
            </div>
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg} ${color}`}>
              <Icon size={22} />
            </div>
          </div>
        ))}
      </section>

      <section style={sp.card} className={`${card} flex flex-col gap-8`}>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-[#101c3b]">All Transactions</h2>
            <p className="text-sm text-slate-500">Search and filter your payments.</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search transaction..."
                style={sp.input}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-400 sm:w-64"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={sp.chip}
                  className={`rounded-xl text-xs font-semibold transition ${
                    filter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th style={sp.th} className="rounded-l-xl">Transaction ID</th>
                <th style={sp.th}>Invoice</th>
                <th style={sp.th}>Date</th>
                <th style={sp.th}>Method</th>
                <th style={sp.th}>Amount</th>
                <th style={sp.th}>Status</th>
                <th style={sp.th} className="rounded-r-xl">Details</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                  <td style={sp.td} className="whitespace-nowrap text-sm font-semibold text-[#101c3b]">{p.id}</td>
                  <td style={sp.td} className="whitespace-nowrap text-sm font-semibold text-blue-600">{p.invoice}</td>
                  <td style={sp.td} className="whitespace-nowrap text-sm text-slate-500">{p.date}</td>
                  <td style={sp.td} className="whitespace-nowrap text-sm text-slate-700">{p.method}</td>
                  <td style={sp.td} className="whitespace-nowrap text-sm font-semibold text-slate-800">{money(p.amount)}</td>
                  <td style={sp.td}>
                    <span style={sp.pill} className={`inline-flex rounded-full text-xs font-semibold ${badge[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={sp.td} className="whitespace-nowrap text-sm text-slate-500">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {shown.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">No payments found.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Payments;