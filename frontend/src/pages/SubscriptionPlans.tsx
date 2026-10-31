
const SubscriptionPlans = () => {
  return (
    <div className="min-h-screen bg-[#F7F9FD] p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-400">Subscriptions / Plans</p>
          <h1 className="mt-2 text-3xl font-bold text-[#101B35]">
            Subscription Plans
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Create and manage subscription plans and billing frequencies.
          </p>
        </div>

        <button
          disabled
          title="Plan fields will be finalized with the backend API contract"
          className="cursor-not-allowed rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white opacity-60"
        >
          + Create Plan
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {['Total Plans', 'Active Plans', 'Inactive Plans'].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item}</p>
            <p className="mt-3 text-3xl font-bold text-[#101B35]">—</p>
            <p className="mt-2 text-xs text-slate-400">Awaiting backend data</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-[#101B35]">All Subscription Plans</h2>
          <p className="mt-1 text-xs text-slate-400">
            Manage plan details, pricing and billing cycles.
          </p>
        </div>

        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            📋
          </div>
          <h3 className="mt-5 text-lg font-bold text-[#101B35]">
            No subscription plans available
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Your subscription plans will appear here when connected to the
            backend.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPlans
