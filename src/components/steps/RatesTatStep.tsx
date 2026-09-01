import {
  TrendingUp,
  Lock,
  Clock3,
  IndianRupee,
  BadgePercent,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "../../store";
import type { Customer } from "../../types";
import { fmtDateTime } from "../../data";
import { Badge, Card } from "../ui";
import { cn } from "../../utils/cn";

const toneBadge: Record<string, "green" | "orange" | "red" | "gray"> = {
  High: "green",
  Moderate: "orange",
  "Very Low": "red",
  "Price increase": "gray",
};

export default function RatesTatStep({ customer }: { customer: Customer }) {
  const { resolveRequest, log, toast } = useStore();

  const portal = customer.portal;
  const isLocked =
    customer.stage === "lead" ||
    customer.stage === "cis" ||
    customer.stage === "portal";

  if (isLocked) {
    return (
      <Card
        title="Rates & TAT Negotiation"
        icon={<TrendingUp size={16} />}
      >
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-ink-400">
            <Lock size={18} />
          </span>
          <p className="font-semibold text-ink-700">This step is locked</p>
          <p className="max-w-sm text-xs text-ink-500">
            Complete the{" "}
            <span className="font-semibold text-brand-600">
              Introduction to Company
            </span>{" "}
            step first. The customer must activate their panel before rates can be negotiated.
          </p>
        </div>
      </Card>
    );
  }

  const chargesAccepted =
    customer.stage === "contract-creation" ||
    customer.stage === "contract-verification" ||
    customer.stage === "done";

  const pending = portal?.requests.filter((r) => r.status === "pending") ?? [];
  const allRequests = portal?.requests ?? [];

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      {chargesAccepted ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 shadow-xs">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <ShieldCheck size={18} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-emerald-900 text-sm">
              Charges Accepted & Locked — Contract Being Generated
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Customer accepted and froze all final charges on{" "}
              {customer.contract?.acceptedAt
                ? fmtDateTime(customer.contract.acceptedAt)
                : "—"}
              . Rates are now immutable.
            </p>
          </div>
          <Badge tone="green">Locked ✓</Badge>
        </div>
      ) : pending.length > 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5 shadow-xs">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
            <AlertCircle size={18} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-amber-900 text-sm">
              {pending.length} Pending Change Request{pending.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Approve or reject all requests before the customer can accept charges.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-5 py-3.5 shadow-xs">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
            <Clock3 size={18} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sky-900 text-sm">
              Awaiting Customer Charge Acceptance
            </p>
            <p className="text-xs text-sky-700 mt-0.5">
              All requests resolved. Customer must now accept & lock in charges from their panel to proceed.
            </p>
          </div>
        </div>
      )}

      {/* Rate & Charge Requests */}
      <Card
        title="Rate & Charge Change Requests"
        subtitle="Raised by customer from Standard Rate & TAT page — resolve all to unlock charge acceptance"
        icon={<Clock3 size={16} />}
        actions={
          pending.length ? (
            <Badge tone="orange">{pending.length} pending</Badge>
          ) : allRequests.length > 0 ? (
            <Badge tone="green">All resolved</Badge>
          ) : undefined
        }
      >
        {allRequests.length === 0 ? (
          <p className="py-4 text-center text-xs text-ink-400">
            No rate or charge change requests raised yet. Customer can accept current rates directly.
          </p>
        ) : (
          <div className="space-y-2.5">
            {allRequests.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 bg-gray-50/50"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                    r.kind === "rate"
                      ? "bg-brand-100 text-brand-700"
                      : "bg-sky-100 text-sky-700"
                  )}
                >
                  {r.kind === "rate" ? (
                    <IndianRupee size={15} />
                  ) : (
                    <BadgePercent size={15} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-ink-900">
                    {r.kind === "rate" ? (
                      <>
                        {r.zone} · {r.slab}
                      </>
                    ) : (
                      <>
                        {r.chargeName}{" "}
                        <span className="font-normal text-ink-400">
                          (Special Charge)
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-ink-500">
                    {r.unit === "%" ? `${r.currentRate}%` : `₹${r.currentRate}`}{" "}
                    →{" "}
                    <span className="font-bold text-brand-600">
                      {r.unit === "%" ? `${r.proposedRate}%` : `₹${r.proposedRate}`}
                    </span>
                    {r.reason && <> · "{r.reason}"</>}
                  </p>
                </div>
                {r.kind === "rate" && (
                  <Badge tone={toneBadge[r.likelihood] ?? "gray"}>
                    {r.likelihood} acceptance
                  </Badge>
                )}
                <p className="text-[11px] text-ink-400">{fmtDateTime(r.ts)}</p>
                {r.status === "pending" && !chargesAccepted ? (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        resolveRequest(customer.id, r.id, "approved");
                        log(
                          customer.id,
                          `${r.kind === "rate" ? "Rate" : "Charge"} request approved — ${r.kind === "rate" ? `${r.zone} · ${r.slab}` : r.chargeName} updated to ${r.unit === "%" ? `${r.proposedRate}%` : `₹${r.proposedRate}`}`,
                          "green"
                        );
                        toast("success", "Request approved — updated live in customer panel.");
                      }}
                      className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
                    >
                      <ThumbsUp size={12} /> Approve
                    </button>
                    <button
                      onClick={() => {
                        resolveRequest(customer.id, r.id, "rejected");
                        log(
                          customer.id,
                          `${r.kind === "rate" ? "Rate" : "Charge"} request rejected — ${r.kind === "rate" ? `${r.zone} · ${r.slab}` : r.chargeName}`,
                          "gray"
                        );
                        toast("info", "Request rejected.");
                      }}
                      className="flex items-center gap-1 rounded-md bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                    >
                      <ThumbsDown size={12} /> Reject
                    </button>
                  </div>
                ) : (
                  <Badge tone={r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "orange"}>
                    {r.status === "approved" ? "Approved" : r.status === "rejected" ? "Rejected" : "Pending"}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Frozen Rates Snapshot (if charges accepted) */}
      {chargesAccepted && customer.contract && (
        <Card
          title="Frozen Rate Snapshot"
          subtitle="These are the rates locked into the contract — cannot be changed"
          icon={<ShieldCheck size={16} />}
          actions={<Badge tone="green">Frozen</Badge>}
        >
          <div className="overflow-x-auto nice-scroll rounded-lg border border-gray-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2.5 text-left font-bold text-ink-700">Zone</th>
                  {customer.contract.rateSlabsSnapshot.map((s) => (
                    <th
                      key={s}
                      className="px-3 py-2.5 text-right font-bold text-ink-700"
                    >
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customer.contract.ratesSnapshot.map((row, i) => (
                  <tr
                    key={row.zone}
                    className={cn(
                      "border-b border-gray-100 transition",
                      i % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                    )}
                  >
                    <td className="px-4 py-2.5 font-semibold text-ink-800">
                      {row.zone}
                    </td>
                    {row.values.map((v, j) => (
                      <td
                        key={j}
                        className="px-3 py-2.5 text-right font-mono text-ink-700"
                      >
                        ₹{v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {customer.contract.chargesSnapshot.map((ch) => (
              <div
                key={ch.id}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-xs"
              >
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-400">
                  {ch.name}
                </p>
                <p className="mt-0.5 font-mono text-sm font-bold text-ink-900">
                  {ch.unit === "%" ? `${ch.value}%` : `₹${ch.value}`}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
