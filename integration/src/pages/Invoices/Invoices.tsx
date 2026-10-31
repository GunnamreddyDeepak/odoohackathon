import { useState } from "react";
import { Search, Download, FileText, CheckCircle2, AlertCircle } from "lucide-react";

type Status = "Paid" | "Pending" | "Partial";

interface Invoice {
  id: string;
  date: string;
  dueDate: string;
  description: string;
  subtotal: number;
  tax: number;
  discount: number;
  paid: number;
  status: Status;
}

const invoices: Invoice[] = [
  { id: "INV-2026", date: "Oct 28, 2026", dueDate: "Nov 05, 2026", description: "Pro Subscription", subtotal: 4237, tax: 762, discount: 0, paid: 4999, status: "Paid" },
  { id: "INV-2025", date: "Oct 21, 2026", dueDate: "Oct 31, 2026", description: "Cloud Storage Add-on", subtotal: 847, tax: 152, discount: 0, paid: 999, status: "Paid" },
  { id: "INV-2024", date: "Oct 15, 2026", dueDate: "Oct 25, 2026", description: "Business Plan", subtotal: 2542, tax: 457, discount: 500, paid: 0, status: "Pending" },
  { id: "INV-2023", date: "Sep 28, 2026", dueDate: "Oct 08, 2026", description: "Pro Subscription", subtotal: 4237, tax: 762, discount: 0, paid: 2500, status: "Partial" },
];

const badge: Record<Status, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Pending: "bg-orange-50 text-orange-700",
  Partial: "bg-blue-50 text-blue-700",
};

const total = (i: Invoice) => i.subtotal + i.tax - i.discount;
const due = (i: Invoice) => total(i) - i.paid;
const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const sp = {
  page: { maxWidth: 1400, margin: "0 auto", padding: "clamp(20px, 3.5vw, 56px)" },
  stat: { padding: 28 },
  card: { padding: "clamp(22px, 2.6vw, 40px)" },
  th: { padding: "16px 20px" },
  td: { padding: "20px" },
  pill: { padding: "6px 16px" },
  btn: { padding: "10px 16px" },
  input: { padding: "12px 16px 12px 44px" },
  chip: { padding: "10px 18px" },
};

const card = "rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]";
const filters = ["All", "Paid", "Pending", "Partial"] as const;

function Invoices() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const shown = invoices.filter(
    (i) =>
      (filter === "All" || i.status === filter) &&
      (i.id + i.description).toLowerCase().includes(query.toLowerCase())
  );

  const totalBilled = invoices.reduce((s, i) => s + total(i), 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0);
  const outstanding = invoices.reduce((s, i) => s + due(i), 0);

  const summary = [
    { label: "Total Billed", value: money(totalBilled), icon: FileText, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Total Paid", value: money(totalPaid), icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Outstanding Balance", value: money(outstanding), icon: AlertCircle, bg: "bg-orange-50", color: "text-orange-600" },
  ];

  return (
    <div className="flex w-full flex-col gap-10" style={sp.page}>
      <section className="flex flex-col gap-3">
        <p className="text-xs font-bold tracking-[2px] text-blue-600">CUSTOMER PORTAL</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#101c3b] sm:text-4xl">My Invoices</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          View your billing history, taxes, discounts and outstanding balance.
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
            <h2 className="text-2xl font-bold text-[#101c3b]">All Invoices</h2>
            <p className="text-sm text-slate-500">Search and filter your invoices.</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search invoice..."
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
          <table className="w-full min-w-[1200px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th style={sp.th} className="rounded-l-xl">Invoice</th>
                <th style={sp.th}>Date</th>
                <th style={sp.th}>Due Date</th>
                <th style={sp.th}>Subtotal</th>
                <th style={sp.th}>Tax</th>
                <th style={sp.th}>Discount</th>
                <th style={sp.th}>Total</th>
                <th style={sp.th}>Paid</th>
                <th style={sp.th}>Outstanding</th>
                <th style={sp.th}>Status</th>
                <th style={sp.th} className="rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((i) => (
                <tr key={i.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                  <td style={sp.td} className="whitespace-nowrap">
                    <p className="text-sm font-semibold text-blue-600">{i.id}</p>
                    <p className="mt-1 text-xs text-slate-500">{i.description}</p>
                  </td>
                  <td style={sp.td} className="whitespace-nowrap text-sm text-slate-500">{i.date}</td>
                  <td style={sp.td} className="whitespace-nowrap text-sm text-slate-500">{i.dueDate}</td>
                  <td style={sp.td} className="whitespace-nowrap text-sm text-slate-700">{money(i.subtotal)}</td>
                  <td style={sp.td} className="whitespace-nowrap text-sm text-slate-700">{money(i.tax)}</td>
                  <td style={sp.td} className="whitespace-nowrap text-sm text-slate-700">
                    {i.discount ? `-${money(i.discount)}` : "-"}
                  </td>
                  <td style={sp.td} className="whitespace-nowrap text-sm font-semibold text-slate-800">{money(total(i))}</td>
                  <td style={sp.td} className="whitespace-nowrap text-sm text-emerald-700">{money(i.paid)}</td>
                  <td
                    style={sp.td}
                    className={`whitespace-nowrap text-sm font-semibold ${due(i) > 0 ? "text-orange-600" : "text-slate-400"}`}
                  >
                    {money(due(i))}
                  </td>
                  <td style={sp.td}>
                    <span style={sp.pill} className={`inline-flex rounded-full text-xs font-semibold ${badge[i.status]}`}>
                      {i.status}
                    </span>
                  </td>
                  <td style={sp.td}>
                    <button
                      style={sp.btn}
                      className="flex items-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                      <Download size={16} />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {shown.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">No invoices found.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Invoices;