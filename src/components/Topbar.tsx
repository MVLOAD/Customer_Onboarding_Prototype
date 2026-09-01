import { Bell, ChevronDown, User, ExternalLink, ShieldCheck } from "lucide-react";
import { useStore } from "../store";

export default function Topbar({ onSwitchToCustomer }: { onSwitchToCustomer?: () => void }) {
  const { toast, customers } = useStore();
  const activeCustomer = customers.find((c) => c.portal?.status === "activated") || customers[0];

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 select-none">
      {/* Left: Welcome header — exact match to reference */}
      <div>
        <p className="text-[11px] font-medium text-ink-400 leading-none mb-0.5">Welcome Back!</p>
        <h1 className="font-display text-[17px] font-bold text-ink-900 flex items-center gap-1.5 leading-none">
          Super Admin <span className="text-lg">👋</span>
        </h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Switch to Customer Portal */}
        {onSwitchToCustomer && activeCustomer && (
          <button
            onClick={onSwitchToCustomer}
            className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
          >
            <ExternalLink size={12} />
            Open Customer Panel
            <span className="rounded bg-brand-200/80 px-1.5 py-0.5 text-[10px] text-brand-800 max-w-[90px] truncate">
              {activeCustomer.lead.company || "Demo Customer"}
            </span>
          </button>
        )}

        {/* Notification bell */}
        <button
          onClick={() => toast("info", "No new admin notifications right now.")}
          className="relative rounded-full p-1.5 text-ink-500 transition hover:bg-gray-100 hover:text-ink-900"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full bg-red-500 ring-[1.5px] ring-white" />
        </button>

        <div className="h-5 w-px bg-gray-200" />

        {/* User pill — matching reference */}
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3 shadow-xs cursor-pointer hover:bg-gray-50 transition">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-ink-600">
            <User size={15} />
          </span>
          <span className="text-left leading-tight">
            <span className="block text-[12.5px] font-bold text-ink-900">Super Admin</span>
            <span className="flex items-center gap-1 text-[10px] text-ink-500">
              <ShieldCheck size={10} className="text-emerald-500" /> Super-Admin
            </span>
          </span>
          <ChevronDown size={13} className="text-ink-400 ml-0.5" />
        </div>
      </div>
    </header>
  );
}
