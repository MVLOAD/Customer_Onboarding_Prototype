import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  FileSpreadsheet,
  TrendingUp,
  CheckCircle2,
  Download,
} from "lucide-react";
import { useStore } from "../store";
import { fmtDate, LEAD_SOURCES, SALESPERSONS } from "../data";
import { Button, Field, Modal, Select, TextInput } from "./ui";
import { cn } from "../utils/cn";

const STAGE_TABS = [
  { key: "all", label: "All Customers" },
  { key: "lead", label: "Lead Gen" },
  { key: "cis", label: "CIS Form" },
  { key: "portal", label: "Intro to Company" },
  { key: "rates-tat", label: "Rates & TAT" },
  { key: "contract-creation", label: "Contract Creation" },
  { key: "contract-verification", label: "Verification" },
  { key: "done", label: "Live" },
] as const;

export default function CustomerList({ onOpen }: { onOpen: (id: string) => void }) {
  const {
    customers,
    toast,
    createLead,
    deleteCustomer,
  } = useStore();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [stageTab, setStageTab] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);

  const stageCounts = useMemo(() => {
    const c: Record<string, number> = {
      all: customers.length,
      lead: 0,
      cis: 0,
      portal: 0,
      "rates-tat": 0,
      "contract-creation": 0,
      "contract-verification": 0,
      done: 0,
    };
    customers.forEach((x) => {
      if (x.stage in c) c[x.stage] = (c[x.stage] || 0) + 1;
    });
    return c;
  }, [customers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers
      .filter((c) => stageTab === "all" ? true : c.stage === stageTab)
      .filter((c) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "active") return c.isActive !== false;
        if (statusFilter === "inactive") return c.isActive === false;
        if (statusFilter === "dummy") return c.isDummyAccount === true;
        if (statusFilter === "real") return c.isDummyAccount !== true;
        return true;
      })
      .filter((c) => {
        if (sourceFilter === "all") return true;
        return c.lead.source === sourceFilter;
      })
      .filter((c) => {
        if (!q) return true;
        return [c.lead.company, c.lead.name, c.lead.email, c.lead.salesperson, c.cis?.company]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [customers, query, stageTab, statusFilter, sourceFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const rangeStart = (safePage - 1) * perPage + 1;
  const rangeEnd = Math.min(safePage * perPage, filtered.length);

  const exportCsv = () => {
    if (!filtered.length) { toast("error", "Nothing to export."); return; }
    const head = ["Date", "Name/Trade Name", "Email Address", "Rate Type", "Is Dummy Account", "Active Status", "Stage", "Salesperson"];
    const body = filtered.map((c) => [
      fmtDate(c.createdAt),
      c.lead.company || c.lead.name,
      c.lead.email,
      c.rateType || "Rate",
      c.isDummyAccount ? "Yes" : "No",
      c.isActive !== false ? "Active" : "Inactive",
      c.stage,
      c.lead.salesperson,
    ]);
    const csv = [head, ...body].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "lead-management.csv"; a.click();
    URL.revokeObjectURL(url);
    toast("success", `Exported ${filtered.length} leads.`);
  };

  const stageIcons = [Users, TrendingUp, FileSpreadsheet, Users, TrendingUp, FileSpreadsheet, Users, CheckCircle2];

  return (
    <div className="anim-fade-up space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
            Lead Management
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Track every lead through the onboarding funnel — from first contact to contract verification.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-brand-500 hover:bg-brand-600 font-semibold">
          <Plus size={15} strokeWidth={2.6} /> New Lead
        </Button>
      </div>

      {/* Stage summary tabs — scrollable on smaller screens */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
        {STAGE_TABS.map((tab, i) => {
          const Icon = stageIcons[i] || Users;
          const count = stageCounts[tab.key] ?? 0;
          const isActive = stageTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => { setStageTab(tab.key); setPage(1); }}
              className={cn(
                "rounded-xl border bg-white px-4 py-3 text-left transition shadow-xs hover:shadow-sm",
                isActive
                  ? "border-brand-500 ring-2 ring-brand-100"
                  : "border-gray-200 hover:border-brand-200"
              )}
            >
              <p className={cn("text-[10.5px] uppercase tracking-wider font-semibold mb-0.5", isActive ? "text-brand-500" : "text-ink-400")}>
                {tab.label}
              </p>
              <div className="flex items-end justify-between gap-2">
                <p className={cn("font-display text-[26px] leading-none font-extrabold", isActive ? "text-brand-600" : "text-ink-900")}>
                  {count}
                </p>
                <Icon size={18} className={cn("mb-0.5", isActive ? "text-brand-400" : "text-gray-300")} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        {/* Toolbar — exact match to reference: Search left, Status + Source dropdowns + Export right */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3.5">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <TextInput
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search company, contact, email..."
              className="h-9 pl-10 text-sm"
            />
          </div>

          {/* Filters + Export — right-aligned */}
          <div className="flex items-center gap-2 ml-auto">
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 w-[140px] text-xs font-medium"
            >
              <option value="all">All Stages</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="dummy">Dummy Account</option>
              <option value="real">Real Account</option>
            </Select>

            <Select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
              className="h-9 w-[130px] text-xs font-medium"
            >
              <option value="all">All Sources</option>
              {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
            </Select>

            <button
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white h-9 px-4 text-xs font-semibold text-ink-700 shadow-xs transition hover:bg-gray-50 hover:border-gray-300"
            >
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        {/* Table — exact column structure from reference image */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-[12.5px] font-bold text-ink-800">
                <th className="px-5 py-3.5">
                  <button className="flex items-center gap-1 hover:text-brand-600 transition">
                    Date <span className="text-brand-500">↑</span>
                  </button>
                </th>
                <th className="px-5 py-3.5">Company / Contact</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5 text-center">Funnel Progress</th>
                <th className="px-4 py-3.5 text-center">Current Stage</th>
                <th className="px-4 py-3.5 text-center">Payment</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((c) => {
                const stageSteps = ["lead", "cis", "portal", "done"];
                const currentStepIdx = stageSteps.indexOf(c.stage);
                const paymentLabel = c.rateType === "Prepaid" ? "Prepaid" : c.rateType === "COD" ? "COD" : "Postpaid";
                const paymentTone =
                  paymentLabel === "Prepaid" ? "bg-blue-100 text-blue-700" :
                  paymentLabel === "COD" ? "bg-amber-100 text-amber-700" :
                  "bg-emerald-100 text-emerald-700";
                const stageLabel =
                  c.stage === "lead" ? "Lead Generation" :
                  c.stage === "cis" ? "CIS Form" :
                  c.stage === "portal" ? "Introduction to Company" :
                  c.stage === "done" ? "Onboarded" : c.stage;
                const stageTone =
                  c.stage === "done" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                  c.stage === "portal" ? "bg-purple-100 text-purple-800 border-purple-200" :
                  "bg-orange-100 text-orange-800 border-orange-200";

                return (
                  <tr
                    key={c.id}
                    className="group cursor-pointer transition-colors hover:bg-brand-50/30"
                    onClick={() => onOpen(c.id)}
                  >
                    {/* Date */}
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] font-medium text-ink-600">
                      {fmtDate(c.createdAt)}
                    </td>

                    {/* Company / Contact */}
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[13.5px] text-ink-900 group-hover:text-brand-700 transition-colors">
                        {c.lead.company || "Untitled Lead"}
                      </p>
                      <p className="text-xs text-ink-400 mt-0.5">{c.lead.name || "—"}</p>
                    </td>

                    {/* Contact Details */}
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] text-ink-700 font-medium">{c.lead.email || "—"}</p>
                      <p className="text-[11.5px] text-ink-400 mt-0.5">{c.lead.mobile || "—"}</p>
                    </td>

                    {/* Funnel Progress — 4 dots */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {stageSteps.map((s, i) => (
                          <span
                            key={s}
                            className={cn(
                              "h-5 w-5 rounded-full border-2 flex items-center justify-center transition",
                              i < currentStepIdx
                                ? "bg-brand-500 border-brand-500"
                                : i === currentStepIdx
                                ? "bg-white border-brand-500 ring-2 ring-brand-200"
                                : "bg-white border-gray-200"
                            )}
                          >
                            {i < currentStepIdx && (
                              <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-white">
                                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                            {i === currentStepIdx && (
                              <span className="h-2 w-2 rounded-full bg-brand-500" />
                            )}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Current Stage */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={cn(
                        "inline-block rounded-md border px-2.5 py-0.5 text-[11.5px] font-semibold",
                        stageTone
                      )}>
                        {stageLabel}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={cn("inline-block rounded-md px-2.5 py-0.5 text-[11.5px] font-semibold", paymentTone)}>
                        {paymentLabel}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete lead for "${c.lead.company || "this customer"}"?`)) {
                              deleteCustomer(c.id);
                              toast("info", "Lead removed.");
                            }
                          }}
                          className="rounded p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Lead"
                        >
                          <Trash2 size={15} />
                        </button>

                        {/* View details */}
                        <button
                          onClick={() => onOpen(c.id)}
                          className="rounded p-1.5 text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition"
                          title="Open Funnel"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!rows.length && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={28} className="text-gray-300" />
                      <p className="font-semibold text-sm text-ink-600">No leads match your search</p>
                      <p className="text-xs text-ink-400">Try clearing filters or adding a new lead.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination — matching reference exactly */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 text-xs text-ink-500 select-none">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <Select
              value={perPage}
              onChange={(e) => { setPerPage(+e.target.value); setPage(1); }}
              className="w-[60px] h-7 py-0 text-xs font-semibold"
            >
              {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
            <span className="text-ink-400">
              {filtered.length > 0 ? `${rangeStart}–${rangeEnd} of ${filtered.length}` : "0 results"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={safePage === 1}
              className="h-7 w-7 rounded flex items-center justify-center text-ink-400 hover:bg-gray-100 disabled:opacity-30">
              <ChevronsLeft size={13} />
            </button>
            <button onClick={() => setPage(safePage - 1)} disabled={safePage === 1}
              className="h-7 w-7 rounded flex items-center justify-center text-ink-400 hover:bg-gray-100 disabled:opacity-30">
              <ChevronLeft size={13} />
            </button>

            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              let p = i + 1;
              if (pages > 7) {
                if (safePage <= 4) p = i + 1;
                else if (safePage >= pages - 3) p = pages - 6 + i;
                else p = safePage - 3 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "h-7 min-w-7 rounded px-2 text-xs font-semibold transition",
                    p === safePage
                      ? "bg-brand-500 text-white"
                      : "text-ink-600 hover:bg-gray-100"
                  )}
                >
                  {p}
                </button>
              );
            })}

            <button onClick={() => setPage(safePage + 1)} disabled={safePage === pages}
              className="h-7 w-7 rounded flex items-center justify-center text-ink-400 hover:bg-gray-100 disabled:opacity-30">
              <ChevronRight size={13} />
            </button>
            <button onClick={() => setPage(pages)} disabled={safePage === pages}
              className="h-7 w-7 rounded flex items-center justify-center text-ink-400 hover:bg-gray-100 disabled:opacity-30">
              <ChevronsRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* New Lead Modal */}
      <NewLeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(seed) => {
          const id = createLead(seed);
          setModalOpen(false);
          toast("success", `Lead "${seed.company || "Untitled"}" created!`);
          onOpen(id);
        }}
      />
    </div>
  );
}

function NewLeadModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (seed: {
    name: string;
    company: string;
    email: string;
    mobile: string;
    source: string;
    salesperson: string;
    paymentType: string;
  }) => void;
}) {
  const [form, setForm] = useState({
    name: "", company: "", email: "", mobile: "",
    source: "Website", salesperson: SALESPERSONS[0], paymentType: "Postpaid",
  });
  const [err, setErr] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!form.company.trim()) e.company = "Company name is required";
    if (!form.name.trim()) e.name = "Contact name is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    setErr(e);
    if (Object.keys(e).length) return;
    onCreate(form);
    setForm({ name: "", company: "", email: "", mobile: "", source: "Website", salesperson: SALESPERSONS[0], paymentType: "Postpaid" });
    setErr({});
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Customer Lead">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company Name" required error={err.company}>
          <TextInput value={form.company} invalid={!!err.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. CCF Logistics" />
        </Field>
        <Field label="Contact Person" required error={err.name}>
          <TextInput value={form.name} invalid={!!err.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tarun Kumar" />
        </Field>
        <Field label="Email Address" error={err.email}>
          <TextInput value={form.email} invalid={!!err.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tarun@company.com" />
        </Field>
        <Field label="Mobile Number">
          <TextInput value={form.mobile} maxLength={10}
            onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })} placeholder="10-digit mobile" />
        </Field>
        <Field label="Lead Source">
          <Select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
            {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Payment Type">
          <Select value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: e.target.value })}>
            <option value="Postpaid">Postpaid</option>
            <option value="Prepaid">Prepaid</option>
            <option value="COD">COD</option>
          </Select>
        </Field>
        <Field label="Assigned Salesperson" className="sm:col-span-2">
          <Select value={form.salesperson} onChange={(e) => setForm({ ...form, salesperson: e.target.value })}>
            {SALESPERSONS.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2.5">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit}>
          <Plus size={15} strokeWidth={2.6} /> Create Lead
        </Button>
      </div>
    </Modal>
  );
}
