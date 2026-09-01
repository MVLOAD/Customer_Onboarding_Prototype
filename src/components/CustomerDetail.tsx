import { useState } from "react";
import {
  ArrowLeft,
  Target,
  FileText,
  Globe2,
  Layers,
  Check,
  ChevronDown,
  History,
  UserRound,
  ExternalLink,
  CalendarDays,
  TrendingUp,
  FileSignature,
  BadgeCheck,
} from "lucide-react";
import { useStore } from "../store";
import { STAGES, stageIndex, fmtDate, fmtDateTime } from "../data";
import { Badge, Button, Card, StageLabel } from "./ui";
import LeadStep from "./steps/LeadStep";
import CisStep from "./steps/CisStep";
import PortalStep from "./steps/PortalStep";
import RatesTatStep from "./steps/RatesTatStep";
import ContractVerificationStep from "./steps/ContractVerificationStep";
import { cn } from "../utils/cn";

const STEP_ICONS = [Target, FileText, Globe2, TrendingUp, FileSignature, BadgeCheck, Layers];

export default function CustomerDetail({
  id,
  onBack,
  onOpenPortal,
}: {
  id: string;
  onBack: () => void;
  onOpenPortal: () => void;
}) {
  const { get } = useStore();
  const customer = get(id);

  if (!customer) {
    return (
      <div className="anim-fade-up rounded-xl border border-gray-200 bg-white p-10 text-center">
        <p className="font-semibold text-ink-700">Lead / Customer not found</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          <ArrowLeft size={15} /> Back to Lead Management
        </Button>
      </div>
    );
  }

  const current = stageIndex(customer.stage);

  return (
    <div className="anim-fade-up space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg border border-gray-200 bg-white p-2 text-ink-500 shadow-xs transition hover:border-brand-300 hover:text-brand-600"
            title="Back to list"
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-[22px] font-bold tracking-tight text-ink-900">
                {customer.lead.company || "Untitled Lead"}
              </h2>
              <StageLabel stage={customer.stage} />
              {customer.isDummyAccount && (
                <Badge tone="gray">Dummy Account</Badge>
              )}
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
              <CalendarDays size={13} /> Created {fmtDate(customer.createdAt)} · Contact:{" "}
              <span className="font-medium text-ink-700">{customer.lead.name || "No contact"}</span> · Source: {customer.lead.source}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="dark"
            onClick={onOpenPortal}
            className="bg-ink-900 hover:bg-ink-800 text-xs px-3.5 py-2 shadow-xs"
          >
            <ExternalLink size={14} /> Open Customer Panel
          </Button>
        </div>
      </div>

      {/* stepper */}
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-xs overflow-x-auto">
        <div className="flex items-center min-w-max">
          {STAGES.map((s, i) => {
            const Icon = STEP_ICONS[i];
            const done = customer.stage === "done" ? i < 6 : i < current;
            const isCurrent = i === current && customer.stage !== "done";
            const isLive = i === 6 && customer.stage === "done";
            return (
              <div
                key={s.key}
                className={cn("flex items-center", i < 6 && "flex-1")}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                      done || isLive
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : isCurrent
                          ? "pulse-ring border-brand-500 bg-brand-500 text-white"
                          : "border-gray-300 bg-white text-gray-400"
                    )}
                  >
                    {done || isLive ? (
                      <Check size={16} strokeWidth={3} />
                    ) : (
                      <Icon size={16} />
                    )}
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap text-[10px] font-semibold",
                      done || isLive
                        ? "text-emerald-600"
                        : isCurrent
                          ? "text-brand-700"
                          : "text-ink-400"
                    )}
                  >
                    {s.short}
                  </span>
                </div>
                {i < 6 && (
                  <div
                    className={cn(
                      "mx-2 mb-4 h-[2px] w-8 rounded transition-colors",
                      done ? "bg-emerald-400" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        {/* steps column */}
        <div className="space-y-4">
          {/* completed step summaries */}
          {customer.stage !== "lead" && <CompletedLeadSummary id={id} />}
          {["portal", "rates-tat", "contract-creation", "contract-verification", "done"].includes(customer.stage) && customer.cis && (
            <CompletedCisSummary id={id} />
          )}
          {["rates-tat", "contract-creation", "contract-verification", "done"].includes(customer.stage) && customer.portal && (
            <CompletedPortalSummary id={id} onOpenPortal={onOpenPortal} />
          )}

          {/* current step */}
          {customer.stage === "lead" && (
            <LeadStep customer={customer} onAdvance={() => {}} />
          )}
          {(customer.stage === "cis" || customer.stage === "lead") && (
            <CisStep customer={customer} onAdvance={() => {}} />
          )}
          {(customer.stage === "portal" ||
            customer.stage === "cis" ||
            customer.stage === "lead") && (
            <PortalStep customer={customer} onOpenPortal={onOpenPortal} />
          )}

          {/* Rates & TAT step — shown from portal stage onwards */}
          {["portal", "rates-tat", "contract-creation", "contract-verification", "done"].includes(customer.stage) && (
            <RatesTatStep customer={customer} />
          )}

          {/* Contract Verification step — shown from contract-creation onwards */}
          {["contract-creation", "contract-verification", "done"].includes(customer.stage) && (
            <ContractVerificationStep customer={customer} />
          )}
        </div>

        {/* right rail */}
        <div className="space-y-4">
          <Snapshot id={id} />
          <ActivityFeed id={id} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ summaries ------------------------------ */

function SummaryShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-emerald-200/80 bg-white shadow-xs">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check size={13} strokeWidth={3} />
          </span>
          <span className="font-display text-sm font-semibold text-ink-900">
            {title}
          </span>
          <Badge tone="green">Completed</Badge>
        </span>
        <ChevronDown
          size={16}
          className={cn("text-ink-400 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="border-t border-gray-100 px-5 py-4">{children}</div>}
    </div>
  );
}

function CompletedLeadSummary({ id }: { id: string }) {
  const { get } = useStore();
  const c = get(id);
  if (!c) return null;
  const l = c.lead;
  return (
    <SummaryShell title="Step 1: Lead Generation">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
        <Info k="Customer" v={l.name} />
        <Info k="Company" v={l.company} />
        <Info k="Mobile" v={l.mobile} />
        <Info k="Email" v={l.email} />
        <Info k="Source" v={l.source} />
        <Info k="Lead Type" v={l.leadType} />
        <Info k="Salesperson" v={l.salesperson} />
        <Info k="Payment Type" v={l.paymentType} />
      </dl>
    </SummaryShell>
  );
}

function CompletedCisSummary({ id }: { id: string }) {
  const { get } = useStore();
  const c = get(id);
  if (!c?.cis) return null;
  const f = c.cis;
  const docs = Object.values(f.documents).filter(Boolean).length;
  const consigneeCount = (f.consigneeTable || []).filter((r) => r.checked).length;
  return (
    <SummaryShell title="Step 2: CIS Form">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
        <Info k="Company" v={f.company} />
        <Info k="Industry" v={f.industry} />
        <Info k="Company Type" v={f.companyType} />
        <Info k="Product Category" v={f.productCategory} />
        <Info k="Turnover" v={f.turnover} />
        <Info k="Monthly Potential" v={f.monthlyPotential} />
        <Info k="Weight / Month" v={f.weightPerMonth} />
        <Info k="Value in L / Month" v={`₹${f.valueInLakhsPerMonth} Lakhs`} />
        <Info k="Insurance Type" v={f.insuranceType === "carrier_risk" ? "Carrier Risk (Comprehensive)" : "Owner Risk"} />
        <Info k="Consignees Active" v={`${consigneeCount} Types`} />
        <Info k="PAN / GSTIN" v={`${f.pan} / ${f.gst}`} />
        <Info k="Documents" v={`${docs} uploaded`} />
      </dl>
    </SummaryShell>
  );
}

function CompletedPortalSummary({
  id,
  onOpenPortal,
}: {
  id: string;
  onOpenPortal: () => void;
}) {
  const { get } = useStore();
  const c = get(id);
  if (!c?.portal) return null;
  return (
    <SummaryShell title="Step 3: Intro to Company & Customer Panel">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <Info k="Username" v={c.portal.username} />
          <Info
            k="Status"
            v={
              c.portal.status === "activated"
                ? "Activated via OTP"
                : "OTP sent to customer"
            }
          />
        </div>
        <Button
          variant="outline"
          className="px-3 py-1.5 text-xs"
          onClick={onOpenPortal}
        >
          <ExternalLink size={13} /> Open Panel
        </Button>
      </div>
    </SummaryShell>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
        {k}
      </dt>
      <dd className="font-semibold text-ink-900 mt-0.5">{v || "—"}</dd>
    </div>
  );
}

/* ------------------------------ right rail ------------------------------ */

function Snapshot({ id }: { id: string }) {
  const { get } = useStore();
  const c = get(id);
  if (!c) return null;
  return (
    <Card title="Lead Snapshot" icon={<UserRound size={15} />}>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 font-display text-base font-bold text-brand-700">
          {(c.lead.company || "?").slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold text-ink-900">
            {c.lead.company || "Untitled Lead"}
          </p>
          <p className="truncate text-xs text-ink-500">
            {c.lead.email || "No email"}
          </p>
        </div>
      </div>
      <dl className="space-y-2.5 text-xs">
        <Info k="Salesperson" v={c.lead.salesperson} />
        <Info k="Payment Type" v={c.lead.paymentType || "—"} />
        <Info k="Lead Source" v={c.lead.source} />
        <Info k="Lead Type" v={c.lead.leadType} />
        <Info k="Mobile" v={c.lead.mobile || "—"} />
      </dl>
      {c.lead.description && (
        <p className="mt-3 rounded-md bg-gray-50 p-2.5 text-xs text-ink-500 ring-1 ring-gray-200">
          {c.lead.description}
        </p>
      )}
    </Card>
  );
}

function ActivityFeed({ id }: { id: string }) {
  const { get } = useStore();
  const c = get(id);
  if (!c) return null;
  const toneDot = {
    orange: "bg-brand-500",
    green: "bg-emerald-500",
    blue: "bg-sky-500",
    gray: "bg-gray-400",
  };
  return (
    <Card title="Funnel Audit History" icon={<History size={15} />}>
      <ol className="relative space-y-3.5 before:absolute before:bottom-1 before:left-[5px] before:top-1 before:w-px before:bg-gray-200">
        {[...c.activity].reverse().map((a) => (
          <li key={a.id} className="relative pl-6">
            <span
              className={cn(
                "absolute left-0 top-1 h-[10px] w-[10px] rounded-full ring-4 ring-white",
                toneDot[a.tone]
              )}
            />
            <p className="text-xs font-semibold leading-snug text-ink-800">
              {a.message}
            </p>
            <p className="text-[10.5px] text-ink-400 mt-0.5">
              {fmtDateTime(a.ts)}
            </p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
