import { useState, useMemo } from "react";
import {
  Globe2,
  KeyRound,
  Copy,
  MailCheck,
  ExternalLink,
  Lock,
  CheckCircle2,
  CircleDot,
  Circle,
  ThumbsUp,
  ThumbsDown,
  Clock3,
  IndianRupee,
  BadgePercent,
  Send,
  Eye,
  FileCode,
} from "lucide-react";
import { useStore } from "../../store";
import type { Customer, TechMailDraft } from "../../types";
import { genOtp, genPortalData, fmtDateTime, renderTechMail } from "../../data";
import { Badge, Button, Card, Field, Modal, TextArea, TextInput } from "../ui";
import { cn } from "../../utils/cn";

const toneBadge: Record<string, "green" | "orange" | "red" | "gray"> = {
  High: "green",
  Moderate: "orange",
  "Very Low": "red",
  "Price increase": "gray",
};

export default function PortalStep({
  customer,
  onOpenPortal,
}: {
  customer: Customer;
  onOpenPortal: () => void;
}) {
  const { mutate, log, toast, resolveRequest, sendTechMail } = useStore();
  const locked = customer.stage === "lead" || customer.stage === "cis";
  const portal = customer.portal;

  const defaultDraft = useMemo(() => renderTechMail(customer), [customer]);
  const [mailForm, setMailForm] = useState<TechMailDraft>(
    customer.techMailDraft || defaultDraft
  );
  const [mailPreviewOpen, setMailPreviewOpen] = useState(false);

  const copy = (text: string, label: string) => {
    try {
      navigator.clipboard?.writeText(text)?.catch(() => {});
    } catch {
      /* clipboard unavailable */
    }
    toast("info", `${label} copied to clipboard.`);
  };

  const createPortal = () => {
    const base = genPortalData(customer.lead.email, customer.cis?.pincode);
    mutate(customer.id, (c) => ({
      ...c,
      portal: { ...base, status: "otp_sent", createdAt: new Date().toISOString() },
    }));
    log(
      customer.id,
      `Customer portal created — OTP sent to ${customer.lead.email}`,
      "orange"
    );
    toast(
      "success",
      "Portal credentials generated and OTP sent to the customer email."
    );
  };

  const resendOtp = () => {
    const otp = genOtp();
    mutate(customer.id, (c) =>
      c.portal
        ? {
            ...c,
            portal: {
              ...c.portal,
              status: "otp_sent",
              otp,
              otpSentAt: new Date().toISOString(),
            },
          }
        : c
    );
    log(customer.id, "New OTP re-sent to customer email", "blue");
    toast("success", "A fresh OTP has been emailed to the customer.");
  };

  const handleSendTechMail = () => {
    sendTechMail(customer.id, mailForm);
    toast(
      "success",
      `Panel build request email sent to ${mailForm.to} for ${customer.lead.company}!`
    );
    if (!portal) {
      createPortal();
    }
    setMailPreviewOpen(false);
  };

  if (locked) {
    return (
      <Card title="Introduction to Company & Tech Panel Setup" icon={<Globe2 size={16} />}>
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-ink-400">
            <Lock size={18} />
          </span>
          <p className="font-semibold text-ink-700">This step is locked</p>
          <p className="max-w-sm text-xs text-ink-500">
            Submit the <span className="font-semibold text-brand-600">CIS Form</span> to draft the tech team build request and generate customer login credentials.
          </p>
        </div>
      </Card>
    );
  }

  const statusSteps = [
    {
      label: "Tech Team Panel Build Requested",
      done: Boolean(customer.techMailDraft?.sent),
    },
    { label: "Credentials Provisioned", done: Boolean(portal) },
    {
      label: "OTP Sent via Email",
      done: portal?.status === "otp_sent" || portal?.status === "activated",
    },
    { label: "Customer Activated Panel", done: portal?.status === "activated" },
  ];

  const pending = portal?.requests.filter((r) => r.status === "pending") ?? [];

  return (
    <div className="space-y-4">
      {/* 1. Draft Email to Individual Recipient */}
      <Card
        title="Draft Email to Individual Recipient"
        subtitle="Salesperson drafts & dispatches onboarding summary & portal setup instructions directly to individual customer"
        icon={<FileCode size={16} />}
        actions={
          customer.techMailDraft?.sent ? (
            <Badge tone="green">Email Sent to Recipient</Badge>
          ) : (
            <Badge tone="orange">Draft Ready</Badge>
          )
        }
      >
        <div className="space-y-3.5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="To (Individual Recipient Email)">
              <TextInput
                value={mailForm.to}
                onChange={(e) => setMailForm({ ...mailForm, to: e.target.value })}
                placeholder="customer@company.com"
              />
            </Field>
            <Field label="CC (Salesperson / Team)">
              <TextInput
                value={mailForm.cc}
                onChange={(e) => setMailForm({ ...mailForm, cc: e.target.value })}
                placeholder="onboarding@mvload.in"
              />
            </Field>
          </div>

          <Field label="Subject Line">
            <TextInput
              value={mailForm.subject}
              onChange={(e) =>
                setMailForm({ ...mailForm, subject: e.target.value })
              }
            />
          </Field>

          <Field
            label="Email Body (Auto-generated from CIS details)"
            hint="Includes company type, volume, consignee distribution %, target zones & insurance"
          >
            <TextArea
              value={mailForm.body}
              onChange={(e) =>
                setMailForm({ ...mailForm, body: e.target.value })
              }
              className="min-h-[160px] font-mono text-xs leading-relaxed"
            />
          </Field>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3.5">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="text-xs"
                onClick={() => setMailPreviewOpen(true)}
              >
                <Eye size={13} /> Preview Full Mail
              </Button>
              {customer.techMailDraft?.sent && (
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 size={13} /> Sent on{" "}
                  {fmtDateTime(customer.techMailDraft.sentAt || new Date().toISOString())}
                </span>
              )}
            </div>

            <Button
              onClick={handleSendTechMail}
              className={cn(
                "text-xs px-4",
                customer.techMailDraft?.sent
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-brand-500 hover:bg-brand-600"
              )}
            >
              <Send size={13} />
              {customer.techMailDraft?.sent
                ? "Re-send Email to Recipient"
                : "Send Email to Recipient"}
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Customer Login Credentials */}
      <Card
        title="Customer Login Credentials"
        subtitle="1st Step: Send OTP to email · 2nd Step: Verify OTP to generate random login password"
        icon={<Globe2 size={16} />}
        actions={
          portal ? (
            portal.status === "activated" ? (
              <Badge tone="green">OTP Verified · Password Generated</Badge>
            ) : (
              <Badge tone="orange">OTP Sent · Verification Pending</Badge>
            )
          ) : (
            <Badge tone="gray">Not Started</Badge>
          )
        }
      >
        {!portal ? (
          <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-brand-300 bg-brand-50/50 p-6 sm:flex-row sm:items-center">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-500/40">
              <KeyRound size={22} />
            </span>
            <div className="flex-1">
              <p className="font-display text-[15px] font-semibold text-ink-900">
                Initiate Portal Verification Process
              </p>
              <p className="mt-0.5 text-xs text-ink-500">
                Dispatches a 6-digit OTP to{" "}
                <span className="font-semibold text-ink-700">
                  {customer.lead.email || "customer email"}
                </span>. Once verified, a random access password will be generated for the customer portal.
              </p>
            </div>
            <Button onClick={createPortal}>
              <Send size={15} /> Send OTP to Email
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-xs">
              <p className="mb-3 text-[13px] font-bold text-ink-900 flex items-center justify-between">
                <span>Customer Login Credentials</span>
                {portal.status === "activated" ? (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Active & Ready
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 font-semibold">
                    Awaiting OTP Verification
                  </span>
                )}
              </p>

              {[
                { label: "Registered Email / Username", value: portal.username },
                {
                  label: "Generated Access Password",
                  value: portal.status === "activated" ? portal.password : "(Generated upon OTP verification)",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="mb-2.5 flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2.5 ring-1 ring-gray-100"
                >
                  <div className="min-w-0">
                    <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">
                      {row.label}
                    </p>
                    <p className="truncate font-mono text-[13px] font-semibold text-ink-900">
                      {row.value}
                    </p>
                  </div>
                  {portal.status === "activated" && (
                    <button
                      onClick={() => copy(row.value, row.label)}
                      className="rounded-md p-1.5 text-ink-400 transition hover:bg-brand-100 hover:text-brand-700"
                      title="Copy"
                    >
                      <Copy size={14} />
                    </button>
                  )}
                </div>
              ))}
              <p className="text-[11px] text-ink-400 mt-2">
                Created {fmtDateTime(portal.createdAt)} · OTP sent to {customer.lead.email || portal.username}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-xs">
              <p className="mb-3 text-[13px] font-bold text-ink-900">
                Verification & Access Workflow
              </p>
              <ol className="space-y-2.5">
                {statusSteps.map((s, i) => (
                  <li key={s.label} className="flex items-center gap-2.5">
                    {s.done ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <CheckCircle2 size={13} />
                      </span>
                    ) : i === statusSteps.findIndex((x) => !x.done) ? (
                      <span className="pulse-ring flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
                        <CircleDot size={12} />
                      </span>
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                        <Circle size={10} className="text-gray-300" />
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        s.done ? "text-ink-900 font-semibold" : "text-ink-400"
                      )}
                    >
                      {s.label}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex flex-wrap gap-2">
                {portal.status !== "activated" && (
                  <Button
                    variant="outline"
                    className="px-3 py-1.5 text-xs"
                    onClick={resendOtp}
                  >
                    <MailCheck size={14} /> Resend OTP
                  </Button>
                )}
                <Button
                  className="px-3 py-1.5 text-xs bg-ink-900 hover:bg-ink-800"
                  onClick={onOpenPortal}
                >
                  <ExternalLink size={14} /> Open Customer Panel & Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 3. Rate & Charge Change Requests */}
      {portal && (
        <Card
          title="Rate & Charge Change Requests (From Customer Panel)"
          subtitle="Raised by customer in Standard Rate & TAT page — approvals immediately update live customer rates"
          icon={<Clock3 size={16} />}
          actions={
            pending.length ? (
              <Badge tone="orange">{pending.length} pending</Badge>
            ) : undefined
          }
        >
          {portal.requests.length === 0 ? (
            <p className="py-4 text-center text-xs text-ink-400">
              No rate or charge change requests raised yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {portal.requests.map((r) => (
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
                      {r.unit === "%" ? `${r.currentRate}%` : `₹${r.currentRate}`} →{" "}
                      <span className="font-bold text-brand-600">
                        {r.unit === "%" ? `${r.proposedRate}%` : `₹${r.proposedRate}`}
                      </span>
                      {r.reason && <> · “{r.reason}”</>}
                    </p>
                  </div>
                  {r.kind === "rate" && (
                    <Badge tone={toneBadge[r.likelihood] ?? "gray"}>
                      {r.likelihood} acceptance
                    </Badge>
                  )}
                  <p className="text-[11px] text-ink-400">{fmtDateTime(r.ts)}</p>
                  {r.status === "pending" ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          resolveRequest(customer.id, r.id, "approved");
                          log(
                            customer.id,
                            `${r.kind === "rate" ? "Rate" : "Charge"} request approved — ${r.kind === "rate" ? `${r.zone} · ${r.slab}` : r.chargeName} updated to ${r.unit === "%" ? `${r.proposedRate}%` : `₹${r.proposedRate}`}`,
                            "green"
                          );
                          toast(
                            "success",
                            "Request approved — updated live in customer panel."
                          );
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
                    <Badge tone={r.status === "approved" ? "green" : "red"}>
                      {r.status === "approved" ? "Approved" : "Rejected"}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tech Team Email Modal Preview */}
      <Modal
        open={mailPreviewOpen}
        onClose={() => setMailPreviewOpen(false)}
        title="Tech Team Panel Provisioning Email Preview"
        wide
      >
        <div className="overflow-hidden rounded-lg border border-gray-200 text-xs">
          <div className="space-y-1 border-b border-gray-100 bg-gray-50 px-4 py-3">
            <p>
              <span className="font-bold text-ink-600">To:</span> {mailForm.to}
            </p>
            <p>
              <span className="font-bold text-ink-600">CC:</span> {mailForm.cc}
            </p>
            <p>
              <span className="font-bold text-ink-600">Subject:</span>{" "}
              <span className="font-semibold text-ink-900">{mailForm.subject}</span>
            </p>
          </div>
          <div className="whitespace-pre-line p-4 font-mono text-ink-800 leading-relaxed max-h-96 overflow-y-auto nice-scroll">
            {mailForm.body}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setMailPreviewOpen(false)}>
            Close
          </Button>
          <Button onClick={handleSendTechMail}>
            <Send size={14} /> Send Email to Tech Team
          </Button>
        </div>
      </Modal>
    </div>
  );
}
