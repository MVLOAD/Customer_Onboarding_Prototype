import { useMemo, useState } from "react";
import {
  Save,
  Mail,
  Eye,
  CheckCircle2,
  Send,
  Sparkles,
  FileSignature,
} from "lucide-react";
import { useStore } from "../../store";
import type { Customer, LeadData } from "../../types";
import {
  LEAD_SOURCES,
  LEAD_TYPES,
  PAYMENT_TYPES,
  SALESPERSONS,
  renderEmail,
  validators,
} from "../../data";
import { Badge, Button, Card, Field, Modal, Select, TextArea, TextInput } from "../ui";

export default function LeadStep({
  customer,
  onAdvance,
}: {
  customer: Customer;
  onAdvance: () => void;
}) {
  const { mutate, log, toast } = useStore();
  const [lead, setLead] = useState<LeadData>(customer.lead);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);

  const set = (k: keyof LeadData, v: string) => {
    setLead((l) => ({ ...l, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const persist = (patch: Partial<LeadData>) =>
    mutate(customer.id, (c) => ({ ...c, lead: { ...c.lead, ...patch } }));

  const emailReady = Boolean(lead.email && lead.paymentType && lead.name);

  const email = useMemo(() => renderEmail(lead.paymentType, lead), [lead]);

  const saveDraft = () => {
    persist(lead);
    log(customer.id, "Lead draft saved", "gray");
    toast("success", "Draft saved — you can come back anytime.");
  };

  const sendEmail = () => {
    const e: Record<string, string> = {};
    if (!lead.name) e.name = "Required before sending";
    if (!lead.email) e.email = validators.email(lead.email);
    if (!lead.paymentType) e.paymentType = "Select a payment type";
    setErrors(e);
    if (Object.keys(e).length) {
      toast("error", "Fill customer name, email and payment type to send.");
      return;
    }
    persist({ ...lead, emailSent: true });
    log(customer.id, `Onboarding email sent (${lead.paymentType} template)`, "blue");
    toast("success", `Email sent to ${lead.email}.`);
  };

  const complete = () => {
    const e: Record<string, string> = {
      name: validators.required(lead.name),
      company: validators.required(lead.company),
      mobile: validators.mobile(lead.mobile),
      email: validators.email(lead.email),
      salesperson: validators.required(lead.salesperson),
      paymentType: validators.required(lead.paymentType),
    };
    const clean = Object.fromEntries(Object.entries(e).filter(([, v]) => v));
    setErrors(clean);
    if (Object.keys(clean).length) {
      toast("error", "Please fix the highlighted fields to complete the lead.");
      return;
    }
    persist({ ...lead, status: "completed" });
    mutate(customer.id, (c) => ({ ...c, stage: "cis" }));
    log(customer.id, "Lead completed — CIS Form unlocked", "green");
    toast("success", "Lead completed! Step 2 (CIS Form) is now unlocked.");
    onAdvance();
  };

  return (
    <>
      <Card
        title="Lead Generation"
        subtitle="Capture the prospect and trigger the right onboarding email"
        icon={<FileSignature size={16} />}
        actions={
          lead.status === "completed" ? (
            <Badge tone="green">Completed</Badge>
          ) : (
            <Badge tone="orange">In progress</Badge>
          )
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Customer Name" required error={errors.name}>
            <TextInput value={lead.name} invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} placeholder="Contact person" />
          </Field>
          <Field label="Company Name" required error={errors.company}>
            <TextInput value={lead.company} invalid={!!errors.company} onChange={(e) => set("company", e.target.value)} placeholder="Registered company" />
          </Field>
          <Field label="Mobile" required error={errors.mobile}>
            <TextInput value={lead.mobile} invalid={!!errors.mobile} maxLength={10} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile" />
          </Field>
          <Field label="Email" required error={errors.email}>
            <TextInput value={lead.email} invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} placeholder="name@company.com" />
          </Field>
          <Field label="Lead Source">
            <Select value={lead.source} onChange={(e) => set("source", e.target.value)}>
              {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Lead Type" hint="Nature of this enquiry">
            <Select value={lead.leadType} onChange={(e) => set("leadType", e.target.value)}>
              {LEAD_TYPES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Salesperson" required error={errors.salesperson}>
            <Select value={lead.salesperson} onChange={(e) => set("salesperson", e.target.value)}>
              {SALESPERSONS.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Lead Description" className="md:col-span-2">
            <TextArea value={lead.description} onChange={(e) => set("description", e.target.value)} placeholder="Shipping volume, lanes, special requirements…" />
          </Field>
        </div>

        {/* payment type + template */}
        <div className="mt-5 grid gap-4 lg:grid-cols-[260px_1fr]">
          <Field label="Payment Type" required error={errors.paymentType} hint="Drives the email template below">
            <Select value={lead.paymentType} invalid={!!errors.paymentType} onChange={(e) => set("paymentType", e.target.value)}>
              <option value="">Select payment type…</option>
              {PAYMENT_TYPES.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </Field>

          {lead.paymentType ? (
            <div className="anim-fade-up rounded-lg border border-brand-200 bg-brand-50/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[13px] font-bold text-brand-800">
                  <Sparkles size={14} /> Onboarding Email Draft · Full View & Editable
                </p>
                <Badge tone="orange">{lead.paymentType}</Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink-600">Email Subject (Editable)</label>
                  <TextInput
                    value={lead.customSubject !== undefined ? lead.customSubject : email.subject}
                    onChange={(e) => set("customSubject", e.target.value)}
                    placeholder="Email Subject Line..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink-600">Email Body (Editable)</label>
                  <TextArea
                    value={lead.customBody !== undefined ? lead.customBody : email.body}
                    onChange={(e) => set("customBody", e.target.value)}
                    rows={8}
                    className="font-mono text-xs leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-ink-400">
                  <span>Recipient: <strong className="text-ink-700">{lead.email || "Not specified yet"}</strong></span>
                  {(lead.customSubject !== undefined || lead.customBody !== undefined) && (
                    <button
                      type="button"
                      onClick={() => {
                        set("customSubject", undefined as any);
                        set("customBody", undefined as any);
                      }}
                      className="font-semibold text-brand-600 hover:underline"
                    >
                      Reset to Default Template
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm text-ink-400">
                Select a <span className="font-semibold text-ink-600">Payment Type</span> to load and edit the matching email draft.
              </p>
            </div>
          )}
        </div>

        {/* actions */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-gray-100 pt-5">
          <Button variant="outline" onClick={saveDraft}>
            <Save size={15} /> Save Draft
          </Button>
          <Button
            variant="outline"
            onClick={sendEmail}
            disabled={!emailReady && !lead.paymentType}
            className={lead.emailSent ? "border-emerald-300 text-emerald-700" : ""}
          >
            {lead.emailSent ? <CheckCircle2 size={15} /> : <Send size={15} />}
            {lead.emailSent ? "Email Sent" : "Send Email"}
          </Button>
          <div className="flex-1" />
          <Button onClick={complete}>
            <CheckCircle2 size={16} /> Next Step
          </Button>
        </div>
        {lead.emailSent && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <Mail size={13} /> Last sent to {lead.email} · template “{lead.paymentType}”
          </p>
        )}
      </Card>
    </>
  );
}
