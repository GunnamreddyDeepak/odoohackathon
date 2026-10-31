
import { Bell, Search, ChevronDown } from "lucide-react";

function Navbar() {
  return (
    <header className="sticky top-0 z-20 flex min-h-[76px] w-full items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 md:px-7">
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 md:max-w-[465px]">
        <Search size={19} className="shrink-0 text-slate-500" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        <span className="hidden whitespace-nowrap text-xs text-slate-400 xl:block">
          Ctrl + K
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-3 md:gap-5">
        <button className="relative shrink-0 text-slate-600 hover:text-blue-600">
          <Bell size={21} />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
        </button>

        <div className="h-8 w-px bg-slate-200" />

        <button className="flex shrink-0 items-center gap-2 md:gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            C
          </div>

          <div className="hidden text-left md:block">
            <p className="whitespace-nowrap text-sm font-semibold text-slate-800">
              Customer
            </p>
            <p className="whitespace-nowrap text-xs text-slate-500">
              My Account
            </p>
          </div>

          <ChevronDown size={16} className="hidden shrink-0 text-slate-500 sm:block" />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
