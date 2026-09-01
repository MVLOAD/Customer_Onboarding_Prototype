import { useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  Clock,
  Eye,
  AlertCircle,
  Send,
  Lock,
  Sparkles,
  Info,
  ShieldCheck,
  MapPin,
  Building2,
} from "lucide-react";
import { useStore } from "../../store";
import type { Customer, PriceRequest } from "../../types";
import { fmtDate, fmtDateTime, likelihood, ZONE_PINCODES, type Likelihood } from "../../data";
import { Badge, Button, Field, Modal } from "../ui";
import { cn } from "../../utils/cn";

type ChangeRow = {
  key: string;
  label: string;
  sub: string;
  current: number;
  proposed: number;
  unit?: "₹" | "%";
  lk: Likelihood;
  invalid?: boolean;
};

export default function StandardRateAndTat({
  customer,
  onNavigateToContract,
}: {
  customer: Customer;
  onNavigateToContract?: () => void;
}) {
  const { addPriceRequest, acceptCharges, log, toast } = useStore();
  const [docOpen, setDocOpen] = useState(false);
  const [reqOpen, setReqOpen] = useState<boolean>(false);
  const [selectedZoneModal, setSelectedZoneModal] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [reasonErr, setReasonErr] = useState("");
  const [rateDraft, setRateDraft] = useState<Record<string, string>>({});
  const [chargeDraft, setChargeDraft] = useState<Record<string, string>>({});

  const portal = customer.portal;

  // Whether charges have been frozen (accepted by customer)
  const chargesFrozen =
    customer.stage === "contract-creation" ||
    customer.stage === "contract-verification" ||
    customer.stage === "done";

  // Pending requests gating acceptance
  const pendingRequests = portal?.requests.filter((r) => r.status === "pending") ?? [];

  if (!portal) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-xs">
        <p className="font-semibold text-ink-700">Standard rates are being configured for your account.</p>
        <p className="text-xs text-ink-500 mt-1">Please check back shortly or reach out to your account manager.</p>
      </div>
    );
  }

  /* ---------------- change derivations ---------------- */
  const rateChanges: ChangeRow[] = portal.rates.flatMap((r) =>
    portal.rateSlabs
      .map((s, i) => {
        const key = `${r.zone}|${s}`;
        const raw = rateDraft[key] ?? String(r.values[i]);
        const val = Number(raw);
        if (raw === String(r.values[i]) && !rateDraft[key]) return null;
        if (raw === "" || isNaN(val) || val <= 0)
          return {
            key,
            label: r.zone,
            sub: s,
            current: r.values[i],
            proposed: 0,
            unit: "₹" as const,
            lk: { label: "", tone: "red", pct: 0 } as Likelihood,
            invalid: true,
          };
        if (val === r.values[i]) return null;
        return {
          key,
          label: r.zone,
          sub: s,
          current: r.values[i],
          proposed: val,
          unit: "₹" as const,
          lk: likelihood(r.values[i], val),
        };
      })
      .filter(Boolean) as ChangeRow[]
  );

  const chargeChanges: ChangeRow[] = portal.charges
    .filter((c) => c.editable)
    .flatMap((c) => {
      const raw = chargeDraft[c.id] ?? String(c.value);
      const val = Number(raw);
      if (raw === String(c.value) && !chargeDraft[c.id]) return [];
      if (raw === "" || isNaN(val) || val <= 0)
        return [
          {
            key: c.id,
            label: c.name,
            sub: c.desc,
            current: c.value,
            proposed: 0,
            unit: c.unit,
            lk: { label: "", tone: "red", pct: 0 } as Likelihood,
            invalid: true,
          },
        ];
      if (val === c.value) return [];
      return [
        {
          key: c.id,
          label: c.name,
          sub: c.desc,
          current: c.value,
          proposed: val,
          unit: c.unit,
          lk: likelihood(c.value, val),
        },
      ];
    });

  const allChanges = [...rateChanges, ...chargeChanges];
  const hasInvalid = allChanges.some((r) => r.invalid);

  const submitRequests = () => {
    if (!allChanges.length) return;
    if (reason.trim().length < 5) {
      setReasonErr("Please provide a business justification (min. 5 characters)");
      return;
    }
    rateChanges.forEach((r) => {
      addPriceRequest(customer.id, {
        kind: "rate",
        zone: r.label,
        slab: r.sub,
        currentRate: r.current,
        proposedRate: r.proposed,
        reason: reason.trim(),
        likelihood: r.lk.label,
      });
    });
    chargeChanges.forEach((r) => {
      addPriceRequest(customer.id, {
        kind: "charge",
        chargeId: r.key,
        chargeName: r.label,
        unit: r.unit,
        currentRate: r.current,
        proposedRate: r.proposed,
        reason: reason.trim(),
        likelihood: r.lk.label || "—",
      });
    });

    log(
      customer.id,
      `Customer submitted ${allChanges.length} rate/charge change request(s) via Standard Rate & TAT page`,
      "orange"
    );
    toast(
      "success",
      `${allChanges.length} change request(s) dispatched to MV Load Admin for review!`
    );
    setRateDraft({});
    setChargeDraft({});
    setReason("");
    setReasonErr("");
    setReqOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 anim-fade-up select-none">
      {/* Frozen Banner */}
      {chargesFrozen && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 shadow-xs">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <ShieldCheck size={18} />
          </span>
          <div className="flex-1">
            <p className="font-bold text-emerald-900 text-sm">
              Charges Accepted & Locked — Your Contract is Being Prepared
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              You accepted & locked in these rates on{" "}
              {customer.contract?.acceptedAt
                ? new Date(customer.contract.acceptedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}.
              All rates below are now frozen in your contract.
            </p>
          </div>
          <span className="rounded-full bg-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
            Rates Locked ✓
          </span>
        </div>
      )}
      {/* 1. Header description */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900">
              Standard Rate & Turnaround Time (TAT)
            </h2>
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800">
              Contract Standard
            </span>
          </div>
          <p className="text-xs text-ink-500 mt-1">
            Review standard contracted shipping rates, guaranteed delivery TAT across zones, and request custom rate amendments with built-in acceptance likelihood.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setDocOpen(true)}
            className="text-xs h-9"
          >
            <Eye size={13} /> View Rate Card PDF
          </Button>
          {!chargesFrozen && (
            <Button
              onClick={() => {
                setReqOpen(true);
                setReason("");
                setReasonErr("");
              }}
              disabled={allChanges.length === 0}
              className="text-xs h-9 bg-brand-500 hover:bg-brand-600 shadow-sm"
            >
              <TrendingUp size={14} /> Request Change
              {allChanges.length > 0 && ` (${allChanges.length})`}
            </Button>
          )}
        </div>
      </div>

      {/* 2. Zone & Standard TAT Cards */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink-900 flex items-center gap-1.5">
            <Clock size={16} className="text-brand-500" /> Regional Delivery Turnaround Time (TAT) & Coverage
          </h3>
          <span className="text-xs text-brand-600 font-semibold">Click any zone to view pincodes</span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {portal.zones.map((z) => (
            <button
              type="button"
              key={z.name}
              onClick={() => setSelectedZoneModal(z.name)}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between text-left transition hover:border-brand-400 hover:shadow-md hover:bg-brand-50/20 group"
            >
              <div>
                <p className="font-display text-sm font-bold text-ink-900 group-hover:text-brand-700 flex items-center gap-1.5">
                  <MapPin size={14} className="text-brand-500" /> {z.name} Zone
                </p>
                <p className="text-xs text-ink-500 mt-0.5">{z.coverage}</p>
                <p className="text-[11px] font-semibold text-brand-600 mt-1">View Pincodes →</p>
              </div>
              <span className="rounded-lg bg-brand-50 border border-brand-200 px-2.5 py-1.5 text-xs font-bold text-brand-700">
                TAT: {z.tat}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Interactive Rate Matrix Table (4x4 Matrix: Origin Zone x Destination Zone) */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 bg-gray-50/50">
          <div>
            <h3 className="font-display text-sm font-bold text-ink-900 flex items-center gap-1.5">
              <IndianRupee size={16} className="text-brand-500" /> 4x4 Standard Zone Rates Matrix (₹ / kg)
            </h3>
            <p className="text-xs text-ink-500">
              Origin Zone (Rows) × Destination Zone (Columns) · Click zone headers to inspect covered pincodes
            </p>
          </div>

          {rateChanges.length > 0 && (
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
              {rateChanges.length} rate cell(s) modified
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-bold text-ink-800">
                <th className="px-5 py-3.5 bg-gray-100/70 border-r border-gray-200">
                  <span className="text-[11px] text-ink-500 block uppercase tracking-wider">Origin \ Dest</span>
                  <span>Zone</span>
                </th>
                {portal.rateSlabs.map((s) => (
                  <th key={s} className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedZoneModal(s)}
                      className="font-bold text-brand-700 hover:underline flex items-center justify-center gap-1 mx-auto"
                      title="Click to view pincodes"
                    >
                      <MapPin size={12} /> {s} Zone
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {portal.rates.map((r) => (
                <tr key={r.zone} className="hover:bg-gray-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-ink-900 bg-gray-50/30 border-r border-gray-100">
                    <button
                      type="button"
                      onClick={() => setSelectedZoneModal(r.zone)}
                      className="flex items-center gap-2 text-left font-bold text-ink-900 hover:text-brand-700 transition"
                      title="Click to view pincodes"
                    >
                      <span className="h-2 w-2 rounded-full bg-brand-500" />
                      <span>{r.zone} Zone</span>
                    </button>
                  </td>
                  {portal.rateSlabs.map((s, i) => {
                    const key = `${r.zone}|${s}`;
                    const raw = rateDraft[key] ?? String(r.values[i]);
                    const val = Number(raw);
                    const changed =
                      rateDraft[key] !== undefined && raw !== String(r.values[i]);
                    const invalid = changed && (raw === "" || isNaN(val) || val <= 0);
                    const lk = changed
                      ? likelihood(r.values[i], isNaN(val) ? -1 : val)
                      : null;

                    return (
                      <td key={s} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            <input
                              value={raw}
                              inputMode="decimal"
                              onChange={(e) =>
                                setRateDraft({
                                  ...rateDraft,
                                  [key]: e.target.value.replace(/[^\d.]/g, ""),
                                })
                              }
                              className={cn(
                                "w-20 rounded-md border px-2 py-1 text-center text-xs font-bold outline-none transition",
                                !changed &&
                                  "border-gray-200 bg-white text-ink-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
                                changed &&
                                  !invalid &&
                                  lk?.tone === "green" &&
                                  "border-emerald-400 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
                                changed &&
                                  !invalid &&
                                  lk?.tone === "orange" &&
                                  "border-amber-400 bg-amber-50 text-amber-800 ring-1 ring-amber-200",
                                changed &&
                                  !invalid &&
                                  lk?.tone === "red" &&
                                  "border-red-400 bg-red-50 text-red-800 ring-1 ring-red-200",
                                invalid && "border-red-500 bg-red-50 text-red-700"
                              )}
                            />
                          </div>

                          {changed && !invalid && lk && (
                            <span
                              className={cn(
                                "mt-1 rounded px-1 text-[9.5px] font-bold",
                                lk.tone === "green" && "bg-emerald-100 text-emerald-700",
                                lk.tone === "orange" && "bg-amber-100 text-amber-700",
                                lk.tone === "red" && "bg-red-100 text-red-700",
                                lk.tone === "gray" && "bg-gray-100 text-gray-600"
                              )}
                            >
                              {lk.tone === "green"
                                ? "Likely OK"
                                : lk.tone === "orange"
                                  ? "Moderate"
                                  : lk.tone === "red"
                                    ? "Very Low"
                                    : "Increase"}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Info footer */}
        <div className="border-t border-gray-100 p-3.5 bg-gray-50/60 text-xs text-ink-500 flex items-center gap-2">
          <Info size={14} className="text-brand-500 shrink-0" />
          <span>
            Rates reduced by &ge; 20% are flagged as <b>Very Low acceptance</b> and require strong monthly shipment volume commitments.
          </span>
        </div>
      </div>

      {/* 4. Special Surcharges & Extra Charges */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-bold text-ink-900 flex items-center gap-1.5">
            <Sparkles size={16} className="text-brand-500" /> Surcharges & Commercial Conditions
          </h3>
          {chargeChanges.length > 0 && (
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
              {chargeChanges.length} surcharge(s) modified
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {portal.charges.map((c) => {
            const raw = chargeDraft[c.id] ?? String(c.value);
            const changed =
              chargeDraft[c.id] !== undefined && raw !== String(c.value);

            return (
              <div
                key={c.id}
                className={cn(
                  "rounded-xl border p-3.5 bg-white shadow-xs transition",
                  c.editable ? "border-gray-200 hover:border-brand-200" : "border-gray-200 bg-gray-50/50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-ink-900">{c.name}</p>
                    <p className="text-[11px] text-ink-400 mt-0.5">{c.desc}</p>
                  </div>
                  {!c.editable && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                      Fixed
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {c.editable ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        value={raw}
                        inputMode="decimal"
                        onChange={(e) =>
                          setChargeDraft({
                            ...chargeDraft,
                            [c.id]: e.target.value.replace(/[^\d.]/g, ""),
                          })
                        }
                        className={cn(
                          "w-16 rounded-md border px-2 py-1 text-right text-xs font-bold outline-none",
                          changed
                            ? "border-brand-500 bg-brand-50 text-brand-800"
                            : "border-gray-200 bg-white text-ink-800"
                        )}
                      />
                      <span className="text-xs font-bold text-ink-600">{c.unit}</span>
                    </div>
                  ) : (
                    <span className="font-display text-base font-bold text-ink-800">
                      {c.value} {c.unit}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Submitted Requests Tracker */}
      {portal.requests.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <h3 className="font-display text-sm font-bold text-ink-900 mb-3 flex items-center gap-1.5">
            <Clock size={16} className="text-brand-500" /> Your Submitted Rate Amendment Requests
          </h3>

          <div className="space-y-2">
            {portal.requests.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs",
                      req.status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : req.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {req.status === "approved" ? "✓" : req.status === "rejected" ? "✕" : "⏳"}
                  </span>
                  <div>
                    <p className="font-bold text-ink-900">
                      {req.kind === "rate"
                        ? `${req.zone} · ${req.slab}`
                        : `${req.chargeName}`}
                    </p>
                    <p className="text-[11px] text-ink-500">
                      Current: {req.unit === "%" ? `${req.currentRate}%` : `₹${req.currentRate}`} → Proposed:{" "}
                      <span className="font-bold text-brand-600">
                        {req.unit === "%" ? `${req.proposedRate}%` : `₹${req.proposedRate}`}
                      </span>{" "}
                      {req.reason && `· “${req.reason}”`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10.5px] text-gray-400">{fmtDateTime(req.ts)}</span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 font-bold uppercase text-[10px]",
                      req.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : req.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rate Card PDF Document Preview Modal */}
      <Modal
        open={docOpen}
        onClose={() => setDocOpen(false)}
        title="MV Load Official Rate Card (Document Copy)"
        wide
      >
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-3">
              <img src="/mvload.png" alt="MV LOAD" className="h-8 w-auto" />
              <div>
                <p className="font-bold text-sm text-ink-900">{portal.rateDoc.name}</p>
                <p className="text-[11px] text-ink-400">
                  {portal.rateDoc.version} · Last Updated {fmtDate(portal.rateDoc.updatedAt)}
                </p>
              </div>
            </div>
            <Badge tone="green">Verified Contract</Badge>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold text-ink-700">
                <th className="py-2 px-3">Zone</th>
                {portal.rateSlabs.map((s) => (
                  <th key={s} className="py-2 px-3 text-right">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {portal.rates.map((r) => (
                <tr key={r.zone}>
                  <td className="py-2.5 px-3 font-semibold text-ink-900">{r.zone}</td>
                  {r.values.map((v, i) => (
                    <td key={i} className="py-2.5 px-3 text-right font-medium">
                      ₹{v}{i === r.values.length - 1 && "/kg"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-gray-100 pt-3 text-[11px] text-ink-500 leading-relaxed">
            All prices in INR. GST extra as applicable. Subject to standard MV Load terms of carriage.
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => setDocOpen(false)}>
            Close Preview
          </Button>
        </div>
      </Modal>

      {/* Zone Pincodes Viewer Modal */}
      <Modal
        open={selectedZoneModal !== null}
        onClose={() => setSelectedZoneModal(null)}
        title={selectedZoneModal ? `Situated Pincodes — ${selectedZoneModal} Zone` : "Zone Pincodes"}
        wide
      >
        {selectedZoneModal && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50/60 p-3">
              <div className="flex items-center gap-2">
                <MapPin className="text-brand-600 shrink-0" size={18} />
                <div>
                  <p className="font-bold text-ink-900 text-sm">{selectedZoneModal} Zone Coverage</p>
                  <p className="text-xs text-ink-500">
                    {portal.zones.find((z) => z.name === selectedZoneModal)?.coverage || "Regional Hub Coverage"}
                  </p>
                </div>
              </div>
              <Badge tone="green">
                TAT: {portal.zones.find((z) => z.name === selectedZoneModal)?.tat || "1–4 days"}
              </Badge>
            </div>

            <p className="font-semibold text-ink-700">Serviceable Cities & Pincodes in {selectedZoneModal} Zone:</p>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 max-h-80 overflow-y-auto nice-scroll pr-1">
              {(ZONE_PINCODES[selectedZoneModal] || portal.pincodes.filter((p) => p.zone.includes(selectedZoneModal))).map((pin) => (
                <div
                  key={pin.code}
                  className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white p-2.5 shadow-2xs hover:border-brand-300 transition"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand-700 font-mono font-bold text-[11px]">
                    <Building2 size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink-900 font-mono text-xs">{pin.code}</p>
                    <p className="text-[11px] text-ink-500 truncate">{pin.city}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => setSelectedZoneModal(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Unified Submit Change Requests Modal */}
      <Modal
        open={reqOpen}
        onClose={() => setReqOpen(false)}
        title="Submit Rate & Surcharge Amendment Requests"
        wide
      >
        {allChanges.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-400">No cell or charge changes detected.</p>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 font-bold text-ink-700">
                    <th className="p-2.5">Item / Zone</th>
                    <th className="p-2.5 text-right">Current</th>
                    <th className="p-2.5 text-right">Proposed</th>
                    <th className="p-2.5 text-right">Change</th>
                    <th className="p-2.5">Likelihood</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allChanges.map((r) => (
                    <tr key={r.key}>
                      <td className="p-2.5 font-bold text-ink-900">
                        {r.sub ? `${r.label} → ${r.sub}` : r.label}
                      </td>
                      <td className="p-2.5 text-right text-gray-500">
                        {r.unit === "%" ? `${r.current}%` : `₹${r.current}`}
                      </td>
                      <td className="p-2.5 text-right font-bold text-brand-600">
                        {r.unit === "%" ? `${r.proposed}%` : `₹${r.proposed}`}
                      </td>
                      <td className="p-2.5 text-right font-semibold">
                        {r.lk.pct > 0 ? `−${r.lk.pct}%` : `${Math.abs(r.lk.pct)}%`}
                      </td>
                      <td className="p-2.5">
                        <Badge tone={r.lk.tone === "red" ? "red" : r.lk.tone === "orange" ? "orange" : "green"}>
                          {r.lk.label}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Field label="Business Reason / Volume Commitment" required error={reasonErr}>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setReasonErr("");
                }}
                placeholder="e.g. Committed monthly volume of 4,000 shipments starting from this month on this lane..."
                className="w-full rounded-lg border border-gray-300 p-2.5 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 min-h-[70px]"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setReqOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitRequests} disabled={hasInvalid}>
                <Send size={13} /> Submit {allChanges.length} Request(s)
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Accept Charges Section */}
      {!chargesFrozen && portal && (
        <div
          className={cn(
            "rounded-2xl border px-6 py-5 shadow-xs",
            pendingRequests.length > 0
              ? "border-amber-200 bg-amber-50/70"
              : "border-brand-200 bg-gradient-to-r from-brand-50 to-white"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  pendingRequests.length > 0
                    ? "bg-amber-500 text-white"
                    : "bg-brand-500 text-white"
                )}
              >
                {pendingRequests.length > 0 ? (
                  <AlertCircle size={20} />
                ) : (
                  <Lock size={20} />
                )}
              </span>
              <div>
                <p
                  className={cn(
                    "font-bold text-sm",
                    pendingRequests.length > 0
                      ? "text-amber-900"
                      : "text-ink-900"
                  )}
                >
                  {pendingRequests.length > 0
                    ? `${pendingRequests.length} Pending Request${pendingRequests.length > 1 ? "s" : ""} — Resolve Before Accepting`
                    : "Ready to Accept & Lock In Charges"}
                </p>
                <p
                  className={cn(
                    "text-xs mt-0.5",
                    pendingRequests.length > 0
                      ? "text-amber-700"
                      : "text-ink-500"
                  )}
                >
                  {pendingRequests.length > 0
                    ? "Your change requests are pending admin approval. Once all are resolved, you can proceed to contract creation."
                    : "Clicking below will freeze all current rates & charges and generate your service contract. This action cannot be undone."}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                acceptCharges(customer.id);
                toast(
                  "success",
                  "Charges locked! Your contract is being prepared — check the 'My Contract' tab."
                );
                onNavigateToContract?.();
              }}
              disabled={pendingRequests.length > 0}
              className={cn(
                "shrink-0 gap-2 px-6 py-2.5 text-sm font-bold",
                pendingRequests.length > 0
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-brand-600 hover:bg-brand-700 shadow-brand-200 shadow-md"
              )}
            >
              <Lock size={15} />
              Lock In Rates & Proceed to Contract
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
