import {
  Bell,
  Wallet,
  User,
  ChevronDown,
  Download,
  Search,
  KeyRound,
  Star,
  ArrowLeft,
} from "lucide-react";
import type { Customer } from "../../types";

export default function CustomerHeader({
  customer,
  onExit,
}: {
  customer: Customer;
  onExit: () => void;
}) {
  const companyName = customer.cis?.company || customer.lead.company || "MVIKAS Tech";

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-2.5 shadow-xs select-none">
      {/* Left branding */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <img
            src="/mvload.png"
            alt="MV LOAD"
            className="h-10 w-auto object-contain cursor-pointer"
            onClick={onExit}
          />
        </div>
        <div className="hidden sm:block">
          <h2 className="font-display text-base font-bold text-ink-900">
            {companyName}
          </h2>
        </div>
      </div>

      {/* Right controls matching Image 2 */}
      <div className="flex items-center gap-3">
        <span className="hidden lg:block text-xs font-medium text-ink-500">
          Your last login Tue Sep 01,2026
        </span>

        {/* Install button */}
        <button className="hidden md:flex items-center gap-1.5 rounded-lg border border-sky-600 bg-sky-50/50 px-2.5 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100">
          <Download size={13} /> Install
        </button>

        <div className="hidden md:flex items-center gap-1 text-ink-500">
          <button className="rounded-full p-1.5 hover:bg-gray-100 transition" title="Search">
            <Search size={15} />
          </button>
          <button className="rounded-full p-1.5 hover:bg-gray-100 transition" title="API Keys">
            <KeyRound size={15} />
          </button>
          <button className="rounded-full p-1.5 hover:bg-gray-100 transition" title="Favorites">
            <Star size={15} />
          </button>
        </div>

        {/* Notification Bell */}
        <button
          className="relative rounded-full p-1.5 text-ink-600 hover:bg-gray-100 transition"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Wallet */}
        <button
          className="rounded-full p-1.5 text-ink-600 hover:bg-gray-100 transition"
          aria-label="Wallet"
        >
          <Wallet size={17} />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-2.5 shadow-2xs">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-ink-600">
            <User size={14} />
          </span>
          <div className="text-left leading-tight">
            <span className="block text-xs font-bold text-ink-900 truncate max-w-[120px]">
              {companyName}
            </span>
            <span className="block text-[10px] text-ink-400">User</span>
          </div>
          <ChevronDown size={13} className="text-ink-400" />
        </div>

        {/* Work badge button */}
        <button className="flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          Work
        </button>

        {/* Back to Admin Panel Switcher */}
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 rounded-lg border border-brand-300 bg-brand-50/80 px-2.5 py-1 text-xs font-bold text-brand-800 transition hover:bg-brand-100 hover:shadow-xs"
          title="Switch to Admin Panel"
        >
          <ArrowLeft size={13} /> Admin Panel
        </button>
      </div>
    </header>
  );
}
