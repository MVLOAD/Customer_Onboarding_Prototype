import {
  LayoutGrid,
  Box,
  ClipboardList,
  Boxes,
  Scale,
  CreditCard,
  FileText,
  Settings,
  Compass,
  DownloadCloud,
  TrendingUp,
  FileSignature,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useStore } from "../../store";

export type CustomerTab = "dashboard" | "standard-rate-tat" | string;

const MENU_ITEMS: { id: CustomerTab; label: string; icon: LucideIcon; highlight?: boolean }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "book-orders", label: "Book Orders", icon: Box },
  { id: "my-orders", label: "My Orders", icon: ClipboardList },
  { id: "bulk-orders", label: "Bulk Orders", icon: Boxes },
  { id: "weight-discrepancies", label: "Weight Discrepancies", icon: Scale },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "track-order", label: "Track Your Order", icon: Compass },
  { id: "download-pod", label: "Download POD", icon: DownloadCloud },
  { id: "standard-rate-tat", label: "Standard Rate and TAT", icon: TrendingUp, highlight: true },
  { id: "contract", label: "My Contract", icon: FileSignature, highlight: true },
];

export default function CustomerSidebar({
  activeTab,
  onSelectTab,
}: {
  activeTab: CustomerTab;
  onSelectTab: (tab: CustomerTab) => void;
}) {
  const { toast } = useStore();

  return (
    <aside className="flex w-[230px] shrink-0 flex-col border-r border-gray-200 bg-white select-none">
      <nav className="nice-scroll flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isHighlight = item.highlight;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "dashboard" || item.id === "standard-rate-tat" || item.id === "contract") {
                  onSelectTab(item.id);
                } else {
                  toast("info", `"${item.label}" is demo only in this prototype.`);
                }
              }}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-[13px] font-medium transition",
                isActive
                  ? "bg-brand-500 text-white font-semibold shadow-xs"
                  : isHighlight
                    ? "text-brand-800 bg-brand-50/60 hover:bg-brand-100/70 font-semibold"
                    : "text-ink-700 hover:bg-gray-100/80 hover:text-ink-900"
              )}
            >
              <Icon
                size={17}
                className={cn(
                  "shrink-0 transition-transform group-hover:scale-110",
                  isActive
                    ? "text-white"
                    : isHighlight
                      ? "text-brand-600"
                      : "text-ink-500"
                )}
              />
              <span className="truncate">{item.label}</span>
              {isHighlight && !isActive && (
                <span className="ml-auto rounded bg-brand-200/80 px-1.5 py-0.5 text-[9px] font-bold text-brand-800 uppercase">
                  Active
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer support snippet */}
      <div className="border-t border-gray-100 p-3 bg-gray-50/50">
        <p className="text-[11px] font-semibold text-ink-700">MV Load Express</p>
        <p className="text-[10px] text-ink-400">Customer Shipping Portal</p>
      </div>
    </aside>
  );
}
