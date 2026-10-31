import { useState } from "react";
import { Bell, Globe, Lock, Check, CheckCircle2 } from "lucide-react";

const notificationItems = [
  { key: "invoices", label: "Invoice emails", desc: "Get an email when a new invoice is generated." },
  { key: "payments", label: "Payment confirmations", desc: "Get notified when a payment is received." },
  { key: "renewals", label: "Renewal reminders", desc: "Get reminded before a subscription renews." },
  { key: "updates", label: "Product updates", desc: "Hear about new features and announcements." },
];

const defaultPrefs = {
  notifications: { invoices: true, payments: true, renewals: true, updates: false } as Record<string, boolean>,
  language: "English",
  dateFormat: "DD/MM/YYYY",
};

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem("planora-settings");
    return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
};

const sp = {
  page: { maxWidth: 1400, margin: "0 auto", padding: "clamp(20px, 3.5vw, 56px)" },
  card: { padding: "clamp(22px, 2.6vw, 40px)" },
  field: { padding: "14px 16px" },
  btn: { padding: "14px 24px" },
  row: { padding: "20px 0" },
  alert: { padding: "12px 16px" },
  iconBox: { padding: 0 },
};

const card = "rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white text-sm text-[#101c3b] outline-none focus:border-blue-400";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-blue-600" : "bg-slate-300"}`}
    >
      <span
        className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function SectionTitle({ icon: Icon, title, desc, bg, color }: any) {
  return (
    <div className="flex items-center gap-4">
      <div style={sp.iconBox} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg} ${color}`}>
        <Icon size={22} />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-[#101c3b]">{title}</h2>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function Settings() {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [saved, setSaved] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwOk, setPwOk] = useState(false);

  const toggle = (key: string) => {
    setSaved(false);
    setPrefs({ ...prefs, notifications: { ...prefs.notifications, [key]: !prefs.notifications[key] } });
  };

  const savePrefs = () => {
    try {
      localStorage.setItem("planora-settings", JSON.stringify(prefs));
    } catch {}
    setSaved(true);
  };

  const changePassword = () => {
    setPwOk(false);
    if (!current || !next || !confirm) return setPwError("Please fill in all password fields.");
    if (next.length < 8) return setPwError("New password must be at least 8 characters.");
    if (next !== confirm) return setPwError("New passwords do not match.");
    // TODO: call the backend change-password endpoint once available
    setPwError("");
    setPwOk(true);
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <div className="flex w-full flex-col gap-10" style={sp.page}>
      <section className="flex flex-col gap-3">
        <p className="text-xs font-bold tracking-[2px] text-blue-600">CUSTOMER PORTAL</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#101c3b] sm:text-4xl">Settings</h1>
        <p className="text-sm text-slate-500 sm:text-base">Manage your preferences and account security.</p>
      </section>

      {/* Notifications */}
      <section style={sp.card} className={`${card} flex flex-col gap-6`}>
        <SectionTitle
          icon={Bell}
          title="Notifications"
          desc="Choose what you want to be notified about."
          bg="bg-blue-50"
          color="text-blue-600"
        />
        <div className="flex flex-col">
          {notificationItems.map((n) => (
            <div key={n.key} style={sp.row} className="flex items-center justify-between gap-6 border-t border-slate-100">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-sm font-semibold text-[#101c3b]">{n.label}</p>
                <p className="text-sm text-slate-500">{n.desc}</p>
              </div>
              <Toggle on={prefs.notifications[n.key]} onClick={() => toggle(n.key)} />
            </div>
          ))}
        </div>
      </section>

      {/* Preferences */}
      <section style={sp.card} className={`${card} flex flex-col gap-6`}>
        <SectionTitle
          icon={Globe}
          title="Preferences"
          desc="Customise how information is displayed."
          bg="bg-emerald-50"
          color="text-emerald-600"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Language</label>
            <select
              value={prefs.language}
              onChange={(e) => { setSaved(false); setPrefs({ ...prefs, language: e.target.value }); }}
              style={sp.field}
              className={inputClass}
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Tamil</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Date Format</label>
            <select
              value={prefs.dateFormat}
              onChange={(e) => { setSaved(false); setPrefs({ ...prefs, dateFormat: e.target.value }); }}
              style={sp.field}
              className={inputClass}
            >
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>

        {saved && (
          <div style={sp.alert} className="flex items-center gap-2 rounded-xl bg-emerald-50 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={18} className="shrink-0" />
            Settings saved.
          </div>
        )}

        <button
          onClick={savePrefs}
          style={sp.btn}
          className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Check size={16} />
          Save Settings
        </button>
      </section>

      {/* Security */}
      <section style={sp.card} className={`${card} flex flex-col gap-6`}>
        <SectionTitle
          icon={Lock}
          title="Change Password"
          desc="Use a strong password you don't use elsewhere."
          bg="bg-orange-50"
          color="text-orange-600"
        />

        {pwError && (
          <div style={sp.alert} className="rounded-xl bg-red-50 text-sm font-medium text-red-600">{pwError}</div>
        )}
        {pwOk && (
          <div style={sp.alert} className="flex items-center gap-2 rounded-xl bg-emerald-50 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={18} className="shrink-0" />
            Password form is valid. It will be saved once the backend is connected.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Current Password</label>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} style={sp.field} className={inputClass} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">New Password</label>
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} style={sp.field} className={inputClass} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Confirm New Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={sp.field} className={inputClass} />
          </div>
        </div>

        <button
          onClick={changePassword}
          style={sp.btn}
          className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
        >
          Update Password
        </button>
      </section>
    </div>
  );
}

export default Settings;