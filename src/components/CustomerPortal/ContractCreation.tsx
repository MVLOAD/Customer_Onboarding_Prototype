import { useState, useRef } from "react";
import {
  FileSignature,
  Upload,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
  FileText,
  Printer,
} from "lucide-react";
import { useStore } from "../../store";
import type { Customer } from "../../types";
import { fmtDateTime } from "../../data";
import { Badge, Button, Modal } from "../ui";
import { cn } from "../../utils/cn";

const T_AND_C = [
  {
    title: "1. Scope of Services",
    body: "MV Load Logistics Pvt. Ltd. (\u2018MV Load\u2019) agrees to provide freight and logistics services including pickup, transit, and delivery as per the rates and service levels defined in Schedule A (Rates) and Schedule B (TAT) attached herewith. Services are subject to availability and route feasibility.",
  },
  {
    title: "2. Payment Terms",
    body: "The Customer agrees to pay all applicable charges as per the agreed rate card. For Postpaid accounts, invoices are raised on the 1st of each calendar month for the preceding month. For Prepaid accounts, the Customer must maintain a sufficient wallet balance. All payments are due within 15 days of invoice date. Late payments attract 18% p.a. interest.",
  },
  {
    title: "3. Credit Limit",
    body: "MV Load may grant a credit limit at its discretion. MV Load reserves the right to suspend services if outstanding amounts exceed the approved credit limit. The Customer agrees not to use credit limit for payments unrelated to logistics services.",
  },
  {
    title: "4. Consignment Liability",
    body: "MV Load's liability for loss, damage, or delay is limited to the lower of actual value or ₹5,000 per consignment under Owner Risk. Under Carrier Risk coverage, liability extends to the declared invoice value subject to maximum coverage limits as defined by MV Load's insurance policy. Claims must be filed within 7 days of delivery (or expected delivery in case of non-delivery).",
  },
  {
    title: "5. Prohibited & Restricted Goods",
    body: "The Customer warrants that no consignment shall contain prohibited items including but not limited to: hazardous materials, contraband, live animals, human remains, currency, or items violating any applicable law. MV Load reserves the right to open and inspect any package and refuse service without liability.",
  },
  {
    title: "6. Force Majeure",
    body: "Neither party shall be liable for delays or failures in performance resulting from acts beyond their reasonable control including natural disasters, strikes, government actions, pandemics, or other force majeure events. The affected party shall notify the other within 48 hours of such an event.",
  },
  {
    title: "7. Confidentiality",
    body: "Both parties agree to keep the terms of this Agreement, including the rate card, strictly confidential and not disclose the same to any third party without prior written consent, except as required by law.",
  },
  {
    title: "8. Term & Termination",
    body: "This Agreement shall be valid for 12 months from the date of execution and shall auto-renew for successive 12-month periods unless terminated by either party with 30 days written notice. MV Load may terminate immediately upon material breach by the Customer.",
  },
  {
    title: "9. Governing Law & Dispute Resolution",
    body: "This Agreement shall be governed by the laws of India. Any disputes shall first be attempted to be resolved through mutual negotiation. In the absence of resolution within 30 days, disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, with a sole arbitrator appointed by mutual consent. The seat of arbitration shall be Bangalore, Karnataka.",
  },
  {
    title: "10. Entire Agreement",
    body: "This Agreement, together with Schedules A and B, constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to the subject matter hereof.",
  },
];

export default function ContractCreation({ customer }: { customer: Customer }) {
  const { uploadSignedContract, mutate, log, toast } = useStore();
  const [contractMode, setContractMode] = useState<"company_standard" | "custom_upload">("company_standard");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [contractOtpInput, setContractOtpInput] = useState("");
  const [contractOtpErr, setContractOtpErr] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contractRef = useRef<HTMLDivElement>(null);

  const contract = customer.contract;
  const portal = customer.portal;
  const isFrozen =
    customer.stage === "contract-creation" ||
    customer.stage === "contract-verification" ||
    customer.stage === "done";

  const contractVerified =
    customer.stage === "done" || contract?.verifiedByAdmin;
  const contractSubmitted = Boolean(contract?.signedContractFile) || contract?.otpVerified;

  // Use snapshot if frozen, otherwise live portal data
  const rateSlabs = contract?.rateSlabsSnapshot ?? portal?.rateSlabs ?? [];
  const rates = contract?.ratesSnapshot ?? portal?.rates ?? [];
  const charges = contract?.chargesSnapshot ?? portal?.charges ?? [];

  if (!portal && !contract) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-xs">
        <p className="font-semibold text-ink-700">
          Your contract is not ready yet.
        </p>
        <p className="text-xs text-ink-500 mt-1">
          Please complete the Rates & TAT step first.
        </p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      toast("error", "Only PDF or image files are accepted.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast("error", "File size must be under 10MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmitFile = () => {
    if (!selectedFile) return;
    uploadSignedContract(customer.id, {
      name: selectedFile.name,
      size: selectedFile.size,
    });
    toast(
      "success",
      "Signed custom contract submitted! Our team will verify and activate your account shortly."
    );
    setSelectedFile(null);
  };

  const handleInitiateOtpAcceptance = () => {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(otp);
    setContractOtpInput("");
    setContractOtpErr("");
    setOtpModalOpen(true);
    toast("info", `OTP sent to customer email (${customer.lead.email || portal?.username || "customer"}).`);
  };

  const handleVerifyContractOtp = () => {
    if (contractOtpInput.trim() === generatedOtp) {
      mutate(customer.id, (c) => ({
        ...c,
        stage: "done" as const,
        contract: {
          generatedAt: c.contract?.generatedAt || new Date().toISOString(),
          acceptedByCustomer: true,
          acceptedAt: new Date().toISOString(),
          verifiedByAdmin: true,
          verifiedAt: new Date().toISOString(),
          otpVerified: true,
          contractType: "company_standard",
          chargesSnapshot: c.contract?.chargesSnapshot || c.portal?.charges || [],
          ratesSnapshot: c.contract?.ratesSnapshot || c.portal?.rates || [],
          rateSlabsSnapshot: c.contract?.rateSlabsSnapshot || c.portal?.rateSlabs || [],
        },
      }));

      log(
        customer.id,
        "Customer accepted standard contract via email OTP verification — contract completed & accepted from both ends!",
        "green"
      );
      toast("success", "Contract accepted and verified via OTP! Account is now live.");
      setOtpModalOpen(false);
    } else {
      setContractOtpErr("Incorrect OTP code. Please check and try again.");
      toast("error", "OTP code mismatch.");
    }
  };

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 pb-10 anim-fade-up select-none">
      {/* Status Banner */}
      {contractVerified ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <ShieldCheck size={20} />
          </span>
          <div className="flex-1">
            <p className="font-bold text-emerald-900">
              Contract Verified — You're Onboarded & Live!
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {contract?.otpVerified
                ? `Accepted & Verified via Email OTP on ${contract?.verifiedAt ? fmtDateTime(contract.verifiedAt) : today}. Contract is signed and active on both ends!`
                : `Your contract was verified on ${contract?.verifiedAt ? fmtDateTime(contract.verifiedAt) : "—"}. Welcome to MV Load!`}
            </p>
          </div>
          <Badge tone="green">Live ✓</Badge>
        </div>
      ) : contractSubmitted ? (
        <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
            <Clock size={20} />
          </span>
          <div className="flex-1">
            <p className="font-bold text-sky-900">
              Signed Contract Submitted — Pending Admin Verification
            </p>
            <p className="text-xs text-sky-700 mt-0.5">
              We're reviewing your uploaded contract. You'll be notified once verified.
            </p>
          </div>
          <Badge tone="blue">Under Review</Badge>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
            <AlertCircle size={20} />
          </span>
          <div className="flex-1">
            <p className="font-bold text-amber-900">
              Contract Execution Required
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Accept our standard contract via instant email OTP or upload your custom signed contract document below.
            </p>
          </div>
        </div>
      )}

      {/* Contract Document */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-ink-900 to-ink-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <FileSignature size={20} className="text-white/80" />
            <div>
              <p className="font-display text-sm font-bold text-white">
                Logistics Services Agreement
              </p>
              <p className="text-xs text-white/60">
                {isFrozen && contract?.generatedAt
                  ? `Generated ${fmtDateTime(contract.generatedAt)}`
                  : "Draft — charges will be locked upon acceptance"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isFrozen && <Badge tone="green">Charges Locked ✓</Badge>}
            <button
              onClick={handlePrint}
              title="Download / Print PDF"
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <Printer size={13} /> Download PDF
            </button>
          </div>
        </div>

        {/* Contract Body */}
        <div
          ref={contractRef}
          className="px-8 py-8 print:px-12 print:py-10 space-y-8 text-ink-800"
          id="contract-body"
        >
          {/* Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-gray-800 pb-5">
            <div>
              <img
                src="/mvload.png"
                alt="MV Load"
                className="h-10 w-auto mb-1"
              />
              <p className="text-xs text-ink-500">
                MV Load Logistics Pvt. Ltd.
              </p>
              <p className="text-xs text-ink-500">
                Registered Office: Bangalore, Karnataka — 560001
              </p>
              <p className="text-xs text-ink-500">CIN: U63090KA2023PTC000001</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-extrabold text-ink-900 tracking-tight">
                LOGISTICS SERVICES AGREEMENT
              </p>
              <p className="text-xs text-ink-500 mt-1">Date: {today}</p>
              <p className="text-xs text-ink-500">
                Ref: LSA/{customer.lead.company.slice(0, 4).toUpperCase()}/
                {new Date().getFullYear()}
              </p>
            </div>
          </div>

          {/* Parties */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-2">
                Party A — Service Provider
              </p>
              <p className="font-bold text-ink-900">
                MV Load Logistics Pvt. Ltd.
              </p>
              <p className="text-xs text-ink-600 mt-1">
                (hereinafter referred to as "MV Load")
              </p>
              <div className="mt-3 space-y-0.5 text-xs text-ink-600">
                <p>GSTIN: 29AABCM1234F1Z5</p>
                <p>Email: contracts@mvload.in</p>
                <p>Phone: +91-80-4567-8900</p>
              </div>
            </div>
            <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-500 mb-2">
                Party B — Customer
              </p>
              <p className="font-bold text-ink-900">
                {customer.lead.company || "Customer Company"}
              </p>
              <p className="text-xs text-ink-600 mt-1">
                (hereinafter referred to as "Customer")
              </p>
              <div className="mt-3 space-y-0.5 text-xs text-ink-600">
                {customer.cis?.pan && <p>PAN: {customer.cis.pan}</p>}
                {customer.cis?.gst && <p>GSTIN: {customer.cis.gst}</p>}
                <p>Contact: {customer.lead.name}</p>
                <p>Email: {customer.lead.email}</p>
              </div>
            </div>
          </div>

          {/* Preamble */}
          <div>
            <p className="text-sm leading-relaxed text-ink-700">
              This Logistics Services Agreement ("Agreement") is entered into as
              of <strong>{today}</strong> between{" "}
              <strong>MV Load Logistics Pvt. Ltd.</strong> and{" "}
              <strong>{customer.lead.company}</strong>. Both parties agree to
              the terms and conditions set forth below, including the rate
              schedule and service level commitments detailed in the Schedules
              appended hereto.
            </p>
          </div>

          {/* Terms & Conditions */}
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 mb-4 border-b border-gray-200 pb-2">
              General Terms & Conditions
            </h3>
            <div className="space-y-4">
              {T_AND_C.map((clause) => (
                <div key={clause.title}>
                  <p className="font-bold text-ink-900 text-sm mb-1">
                    {clause.title}
                  </p>
                  <p className="text-xs leading-relaxed text-ink-600">
                    {clause.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule A — Rate Card */}
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 mb-1 border-b border-gray-200 pb-2">
              Schedule A — Agreed Rate Card (₹ per unit)
            </h3>
            <p className="text-xs text-ink-500 mb-3">
              {isFrozen
                ? "Rates are frozen as of acceptance date and cannot be modified."
                : "Rates are indicative and will be locked upon charge acceptance."}
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-ink-900 text-white">
                    <th className="px-4 py-2.5 text-left font-bold">Zone</th>
                    {rateSlabs.map((s) => (
                      <th
                        key={s}
                        className="px-3 py-2.5 text-right font-bold"
                      >
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rates.map((row, i) => (
                    <tr
                      key={row.zone}
                      className={cn(
                        "border-b border-gray-100",
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
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
                          ₹{v.toLocaleString("en-IN")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schedule B — Special Charges */}
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 mb-1 border-b border-gray-200 pb-2">
              Schedule B — Special Charges
            </h3>
            <p className="text-xs text-ink-500 mb-3">
              Applicable surcharges and special handling fees as agreed.
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {charges.map((ch) => (
                <div
                  key={ch.id}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                >
                  <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-400">
                    {ch.name}
                  </p>
                  <p className="font-mono text-base font-bold text-ink-900 mt-0.5">
                    {ch.unit === "%" ? `${ch.value}%` : `₹${ch.value}`}
                  </p>
                  <p className="text-[10px] text-ink-500 mt-0.5">{ch.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Block */}
          <div className="border-t-2 border-gray-800 pt-6">
            <p className="text-sm font-bold text-ink-900 mb-5 text-center">
              IN WITNESS WHEREOF, the parties have executed this Agreement as of
              the date first written above.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="h-14 border-b border-gray-400 relative">
                  {contractVerified && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-bold text-emerald-700 text-xs italic">
                        [Digitally Verified]
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-ink-900">
                  For MV Load Logistics Pvt. Ltd.
                </p>
                <p className="text-xs text-ink-500">
                  Authorized Signatory
                </p>
                <p className="text-xs text-ink-500">Date: _______________</p>
              </div>
              <div className="space-y-2">
                <div className="h-14 border-b border-gray-400 relative">
                  {contract?.signedContractFile && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-bold text-brand-700 text-xs italic">
                        [Signed Copy Submitted]
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-ink-900">
                  For {customer.lead.company}
                </p>
                <p className="text-xs text-ink-500">
                  Authorized Signatory — {customer.lead.name}
                </p>
                <p className="text-xs text-ink-500">Date: _______________</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Execution Section */}
      {!contractVerified && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-display text-base font-bold text-ink-900">
                Choose Contract Acceptance Method
              </h3>
              <p className="text-xs text-ink-500">
                Accept our standard logistics agreement instantly via email OTP or upload your custom signed agreement document.
              </p>
            </div>

            <div className="flex rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setContractMode("company_standard")}
                className={cn(
                  "rounded-lg px-4 py-2 text-xs font-bold transition",
                  contractMode === "company_standard"
                    ? "bg-white text-brand-700 shadow-xs"
                    : "text-ink-600 hover:text-ink-900"
                )}
              >
                1. Accept Standard Contract (OTP)
              </button>
              <button
                type="button"
                onClick={() => setContractMode("custom_upload")}
                className={cn(
                  "rounded-lg px-4 py-2 text-xs font-bold transition",
                  contractMode === "custom_upload"
                    ? "bg-white text-brand-700 shadow-xs"
                    : "text-ink-600 hover:text-ink-900"
                )}
              >
                2. Upload Custom Contract
              </button>
            </div>
          </div>

          {contractMode === "company_standard" ? (
            <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-display text-sm font-bold text-brand-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  Accept Company Standard Contract via Email OTP
                </p>
                <p className="text-xs text-ink-600 max-w-xl">
                  By clicking <strong>"Accept Contract & Send OTP"</strong>, an authorization code will be emailed to{" "}
                  <span className="font-semibold text-ink-800">{customer.lead.email || portal?.username}</span>. Entering this code completes legal agreement acceptance from both ends instantly.
                </p>
              </div>

              <Button
                onClick={handleInitiateOtpAcceptance}
                className="bg-brand-600 hover:bg-brand-700 font-bold text-xs shrink-0 px-5 py-2.5 shadow-brand-200 shadow-md"
              >
                <FileSignature size={15} /> Accept Contract & Send OTP
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-brand-600" />
                <h4 className="font-display text-sm font-bold text-ink-900">
                  {contractSubmitted ? "Contract Submitted for Verification" : "Upload Custom Signed Contract"}
                </h4>
              </div>

              {contractSubmitted ? (
                <div className="flex items-center gap-4 rounded-xl border border-sky-200 bg-sky-50 px-5 py-4">
                  <FileText size={22} className="text-sky-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sky-900 text-sm truncate">
                      {contract?.signedContractFile?.name || "Uploaded_Contract.pdf"}
                    </p>
                    <p className="text-xs text-sky-600 mt-0.5">
                      Uploaded {contract?.signedContractFile?.uploadedAt ? fmtDateTime(contract.signedContractFile.uploadedAt) : "—"} · Pending admin verification
                    </p>
                  </div>
                  <CheckCircle2 size={20} className="text-sky-500 shrink-0" />
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-ink-500">
                    Print or export your custom contract → sign & stamp → upload the scanned file below.
                  </p>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileChange(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition cursor-pointer",
                      dragOver
                        ? "border-brand-500 bg-brand-50"
                        : selectedFile
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50/40"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange(e.target.files?.[0] ?? null)
                      }
                    />
                    {selectedFile ? (
                      <>
                        <CheckCircle2
                          size={32}
                          className="text-emerald-500 mb-2"
                        />
                        <p className="font-bold text-emerald-800 text-sm">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          {(selectedFile.size / 1024).toFixed(1)} KB — ready to submit
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                        >
                          <X size={12} /> Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload
                          size={32}
                          className="text-ink-400 mb-2"
                        />
                        <p className="font-semibold text-ink-700 text-sm">
                          Drag & drop or{" "}
                          <span className="text-brand-600">click to browse</span>
                        </p>
                        <p className="text-xs text-ink-400 mt-1">
                          PDF, JPG, PNG — max 10MB
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <Button
                      onClick={handleSubmitFile}
                      disabled={!selectedFile}
                      className={cn(
                        "px-6",
                        selectedFile
                          ? "bg-brand-500 hover:bg-brand-600"
                          : "bg-gray-300 cursor-not-allowed"
                      )}
                    >
                      <Upload size={14} /> Submit Custom Contract
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Contract Verification OTP Modal */}
      <Modal
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        title="Verify Contract Acceptance via Email OTP"
      >
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4">
            <p className="font-bold text-brand-900 text-sm mb-1">Authorization Code Sent</p>
            <p className="text-ink-600 leading-relaxed">
              We emailed a 6-digit contract verification OTP to{" "}
              <strong className="text-ink-900">{customer.lead.email || portal?.username}</strong>.
            </p>
            {generatedOtp && (
              <p className="mt-2 text-[11px] text-ink-500">
                Simulated Email OTP Code: <strong className="font-mono text-brand-700 text-sm">{generatedOtp}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-ink-700 mb-1">
              Enter 6-Digit Verification OTP
            </label>
            <input
              value={contractOtpInput}
              onChange={(e) => {
                setContractOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6));
                setContractOtpErr("");
              }}
              placeholder="••••••"
              inputMode="numeric"
              className={cn(
                "w-full rounded-xl border bg-white px-3 py-2.5 text-center font-mono text-2xl font-bold tracking-[0.4em] text-ink-900 outline-none transition focus:ring-2",
                contractOtpErr
                  ? "border-red-400 focus:ring-red-100"
                  : "border-gray-300 focus:border-brand-500 focus:ring-brand-100"
              )}
            />
            {contractOtpErr && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">{contractOtpErr}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                if (generatedOtp) setContractOtpInput(generatedOtp);
              }}
              className="text-brand-600 font-bold text-[11px] hover:underline"
            >
              Auto-fill Code ({generatedOtp})
            </button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOtpModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleVerifyContractOtp}
                disabled={contractOtpInput.length !== 6}
                className="bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                <CheckCircle2 size={15} /> Confirm & Accept Contract
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
