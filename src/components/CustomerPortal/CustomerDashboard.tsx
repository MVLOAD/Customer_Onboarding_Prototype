import { useMemo } from "react";
import {
  Building,
  CreditCard,
  ShieldCheck,
  Calendar,
  Package,
  CircleDollarSign,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Menu,
} from "lucide-react";
import type { Customer } from "../../types";
import { STAGES, stageIndex } from "../../data";
import { cn } from "../../utils/cn";

export default function CustomerDashboard({
  customer,
  onNavigateToRates,
}: {
  customer: Customer;
  onNavigateToRates: () => void;
}) {
  const currentStageIdx = stageIndex(customer.stage);
  const stats = customer.stats || {
    creditLimit: 6565486468,
    availableLimit: 6565308388,
    nextBillingDate: "15th September 2027",
    paymentDueDate: "14th September 2027",
    accountType: "POSTPAID",
    ordersCount: 44,
    totalOrderValue: 150721.42,
    paymentPending: 149465.90,
    invoicesCount: 44,
    statusCounts: {
      booked: 1,
      pickedUp: 1,
      inTransit: 0,
      ofd: 0,
      rto: 0,
      delivered: 44,
      cancelled: 0,
      lost: 0,
    },
    monthlyTrend: [
      { month: "JAN", value: 14 },
      { month: "FEB", value: 1 },
      { month: "MAR", value: 0 },
      { month: "APR", value: 7 },
      { month: "MAY", value: 0 },
      { month: "JUN", value: 1 },
      { month: "JUL", value: 2 },
      { month: "AUG", value: 0 },
      { month: "SEPT", value: 12 },
      { month: "OCT", value: 3 },
      { month: "NOV", value: 1 },
      { month: "DEC", value: 3 },
    ],
  };

  // SVG Coordinates for monthly curve
  const points = useMemo(() => {
    const data = stats.monthlyTrend;
    const width = 640;
    const height = 180;
    const paddingLeft = 30;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = 15;

    const coords = data.map((d, i) => {
      const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
      const y = height - paddingBottom - (d.value / maxVal) * chartHeight;
      return { x, y, ...d };
    });

    // Build smooth cubic bezier path
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }

    return { coords, pathD, width, height, paddingLeft, paddingBottom, chartHeight };
  }, [stats.monthlyTrend]);

  return (
    <div className="space-y-6 pb-10 anim-fade-up select-none">
      {/* ----------------- 1. Onboarding Funnel Progress Tracker (Requirement 2) ----------------- */}
      <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-r from-brand-50/80 via-white to-amber-50/60 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800">
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-ping" />
              Live Onboarding Status
            </span>
            <h3 className="font-display text-base font-bold text-ink-900 mt-1">
              Your Onboarding Funnel Stage:{" "}
              <span className="text-brand-600">
                {customer.stage === "done"
                  ? "Onboarded & Live"
                  : STAGES[currentStageIdx]?.label}
              </span>
            </h3>
          </div>

          <button
            onClick={onNavigateToRates}
            className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-brand-600"
          >
            <TrendingUp size={14} /> View Standard Rate & TAT <ArrowRight size={13} />
          </button>
        </div>

        {/* Multi-step progress bar — scrollable strip */}
        <div className="overflow-x-auto nice-scroll -mx-1 px-1">
          <div className="flex gap-2 min-w-max pb-1">
            {STAGES.map((stg, idx) => {
              const isDone = customer.stage === "done" ? idx < 6 : idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx && customer.stage !== "done";
              const isLive = idx === 6 && customer.stage === "done";

              return (
                <div
                  key={stg.key}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 transition min-w-[130px]",
                    isDone || isLive
                      ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                      : isCurrent
                        ? "border-brand-500 bg-white ring-2 ring-brand-100 shadow-xs"
                        : "border-gray-200 bg-gray-50/70 text-gray-400"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isDone || isLive
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                          ? "bg-brand-500 text-white"
                          : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {isDone || isLive ? <CheckCircle2 size={14} /> : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "truncate text-[11px] font-bold",
                        isDone || isLive
                          ? "text-emerald-800"
                          : isCurrent
                            ? "text-brand-700 font-extrabold"
                            : "text-gray-500"
                      )}
                    >
                      {stg.label}
                    </p>
                    <p className="text-[9.5px] text-gray-500">
                      {isDone || isLive
                        ? "Completed"
                        : isCurrent
                          ? "Currently Here"
                          : "Upcoming"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ----------------- 2. Account Information Cards Row (Image 2) ----------------- */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        {/* A/C Type */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600 mb-2">
            <Building size={18} />
          </span>
          <p className="text-[11px] font-medium text-ink-500">A/C Type:</p>
          <p className="font-display text-base font-bold text-ink-900 mt-0.5">
            {stats.accountType}
          </p>
        </div>

        {/* Credit Limit */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600 mb-2">
            <CreditCard size={18} />
          </span>
          <p className="text-[11px] font-medium text-ink-500">Your Credit Limit:</p>
          <p className="font-display text-lg font-bold text-ink-900 mt-0.5">
            {stats.creditLimit}
          </p>
        </div>

        {/* Available Limit */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600 mb-2">
            <ShieldCheck size={18} />
          </span>
          <p className="text-[11px] font-medium text-ink-500">Available Limit:</p>
          <p className="font-display text-lg font-bold text-ink-900 mt-0.5">
            {stats.availableLimit}
          </p>
        </div>

        {/* Next Billing */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600 mb-2">
            <Calendar size={18} />
          </span>
          <p className="text-[11px] font-medium text-ink-500">Your Next Billing Is On:</p>
          <p className="font-display text-sm font-bold text-ink-900 mt-0.5">
            {stats.nextBillingDate}
          </p>
        </div>

        {/* Payment Due */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600 mb-2">
            <Clock size={18} />
          </span>
          <p className="text-[11px] font-medium text-ink-500">Your Payment Is Due On:</p>
          <p className="font-display text-sm font-bold text-ink-900 mt-0.5">
            {stats.paymentDueDate}
          </p>
        </div>
      </div>

      {/* ----------------- 3. 30 Days Metrics Row (Image 2) ----------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* No. of Orders */}
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
          <div>
            <p className="text-xs font-semibold text-ink-600">No. of Orders</p>
            <p className="font-display text-2xl font-bold text-ink-900 mt-1">
              {stats.ordersCount}
            </p>
            <p className="text-[11px] text-ink-400 mt-0.5">Last 30 days</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100/70 text-brand-600">
            <Package size={22} />
          </span>
        </div>

        {/* Total Order Value */}
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
          <div>
            <p className="text-xs font-semibold text-ink-600">Total Order Value</p>
            <p className="font-display text-2xl font-bold text-ink-900 mt-1">
              {stats.totalOrderValue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-[11px] text-ink-400 mt-0.5">Last 30 days</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100/70 text-sky-600">
            <CircleDollarSign size={22} />
          </span>
        </div>

        {/* Total Payment Pending */}
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
          <div>
            <p className="text-xs font-semibold text-ink-600">Total Payment Pending</p>
            <p className="font-display text-2xl font-bold text-ink-900 mt-1">
              {stats.paymentPending.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-[11px] text-ink-400 mt-0.5">Last 30 days</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100/70 text-orange-600">
            <Receipt size={22} />
          </span>
        </div>

        {/* Total No. Invoices */}
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
          <div>
            <p className="text-xs font-semibold text-ink-600">Total No. Invoices</p>
            <p className="font-display text-2xl font-bold text-ink-900 mt-1">
              {stats.invoicesCount}
            </p>
            <p className="text-[11px] text-ink-400 mt-0.5">Last 30 days</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-ink-600">
            <FileSpreadsheet size={22} />
          </span>
        </div>
      </div>

      {/* ----------------- 4. Shipment Status Counter Strip (Image 2) ----------------- */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
        {[
          { label: "Booked", count: "1" },
          { label: "PICKED UP", count: "1" },
          { label: "In-Transit", count: "--" },
          { label: "OFD", count: "--" },
          { label: "RTO", count: "--" },
          { label: "Delivered", count: "44" },
          { label: "Cancelled", count: "--" },
          { label: "Lost", count: "--" },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white py-3 px-2 shadow-xs text-center"
          >
            <p className="font-display text-xl font-bold text-ink-900 leading-tight">
              {s.count}
            </p>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-500 mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ----------------- 5. Charts Row (Image 2) ----------------- */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: Monthly Order Trend Curve */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-end mb-2">
            <button className="text-gray-400 hover:text-gray-600 p-1" title="Chart Options">
              <Menu size={16} />
            </button>
          </div>

          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${points.width} ${points.height}`}
              className="w-full h-52 stroke-linejoin-round"
            >
              {/* Y-axis grid lines */}
              {[15, 10, 5, 0].map((val) => {
                const y = points.height - points.paddingBottom - (val / 15) * points.chartHeight;
                return (
                  <g key={val}>
                    <line
                      x1={points.paddingLeft}
                      y1={y}
                      x2={points.width - 20}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={points.paddingLeft - 8}
                      y={y + 3}
                      fontSize="9"
                      fill="#94a3b8"
                      textAnchor="end"
                      fontWeight="bold"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Trend smooth line curve */}
              <path
                d={points.pathD}
                fill="none"
                stroke="#818cf8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {points.coords.map((c) => (
                <g key={c.month}>
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r="4"
                    fill="#ffffff"
                    stroke="#818cf8"
                    strokeWidth="2"
                  />
                  <text
                    x={c.x}
                    y={points.height - 8}
                    fontSize="9"
                    fill="#64748b"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {c.month}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Right: Booking Donut Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs lg:col-span-4 flex flex-col items-center justify-between">
          <div className="relative flex items-center justify-center my-3">
            {/* Donut SVG */}
            <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="90"
                cy="90"
                r="70"
                stroke="#2563eb"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray="400 40"
              />
              {/* Segment 1: Delivered (Blue 44/46) */}
              <circle
                cx="90"
                cy="90"
                r="70"
                stroke="#10b981"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray="15 425"
                strokeDashoffset="0"
              />
              {/* Segment 2: Picked up (Orange 1/46) */}
              <circle
                cx="90"
                cy="90"
                r="70"
                stroke="#f59e0b"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray="15 425"
                strokeDashoffset="-15"
              />
            </svg>

            {/* Inner text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-xs font-bold text-ink-500">Booking</p>
              <p className="font-display text-2xl font-extrabold text-ink-900">46</p>
            </div>
          </div>

          {/* Color legend matching Image 2 */}
          <div className="grid grid-cols-4 gap-x-2 gap-y-2 text-[11px] font-medium text-ink-600 w-full pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" /> Booked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Picked-up
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-400" /> In_Transit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-600" /> OFD
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Delivered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-pink-500" /> Cancelled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-black" /> RTO
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gray-500" /> Lost
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
