import { useState } from "react";
import { Mail, Phone, Clock, ChevronDown, Send, CheckCircle2 } from "lucide-react";

const contacts = [
  { label: "Email Us", value: "support@planora.com", icon: Mail, bg: "bg-blue-50", color: "text-blue-600" },
  { label: "Call Us", value: "+91 1800 123 4567", icon: Phone, bg: "bg-emerald-50", color: "text-emerald-600" },
  { label: "Support Hours", value: "Mon-Sat, 9 AM - 6 PM IST", icon: Clock, bg: "bg-orange-50", color: "text-orange-600" },
];

const faqs = [
  { q: "How do I view my subscriptions?", a: "Open My Subscriptions from the sidebar to see your plans, billing frequency, renewal dates and status." },
  { q: "Where can I find my invoices?", a: "Go to My Invoices. You can search by invoice ID and filter by Paid, Pending or Partial status." },
  { q: "Can I pay an invoice in parts?", a: "Yes. Partial payments are recorded against the invoice, and the outstanding balance updates automatically." },
  { q: "How do I update my contact details?", a: "Open My Account and click Edit Profile. You can update your name and phone number." },
  { q: "My payment failed. What should I do?", a: "Check Payment History for the failure reason, then retry or contact support using the form below." },
];

const sp = {
  page: { maxWidth: 1400, margin: "0 auto", padding: "clamp(20px, 3.5vw, 56px)" },
  stat: { padding: 28 },
  card: { padding: "clamp(22px, 2.6vw, 40px)" },
  field: { padding: "14px 16px" },
  btn: { padding: "14px 24px" },
  faq: { padding: "20px 4px" },
  alert: { padding: "12px 16px" },
};

const card = "rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white text-sm text-[#101c3b] outline-none focus:border-blue-400";

function Support() {
  const [open, setOpen] = useState<number | null>(0);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!subject.trim() || !message.trim()) {
      setSent(false);
      setError("Please fill in both subject and message.");
      return;
    }
    // TODO: send to backend once the support endpoint is available
    setError("");
    setSent(true);
    setSubject("");
    setMessage("");
  };

  return (
    <div className="flex w-full flex-col gap-10" style={sp.page}>
      <section className="flex flex-col gap-3">
        <p className="text-xs font-bold tracking-[2px] text-blue-600">CUSTOMER PORTAL</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#101c3b] sm:text-4xl">Help & Support</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          Find answers or get in touch with our support team.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {contacts.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} style={sp.stat} className={`${card} flex items-center gap-5`}>
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg} ${color}`}>
              <Icon size={22} />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="break-words text-sm font-semibold text-[#101c3b]">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* FAQ */}
        <div style={sp.card} className={`${card} flex min-w-0 flex-col gap-6`}>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-[#101c3b]">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-500">Quick answers to common questions.</p>
          </div>

          <div className="flex flex-col">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q} className="border-t border-slate-100">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    style={sp.faq}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="text-sm font-semibold text-[#101c3b]">{f.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <p className="text-sm leading-7 text-slate-500" style={{ paddingBottom: 20 }}>
                      {f.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Request form */}
        <div style={sp.card} className={`${card} flex min-w-0 flex-col gap-6`}>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-[#101c3b]">Send a Support Request</h2>
            <p className="text-sm text-slate-500">We usually reply within one business day.</p>
          </div>

          {sent && (
            <div style={sp.alert} className="flex items-center gap-2 rounded-xl bg-emerald-50 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={18} className="shrink-0" />
              Your request has been submitted.
            </div>
          )}

          {error && (
            <div style={sp.alert} className="rounded-xl bg-red-50 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Issue with my invoice"
              style={sp.field}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue..."
              rows={6}
              style={sp.field}
              className={`${inputClass} resize-none`}
            />
          </div>

          <button
            onClick={submit}
            style={sp.btn}
            className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Send size={16} />
            Submit Request
          </button>
        </div>
      </section>
    </div>
  );
}

export default Support;