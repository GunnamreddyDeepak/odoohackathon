
const Quotations = () => {
  const statuses = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']

  return (
    <div className="min-h-screen bg-[#F7F9FD] p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-400">Sales / Quotations</p>
          <h1 className="mt-2 text-3xl font-bold text-[#101B35]">
            Quotations
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Prepare and manage customer subscription quotations.
          </p>
        </div>

        <button
          disabled
          title="Quotation fields will follow the backend API contract"
          className="cursor-not-allowed rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white opacity-60"
        >
          + Create Quotation
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {['Total Quotations', 'Pending Quotations', 'Accepted Quotations'].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item}</p>
            <p className="mt-3 text-3xl font-bold text-[#101B35]">—</p>
            <p className="mt-2 text-xs text-slate-400">Awaiting backend data</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-[#101B35]">
            All Quotations
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            View quotation details and customer offers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-5">
          {statuses.map((status) => (
            <span
              key={status}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500"
            >
              {status}
            </span>
          ))}
        </div>

        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            📄
          </div>
          <h3 className="mt-5 text-lg font-bold text-[#101B35]">
            No quotations available
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Customer quotations will appear here when connected to the backend.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Quotations
