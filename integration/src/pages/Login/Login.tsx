import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { setToken } from "../../services/auth";

const field = { padding: "14px 16px" };

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    // TODO: replace with the real login API call once Member 2 shares the endpoint.
    // On success, save the JWT returned by the backend with setToken(...).
    setToken("demo-token");
    navigate("/", { replace: true });
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white text-sm text-[#101c3b] outline-none focus:border-blue-400";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f5f7fc]" style={{ padding: 24 }}>
      <div
        className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
        style={{ padding: 40 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Sparkles size={23} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#101c3b]">Planora</h1>
            <p className="text-xs text-slate-500">Customer Portal</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-[#101c3b]">Welcome back</h2>
          <p className="text-sm text-slate-500">Sign in to manage your subscriptions.</p>
        </div>

        {error && (
          <div style={{ padding: "12px 16px" }} className="rounded-xl bg-red-50 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={field}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-600">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            style={field}
            className={inputClass}
          />
        </div>

        <button
          onClick={submit}
          style={{ padding: "14px 24px" }}
          className="rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

export default Login;