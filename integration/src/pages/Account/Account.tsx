import { useEffect, useState } from "react";
import { Mail, Phone, Hash, CalendarDays, ShieldCheck, Pencil, Check, X, UserRound } from "lucide-react";
import { getCustomer, updateCustomer } from "../../services/customers";
import { getErrorMessage } from "../../services/api";
import type { Customer } from "../../types/customer";

const CUSTOMER_ID = import.meta.env.VITE_DEMO_CUSTOMER_ID ?? "1"; // TODO: /auth/me ready ayyaka replace

const sp = {
  page: { maxWidth: 1400, margin: "0 auto", padding: "clamp(20px, 3.5vw, 56px)" },
  card: { padding: "clamp(22px, 2.6vw, 40px)" },
  field: { padding: "14px 16px" },
  pill: { padding: "6px 16px" },
  btn: { padding: "12px 22px" },
  row: { padding: "16px 0" },
  alert: { padding: "12px 16px" },
};

const card = "rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]";
const inputClass = "w-full rounded-xl border border-slate-200 bg-white text-sm text-[#101c3b] outline-none focus:border-blue-400";
const readonlyClass = "w-full rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

function Account() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      setCustomer(await getCustomer(CUSTOMER_ID));
    } catch (e) {
      setLoadError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = () => {
    if (!customer) return;
    setDraft({ full_name: customer.full_name, phone: customer.phone ?? "" });
    setError("");
    setSaved(false);
    setEditing(true);
  };

  const cancel = () => {
    setError("");
    setEditing(false);
  };

  const save = async () => {
    if (!customer) return;
    if (!draft.full_name.trim()) return setError("Name cannot be empty.");
    if (draft.phone.trim() && !/^[+\d][\d\s-]{6,}$/.test(draft.phone.trim()))
      return setError("Enter a valid phone number.");

    setSaving(true);
    setError("");
    try {
      const updated = await updateCustomer(customer.id, {
        full_name: draft.full_name.trim(),
        phone: draft.phone.trim() || null,
      });
      setCustomer(updated);
      setEditing(false);
      setSaved(true);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const header = (
    <section className="flex flex-col gap-3">
      <p className="text-xs font-bold tracking-[2px] text-blue-600">CUSTOMER PORTAL</p>
      <h1 className="text-3xl font-bold tracking-tight text-[#101c3b] sm:text-4xl">My Account</h1>
      <p className="text-sm text-slate-500 sm:text-base">View and manage your personal information.</p>
    </section>
  );

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-10" style={sp.page}>
        {header}
        <div style={sp.card} className={`${card} text-sm text-slate-500`}>Loading your account...</div>
      </div>
    );
  }

  if (loadError || !customer) {
    return (
      <div className="flex w-full flex-col gap-10" style={sp.page}>
        {header}
        <div style={sp.card} className={`${card} flex flex-col items-start gap-4`}>
          <p className="text-sm font-medium text-red-600">{loadError || "Customer not found."}</p>
          <button
            onClick={load}
            style={sp.btn}
            className="rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const status = customer.is_active ? "Active" : "Inactive";
  const info = [
    { label: "Customer ID", value: customer.customer_code, icon: Hash },
    { label: "Member Since", value: formatDate(customer.created_at), icon: CalendarDays },
    { label: "Account Status", value: status, icon: ShieldCheck },
  ];

  return (
    <div className="flex w-full flex-col gap-10" style={sp.page}>
      {header}

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div style={sp.card} className={`${card} flex min-w-0 flex-col gap-8`}>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-4xl font-bold text-white">
              {customer.full_name.trim().charAt(0).toUpperCase() || <UserRound size={36} />}
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-[#101c3b]">{customer.full_name}</h2>
              <p className="break-all text-sm text-slate-500">{customer.email ?? "No email"}</p>
            </div>
            <span
              style={sp.pill}
              className={`rounded-full text-xs font-semibold ${
                customer.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {status}
            </span>
          </div>

          <div className="flex flex-col">
            {info.map(({ label, value, icon: Icon }) => (
              <div key={label} style={sp.row} className="flex items-center justify-between gap-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-slate-500">
                  <Icon size={18} className="shrink-0" />
                  <span className="text-sm">{label}</span>
                </div>
                <span className="text-sm font-semibold text-[#101c3b]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={sp.card} className={`${card} flex min-w-0 flex-col gap-8 xl:col-span-2`}>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-[#101c3b]">Personal Information</h2>
              <p className="text-sm text-slate-500">Keep your contact details up to date.</p>
            </div>
            {!editing && (
              <button
                onClick={startEdit}
                style={sp.btn}
                className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {saved && !editing && (
            <div style={sp.alert} className="rounded-xl bg-emerald-50 text-sm font-medium text-emerald-700">
              Profile updated successfully.
            </div>
          )}
          {error && (
            <div style={sp.alert} className="rounded-xl bg-red-50 text-sm font-medium text-red-600">{error}</div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <UserRound size={16} /> Full Name
              </label>
              <input
                value={editing ? draft.full_name : customer.full_name}
                onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
                disabled={!editing}
                style={sp.field}
                className={editing ? inputClass : readonlyClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Phone size={16} /> Phone Number
              </label>
              <input
                value={editing ? draft.phone : customer.phone ?? ""}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                disabled={!editing}
                style={sp.field}
                className={editing ? inputClass : readonlyClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Mail size={16} /> Email Address
              </label>
              <input value={customer.email ?? ""} disabled style={sp.field} className={readonlyClass} />
              <p className="text-xs text-slate-400">Email cannot be changed here.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Hash size={16} /> Customer ID
              </label>
              <input value={customer.customer_code} disabled style={sp.field} className={readonlyClass} />
              <p className="text-xs text-slate-400">Customer ID is assigned by Planora.</p>
            </div>
          </div>

          {editing && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={save}
                disabled={saving}
                style={sp.btn}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <Check size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={cancel}
                disabled={saving}
                style={sp.btn}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Account;