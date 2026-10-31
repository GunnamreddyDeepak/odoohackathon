
const Customers = () => {
  return (
    <div className="min-h-screen bg-[#F7F9FD] p-5 md:p-8">
      <div>
        <p className="text-sm text-slate-400">Management / Customers</p>
        <h1 className="mt-2 text-3xl font-bold text-[#101B35]">
          Customers
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          View and manage customer information.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {['Total Customers', 'Active Customers', 'New Customers'].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item}</p>
            <p className="mt-3 text-3xl font-bold text-[#101B35]">—</p>
            <p className="mt-2 text-xs text-slate-400">Awaiting backend data</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-[#101B35]">Customer Directory</h2>
          <p className="mt-1 text-xs text-slate-400">
            Customer records from the backend will appear here.
          </p>
        </div>

        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            👥
          </div>
          <h3 className="mt-5 text-lg font-bold text-[#101B35]">
            No customer records available
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Customer information will appear here after backend integration.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Customers
