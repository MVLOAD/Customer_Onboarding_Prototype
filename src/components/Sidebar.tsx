import {
  LayoutDashboard,
  Tag,
  Users,
  Truck,
  ShoppingCart,
  Share2,
  BarChart3,
  ClipboardList,
  Scale,
  Receipt,
  FileSpreadsheet,
  FilePlus,
  FileMinus,
  MessageSquare,
  CloudUpload,
  RefreshCw,
  Link2,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useStore } from "../store";

const ITEMS: { label: string; icon: LucideIcon; active?: boolean }[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Invoice Dashboard", icon: Tag },
  { label: "Lead Management", icon: Users, active: true },
  { label: "Vendor Management", icon: Truck },
  { label: "Order Indent", icon: ShoppingCart },
  { label: "Connection Report", icon: Share2 },
  { label: "Sales Report", icon: BarChart3 },
  { label: "Purchase Report", icon: ClipboardList },
  { label: "Weight Discrepancies", icon: Scale },
  { label: "Sales Txn. Invoice", icon: Receipt },
  { label: "Purchase Txn. Invoice", icon: Receipt },
  { label: "Sales Tally Invoice", icon: FileSpreadsheet },
  { label: "Purchase Tally Invoice", icon: FileSpreadsheet },
  { label: "Credit Note", icon: FilePlus },
  { label: "Debit Note", icon: FileMinus },
  { label: "Customer Review List", icon: MessageSquare },
  { label: "Bulk order upload", icon: CloudUpload },
  { label: "Bulk status update", icon: RefreshCw },
  { label: "Bulk LP Assign", icon: Link2 },
  { label: "Sub-Admin Management", icon: UserCog },
];

export default function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const { toast } = useStore();

  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-gray-200 bg-white select-none">
      {/* Logo */}
      <div className="flex items-center justify-center border-b border-gray-100 px-4 py-4">
        <img
          src="mvload.png"
          alt="MV LOAD"
          className="h-12 w-auto object-contain cursor-pointer transition hover:scale-105"
          onClick={onNavigate}
        />
      </div>

      {/* Nav items — icon on right matching reference screenshot */}
      <nav className="nice-scroll flex-1 overflow-y-auto py-1.5">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.active) {
                  onNavigate();
                } else {
                  toast("info", `"${item.label}" is outside the scope of this prototype.`);
                }
              }}
              className={cn(
                "group relative flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] font-medium transition-colors",
                item.active
                  ? "bg-brand-500 text-white font-semibold"
                  : "text-ink-700 hover:bg-gray-50 hover:text-brand-700"
              )}
            >
              {/* Active left indicator bar */}
              {item.active && (
                <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-brand-700" />
              )}

              <span className="truncate pr-2 text-[13px]">{item.label}</span>

              <Icon
                size={16}
                className={cn(
                  "shrink-0",
                  item.active ? "text-white/80" : "text-brand-400 group-hover:text-brand-500"
                )}
              />
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
        <p className="text-[11px] font-medium text-ink-500 flex items-center justify-between">
          <span>Admin Portal</span>
          <span className="font-semibold text-brand-600">v2.4 Live</span>
        </p>
      </div>
    </aside>
  );
}
