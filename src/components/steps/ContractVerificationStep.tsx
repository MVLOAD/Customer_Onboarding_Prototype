import { useState } from "react";
import {
  FileSignature,
  Lock,
  ShieldCheck,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { useStore } from "../../store";
import type { Customer } from "../../types";
import { fmtDateTime } from "../../data";
import { Badge, Button, Card } from "../ui";
import { cn } from "../../utils/cn";

export default function ContractVerificationStep({
  customer,
}: {
  customer: Customer;
}) {
  const { verifyContract, log, toast } = useStore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isLocked =
    customer.stage === "lead" ||
    customer.stage === "cis" ||
    customer.stage === "portal" ||
    customer.stage === "rates-tat" ||
    customer.stage === "contract-creation";

  if (isLocked) {
    return (
      <Card
        title="Contract Verification"
        icon={<FileSignature size={16} />}
      >
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-ink-400">
            <Lock size={18} />
          </span>
          <p className="font-semibold text-ink-700">This step is locked</p>
          <p className="max-w-sm text-xs text-ink-500">
            The customer must{" "}
            <span className="font-semibold text-brand-600">
              sign and upload the contract
            </span>{" "}
            from their panel before admin verification becomes available.
          </p>
        </div>
      </Card>
    );
  }

  const contract = customer.contract;
  const alreadyVerified =
    customer.stage === "done" || contract?.verifiedByAdmin;

  const handleVerify = () => {
    verifyContract(customer.id);
    log(
      customer.id,
      "Contract verified by admin — customer is fully onboarded & live!",
      "green"
    );
    toast(
      "success",
      `${customer.lead.company} is now fully onboarded & live!`
    );
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      {alreadyVerified ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <BadgeCheck size={20} />
          </span>
          <div className="flex-1">
            <p className="font-bold text-emerald-900">
              Contract Verified — Customer is Onboarded & Live!
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Verified on{" "}
              {contract?.verifiedAt ? fmtDateTime(contract.verifiedAt) : "—"}
            </p>
          </div>
          <Badge tone="green">Live ✓</Badge>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
            <AlertTriangle size={20} />
          </span>
          <div className="flex-1">
            <p className="font-bold text-amber-900">
              Signed Contract Uploaded — Admin Review Required
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Review the uploaded signed contract and verify to complete onboarding.
            </p>
          </div>
          <Badge tone="orange">Pending Verification</Badge>
        </div>
      )}

      {/* Uploaded Contract */}
      <Card
        title="Uploaded Signed Contract"
        icon={<Upload size={16} />}
        actions={
          contract?.signedContractFile ? (
            <Badge tone={alreadyVerified ? "green" : "orange"}>
              {alreadyVerified ? "Verified" : "Awaiting Review"}
            </Badge>
          ) : undefined
        }
      >
        {contract?.signedContractFile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50/60 px-5 py-4 shadow-xs">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <FileText size={22} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink-900 text-sm truncate">
                  {contract.signedContractFile.name}
                </p>
                <p className="text-xs text-ink-500 mt-0.5">
                  {(contract.signedContractFile.size / 1024).toFixed(1)} KB ·
                  Uploaded{" "}
                  {fmtDateTime(contract.signedContractFile.uploadedAt)}
                </p>
              </div>
              {alreadyVerified && (
                <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
              )}
            </div>

            {/* Contract Snapshot Summary */}
            <div>
              <p className="text-xs font-bold text-ink-600 mb-2 uppercase tracking-wide">
                Locked Contract Snapshot
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {contract.chargesSnapshot.slice(0, 4).map((ch) => (
                  <div
                    key={ch.id}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2.5"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                      {ch.name}
                    </p>
                    <p className="font-mono text-sm font-bold text-ink-900 mt-0.5">
                      {ch.unit === "%" ? `${ch.value}%` : `₹${ch.value}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Verify Action */}
            {!alreadyVerified && (
              <div
                className={cn(
                  "rounded-xl border px-5 py-4",
                  confirmOpen
                    ? "border-red-200 bg-red-50"
                    : "border-gray-200 bg-white"
                )}
              >
                {!confirmOpen ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink-900 text-sm">
                        Verify & Approve Contract
                      </p>
                      <p className="text-xs text-ink-500 mt-0.5">
                        This will mark the signed contract as verified and activate the customer as fully onboarded & live.
                      </p>
                    </div>
                    <Button
                      onClick={() => setConfirmOpen(true)}
                      className="shrink-0 bg-emerald-600 hover:bg-emerald-700 px-5"
                    >
                      <ShieldCheck size={15} /> Verify Contract
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-500 shrink-0" />
                      <p className="text-sm font-bold text-red-800">
                        This action is irreversible
                      </p>
                    </div>
                    <p className="text-xs text-red-700">
                      Verifying the contract will mark{" "}
                      <strong>{customer.lead.company}</strong> as fully onboarded &
                      live. The customer will gain full panel access.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleVerify}
                        className="bg-emerald-600 hover:bg-emerald-700 px-5"
                      >
                        <BadgeCheck size={15} /> Confirm & Go Live
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setConfirmOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-500">
              <Upload size={18} />
            </span>
            <p className="font-semibold text-ink-700">
              No signed contract uploaded yet
            </p>
            <p className="max-w-sm text-xs text-ink-500">
              Waiting for the customer to sign and upload the contract from their panel.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
