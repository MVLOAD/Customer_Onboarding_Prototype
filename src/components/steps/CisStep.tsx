import { useState } from "react";
import {
  Building2,
  FileText,
  Save,
  SendHorizonal,
  Lock,
  ShieldAlert,
  ShieldCheck,
  TableProperties,
} from "lucide-react";
import { useStore } from "../../store";
import type { CisData, ConsigneeRow, Customer, Stage } from "../../types";
import {
  COMPANY_TYPES,
  defaultConsigneeTable,
  INDUSTRIES,
  INDUSTRY_SUB_CATEGORIES,
  INDUSTRY_CONSIGNEE_SUB_CATEGORIES,
  MONTHLY_POTENTIAL_RANGES,
  PACKING_TYPES,
  PRODUCT_CATEGORIES,
  TARGET_ZONES,
  TURNOVER_RANGES,
  validators,
} from "../../data";
import { Badge, Button, Card, Field, Select, TextInput } from "../ui";
import { cn } from "../../utils/cn";

const emptyCis = (lead?: Customer["lead"]): CisData => ({
  company: lead?.company || "",
  industry: INDUSTRIES[0],
  companyType: COMPANY_TYPES[0],
  productCategory: PRODUCT_CATEGORIES[0],
  packingType: PACKING_TYPES[0],
  turnover: TURNOVER_RANGES[1],
  monthlyPotential: MONTHLY_POTENTIAL_RANGES[1],
  weightPerMonth: "5 Tons",
  valueInLakhsPerMonth: "25",
  zoneTarget: [TARGET_ZONES[0], TARGET_ZONES[1]],
  consigneeTable: defaultConsigneeTable(),
  insuranceType: "carrier_risk",
  pan: "",
  gst: "",
  businessType: "Private Limited",
  website: "",
  annualVolume: "1,000 – 5,000 shipments",
  branches: "1",
  address: "",
  pincode: "",
  contactPerson: lead?.name || "",
  mobile: lead?.mobile || "",
  email: lead?.email || "",
  documents: {
    "PAN Card": null,
    "GST Certificate": null,
    "Cancelled Cheque": null,
    "Address Proof": null,
  },
  status: "draft",
});

export default function CisStep({
  customer,
  onAdvance,
}: {
  customer: Customer;
  onAdvance: () => void;
}) {
  const { mutate, log, toast } = useStore();
  const [form, setForm] = useState<CisData>(
    customer.cis ?? emptyCis(customer.lead)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const locked = (customer.stage === "lead") as boolean;

  const set = <K extends keyof CisData>(k: K, v: CisData[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [String(k)]: "" }));
  };

  const persist = (patch: Partial<CisData>) =>
    mutate(customer.id, (c) => ({
      ...c,
      cis: { ...(c.cis ?? emptyCis(c.lead)), ...patch },
    }));

  const updateConsigneeRow = (
    idx: number,
    patch: Partial<ConsigneeRow>
  ) => {
    const table = [...form.consigneeTable];
    table[idx] = { ...table[idx], ...patch };
    set("consigneeTable", table);
  };

  const toggleZoneTarget = (zone: string) => {
    const curr = form.zoneTarget || [];
    if (curr.includes(zone)) {
      set("zoneTarget", curr.filter((z) => z !== zone));
    } else {
      set("zoneTarget", [...curr, zone]);
    }
  };

  const consigneeTotalPercent = (form.consigneeTable || []).reduce(
    (acc, row) => (row.checked ? acc + (Number(row.percent) || 0) : acc),
    0
  );

  const validate = () => {
    const e: Record<string, string> = {
      company: validators.required(form.company),
      industry: validators.required(form.industry),
      companyType: validators.required(form.companyType),
      turnover: validators.required(form.turnover),
      monthlyPotential: validators.required(form.monthlyPotential),
      weightPerMonth: validators.required(form.weightPerMonth),
      valueInLakhsPerMonth: validators.required(form.valueInLakhsPerMonth),
    };
    const clean = Object.fromEntries(Object.entries(e).filter(([, v]) => v));
    setErrors(clean);
    return Object.keys(clean).length === 0;
  };

  const saveDraft = () => {
    persist(form);
    log(customer.id, "CIS draft saved", "gray");
    toast("success", "CIS draft saved successfully.");
  };

  const submit = () => {
    if (!validate()) {
      toast("error", "Please fill all required CIS fields correctly.");
      return;
    }
    persist({
      ...form,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
    mutate(customer.id, (c) => ({ ...c, stage: "portal" as Stage }));
    log(
      customer.id,
      `CIS form submitted with complete business profile (${form.companyType}, ${form.industry}, Insurance: ${form.insuranceType === "carrier_risk" ? "Carrier Risk" : "Owner Risk"})`,
      "green"
    );
    toast(
      "success",
      "CIS form submitted! Step 3 (Introduction to Company & Tech Panel) is unlocked."
    );
    onAdvance();
  };

  if (locked) {
    return (
      <Card title="CIS Form" icon={<FileText size={16} />}>
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-ink-400">
            <Lock size={18} />
          </span>
          <p className="font-semibold text-ink-700">This step is locked</p>
          <p className="max-w-sm text-xs text-ink-500">
            Complete <span className="font-semibold text-brand-600">Lead Generation</span> to unlock the Customer Information Sheet.
          </p>
        </div>
      </Card>
    );
  }

  const submitted = form.status === "submitted";

  return (
    <Card
      title="Customer Information Sheet (CIS)"
      subtitle="Complete profile, company operations, consignee business breakdown & insurance"
      icon={<FileText size={16} />}
      actions={
        submitted ? (
          <Badge tone="green">Submitted</Badge>
        ) : (
          <Badge tone="orange">In progress</Badge>
        )
      }
    >
      {/* 1. Company Profile & Operational Details */}
      <SectionTitle
        icon={<Building2 size={14} />}
        title="Company & Operational Profile"
        subtitle="Business classification and volume metrics"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Field
          label="Company Name"
          required
          error={errors.company}
          className="md:col-span-2"
        >
          <TextInput
            value={form.company}
            invalid={!!errors.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Official registered company name"
          />
        </Field>

        <Field label="Industry" required error={errors.industry}>
          <Select
            value={form.industry}
            onChange={(e) => {
              const newInd = e.target.value;
              const subCats = INDUSTRY_SUB_CATEGORIES[newInd] || [];
              setForm((f) => ({
                ...f,
                industry: newInd,
                industrySubCategory: subCats[0] || "",
              }));
              setErrors((err) => ({ ...err, industry: "" }));
            }}
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Industry Sub-Category" hint="Sub-classification">
          <Select
            value={form.industrySubCategory || (INDUSTRY_SUB_CATEGORIES[form.industry]?.[0] || "")}
            onChange={(e) => set("industrySubCategory", e.target.value)}
          >
            {(INDUSTRY_SUB_CATEGORIES[form.industry] || ["General / Standard"]).map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Company Type" required error={errors.companyType}>
          <Select
            value={form.companyType}
            onChange={(e) => set("companyType", e.target.value)}
          >
            {COMPANY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Product Category">
          <Select
            value={form.productCategory}
            onChange={(e) => set("productCategory", e.target.value)}
          >
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Type of Packing">
          <Select
            value={form.packingType}
            onChange={(e) => set("packingType", e.target.value)}
          >
            {PACKING_TYPES.map((pack) => (
              <option key={pack} value={pack}>
                {pack}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Company Turnover" required error={errors.turnover}>
          <Select
            value={form.turnover}
            onChange={(e) => set("turnover", e.target.value)}
          >
            {TURNOVER_RANGES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Monthly Potential" required error={errors.monthlyPotential}>
          <Select
            value={form.monthlyPotential}
            onChange={(e) => set("monthlyPotential", e.target.value)}
          >
            {MONTHLY_POTENTIAL_RANGES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Weight / Month" required error={errors.weightPerMonth}>
          <TextInput
            value={form.weightPerMonth}
            invalid={!!errors.weightPerMonth}
            onChange={(e) => set("weightPerMonth", e.target.value)}
            placeholder="e.g. 5 Tons / 5,000 kg"
          />
        </Field>

        <Field
          label="Value in L / Month"
          required
          error={errors.valueInLakhsPerMonth}
        >
          <TextInput
            value={form.valueInLakhsPerMonth}
            invalid={!!errors.valueInLakhsPerMonth}
            onChange={(e) => set("valueInLakhsPerMonth", e.target.value)}
            placeholder="Value in Lakhs (e.g. 25)"
          />
        </Field>

        <div className="md:col-span-3">
          <label className="block text-[13px] font-semibold text-ink-700 mb-1.5">
            Zone Target (Shipping Lanes)
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TARGET_ZONES.map((zone) => {
              const checked = (form.zoneTarget || []).includes(zone);
              return (
                <button
                  type="button"
                  key={zone}
                  onClick={() => toggleZoneTarget(zone)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition",
                    checked
                      ? "border-brand-500 bg-brand-50/60 text-brand-800 font-semibold"
                      : "border-gray-200 bg-gray-50 text-ink-600 hover:border-brand-200"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="h-3.5 w-3.5 rounded text-brand-500 pointer-events-none"
                  />
                  <span className="truncate">{zone}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Consignee Type Table */}
      <div className="mt-7">
        <SectionTitle
          icon={<TableProperties size={14} />}
          title="Consignee Type & Business Distribution"
          subtitle="Select applicable consignee categories and specify % of total shipping volume"
        />

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-ink-900">
                <th className="px-5 py-3 w-1/2">Consignee Type</th>
                <th className="px-4 py-3 text-center w-1/4">Applicable</th>
                <th className="px-5 py-3 text-right w-1/4">% Business</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {form.consigneeTable.map((row, idx) => {
                const isApplicable = row.applicable ? row.applicable === "Yes" : row.checked;
                return (
                  <tr
                    key={row.type}
                    className={cn(
                      "transition-colors",
                      isApplicable ? "bg-brand-50/20" : "hover:bg-gray-50/50"
                    )}
                  >
                    <td className="px-5 py-2.5 font-medium text-ink-900">
                      <div>
                        <span className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                          {row.type}
                        </span>
                        {row.type === "Industry" && isApplicable && (
                          <div className="mt-1.5 ml-3.5 flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-brand-700">Sub-Category:</span>
                            <select
                              value={row.subCategory || INDUSTRY_CONSIGNEE_SUB_CATEGORIES[0]}
                              onChange={(e) => updateConsigneeRow(idx, { subCategory: e.target.value })}
                              className="rounded-md border border-brand-300 bg-white px-2 py-0.5 text-xs font-medium text-ink-800 outline-none focus:border-brand-500 shadow-xs"
                            >
                              {INDUSTRY_CONSIGNEE_SUB_CATEGORIES.map((sub) => (
                                <option key={sub} value={sub}>
                                  {sub}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <select
                        value={isApplicable ? "Yes" : "No"}
                        onChange={(e) => {
                          const yes = e.target.value === "Yes";
                          updateConsigneeRow(idx, {
                            checked: yes,
                            applicable: yes ? "Yes" : "No",
                          });
                        }}
                        className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-bold text-ink-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          disabled={!isApplicable}
                          value={isApplicable ? row.percent : 0}
                          onChange={(e) =>
                            updateConsigneeRow(idx, {
                              percent: Math.min(100, Math.max(0, Number(e.target.value))),
                            })
                          }
                          className={cn(
                            "w-20 rounded-md border px-2.5 py-1 text-right text-xs font-semibold outline-none transition",
                            isApplicable
                              ? "border-gray-300 bg-white text-ink-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                              : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          )}
                        />
                        <span className="text-xs font-semibold text-ink-500">%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold text-xs text-ink-900 border-t border-gray-200">
                <td className="px-5 py-2.5">Total Allocation</td>
                <td className="px-4 py-2.5 text-center">
                  {form.consigneeTable.filter((r) => r.checked).length} selected
                </td>
                <td className="px-5 py-2.5 text-right">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded font-mono text-xs",
                      consigneeTotalPercent === 100
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {consigneeTotalPercent}%
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 3. Insurance Type Selection (Requirement 5) */}
      <div className="mt-7">
        <SectionTitle
          icon={<ShieldCheck size={14} />}
          title="Insurance Coverage Type"
          subtitle="Determine liability and cargo protection scope"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Owner Risk */}
          <label
            onClick={() => set("insuranceType", "owner_risk")}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
              form.insuranceType === "owner_risk"
                ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-100 shadow-xs"
                : "border-gray-200 hover:border-brand-200 bg-white"
            )}
          >
            <input
              type="radio"
              name="insuranceType"
              checked={form.insuranceType === "owner_risk"}
              onChange={() => set("insuranceType", "owner_risk")}
              className="mt-1 h-4 w-4 text-brand-500 focus:ring-brand-400"
            />
            <div>
              <p className="flex items-center gap-1.5 font-bold text-ink-900 text-[13.5px]">
                <ShieldAlert size={15} className="text-amber-600" /> Owner Risk
              </p>
              <p className="mt-1 text-xs text-ink-500 leading-relaxed">
                Consignor/Consignee bears cargo risk in transit. MV Load provides statutory basic liability up to ₹250/kg in case of carrier fault.
              </p>
              <Badge tone="gray" className="mt-2">
                Standard / Zero Extra Surcharge
              </Badge>
            </div>
          </label>

          {/* Carrier Risk */}
          <label
            onClick={() => set("insuranceType", "carrier_risk")}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
              form.insuranceType === "carrier_risk"
                ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-100 shadow-xs"
                : "border-gray-200 hover:border-brand-200 bg-white"
            )}
          >
            <input
              type="radio"
              name="insuranceType"
              checked={form.insuranceType === "carrier_risk"}
              onChange={() => set("insuranceType", "carrier_risk")}
              className="mt-1 h-4 w-4 text-brand-500 focus:ring-brand-400"
            />
            <div>
              <p className="flex items-center gap-1.5 font-bold text-ink-900 text-[13.5px]">
                <ShieldCheck size={15} className="text-emerald-600" /> Carrier Risk (Recommended)
              </p>
              <p className="mt-1 text-xs text-ink-500 leading-relaxed">
                Full transit protection covering declared invoice value against accidental damage, theft, pilferage, or vehicle rollover.
              </p>
              <Badge tone="green" className="mt-2">
                0.5% Declared Value Coverage
              </Badge>
            </div>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-7 flex flex-wrap items-center gap-2.5 border-t border-gray-100 pt-5">
        <Button variant="outline" onClick={saveDraft} disabled={submitted}>
          <Save size={15} /> Save Draft
        </Button>
        <div className="flex-1" />
        <Button onClick={submit} disabled={submitted}>
          <SendHorizonal size={15} />{" "}
          {submitted ? "CIS Form Submitted" : "Submit CIS Form"}
        </Button>
      </div>
    </Card>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3.5 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-brand-700">
        {icon}
      </span>
      <div>
        <h4 className="text-[13.5px] font-bold text-ink-900 leading-tight">
          {title}
        </h4>
        {subtitle && (
          <p className="text-[11px] text-ink-400 leading-tight">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
