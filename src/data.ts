import type {
  Activity,
  Charge,
  CisData,
  ConsigneeRow,
  ContractData,
  Customer,
  CustomerDashboardStats,
  LeadData,
  PincodeInfo,
  PortalData,
  Stage,
  TechMailDraft,
} from "./types";

/* ------------------------------ constants ------------------------------ */

export const LEAD_SOURCES = [
  "Telephonic",
  "Email",
  "Referral",
  "Website",
  "WhatsApp",
  "Other",
];

export const LEAD_TYPES = [
  "New Business Enquiry",
  "Existing Customer Upsell",
  "Reactivation",
  "Price Quote Request",
];

export const PAYMENT_TYPES = ["Postpaid", "Prepaid", "COD", "Other"];

export const BUSINESS_TYPES = [
  "Proprietorship",
  "Partnership",
  "Private Limited",
  "LLP",
  "Public Limited",
  "Other",
];

export const COMPANY_TYPES = [
  "Manufacturer",
  "Distributor",
  "Loader",
  "Trader",
  "Retailer",
  "Service Provider",
  "Other",
];

export const INDUSTRIES = [
  "E-Commerce / D2C",
  "Manufacturing & Heavy Engineering",
  "Automotive & Spare Parts",
  "FMCG & Consumer Goods",
  "Pharmaceuticals & Healthcare",
  "Electronics & Electricals",
  "Apparel, Textiles & Footwear",
  "Solar & Renewable Energy",
  "Chemicals & Paints",
  "Agriculture & Agro Commodities",
  "Publishing & Paper",
  "Other",
];

export const INDUSTRY_SUB_CATEGORIES: Record<string, string[]> = {
  "E-Commerce / D2C": ["D2C Apparel & Lifestyle", "Quick Commerce / Hyperlocal", "B2B E-Commerce Marketplace", "Cross-Border E-Commerce", "Electronics & D2C Brands"],
  "Manufacturing & Heavy Engineering": ["Heavy Industrial Machinery", "Precision Engineering", "Metal & Steel Fabrication", "Industrial Automation"],
  "Automotive & Spare Parts": ["OEM Components", "Aftermarket Spare Parts", "EV Batteries & Motors", "Tyres & Accessories"],
  "FMCG & Consumer Goods": ["Packaged Foods & Beverages", "Personal Care & Cosmetics", "Home Care & Cleaning", "Frozen / Cold Chain Goods"],
  "Pharmaceuticals & Healthcare": ["Formulations & Bulk Drugs", "Medical Devices & Equipment", "Diagnostics & Reagents", "Nutraceuticals"],
  "Electronics & Electricals": ["Consumer Electronics", "Home Appliances", "Lighting & Electrical Fittings", "Semiconductors & Cables"],
  "Apparel, Textiles & Footwear": ["Readymade Garments", "Footwear & Leather Goods", "Fabrics & Raw Yarns", "Home Textiles"],
  "Solar & Renewable Energy": ["Solar Panels & Modules", "Inverters & Transformers", "Wind Turbine Parts", "Energy Storage Systems"],
  "Chemicals & Paints": ["Specialty Chemicals", "Paints & Coatings", "Agrochemicals & Fertilizers", "Industrial Solvents"],
  "Agriculture & Agro Commodities": ["Grains & Pulses", "Spices & Processed Agri", "Seeds & Animal Feed", "Fresh Produce (Cold Chain)"],
  "Publishing & Paper": ["Books & Educational Material", "Paper Reels & Packaging Material", "Commercial Printing", "Stationery"],
  "Other": ["General Cargo", "Specialized Freight", "Other Sub-Category"],
};

export const INDUSTRY_CONSIGNEE_SUB_CATEGORIES = [
  "Heavy Manufacturing Unit",
  "Light Engineering Plant",
  "Process & Chemical Factory",
  "Automotive Component Assembly",
  "Textile & Fabric Mill",
  "Electronics Manufacturing Services (EMS)",
  "Pharma & Formulations Plant",
  "Raw Material Processing",
  "Other Industry Sub-Category",
];

export const PRODUCT_CATEGORIES = [
  "Industrial Goods & Machinery",
  "Consumer Electronics & Appliances",
  "Apparel, Footwear & Accessories",
  "FMCG & Packaged Foods",
  "Pharmaceuticals & Medical Devices",
  "Solar Panels & Inverters",
  "Auto Components & Lubricants",
  "Home Decor & Furnishings",
  "Chemicals & Raw Materials",
  "Other",
];

export const PACKING_TYPES = [
  "Corrugated Box",
  "Wooden Crate / Box",
  "Palletized / Shrink Wrapped",
  "Gunny Bags / HDPE Bags",
  "Drums / Barrels",
  "Bubble Wrap / Poly Bag Flyer",
  "Rolls / Bundles",
  "Other",
];

export const TURNOVER_RANGES = [
  "< ₹1 Crore",
  "₹1 – 5 Crore",
  "₹5 – 25 Crore",
  "₹25 – 100 Crore",
  "₹100 Crore+",
];

export const MONTHLY_POTENTIAL_RANGES = [
  "₹50,000 – ₹2,00,000",
  "₹2,00,000 – ₹10,00,000",
  "₹10,00,000 – ₹50,00,000",
  "₹50,00,000+",
];

export const TARGET_ZONES = [
  "North Zone (DL, HR, PB, UP, RJ, UK)",
  "South Zone (KA, TN, TS, AP, KL)",
  "East Zone (WB, OR, BR, JH, NE)",
  "West Zone (MH, GJ, GA, MP)",
];

export const ZONE_PINCODES: Record<string, PincodeInfo[]> = {
  North: [
    { code: "110001", city: "New Delhi", zone: "North" },
    { code: "160017", city: "Chandigarh", zone: "North" },
    { code: "302001", city: "Jaipur", zone: "North" },
    { code: "226001", city: "Lucknow", zone: "North" },
    { code: "141001", city: "Ludhiana", zone: "North" },
    { code: "248001", city: "Dehradun", zone: "North" },
    { code: "201301", city: "Noida", zone: "North" },
    { code: "122001", city: "Gurugram", zone: "North" },
  ],
  South: [
    { code: "560001", city: "Bengaluru", zone: "South" },
    { code: "600001", city: "Chennai", zone: "South" },
    { code: "500001", city: "Hyderabad", zone: "South" },
    { code: "682001", city: "Kochi", zone: "South" },
    { code: "570001", city: "Mysuru", zone: "South" },
    { code: "520001", city: "Vijayawada", zone: "South" },
    { code: "641001", city: "Coimbatore", zone: "South" },
  ],
  East: [
    { code: "700001", city: "Kolkata", zone: "East" },
    { code: "751001", city: "Bhubaneswar", zone: "East" },
    { code: "781001", city: "Guwahati", zone: "East" },
    { code: "800001", city: "Patna", zone: "East" },
    { code: "834001", city: "Ranchi", zone: "East" },
    { code: "737101", city: "Gangtok", zone: "East" },
  ],
  West: [
    { code: "400001", city: "Mumbai", zone: "West" },
    { code: "380001", city: "Ahmedabad", zone: "West" },
    { code: "411001", city: "Pune", zone: "West" },
    { code: "403001", city: "Panaji", zone: "West" },
    { code: "395003", city: "Surat", zone: "West" },
    { code: "440001", city: "Nagpur", zone: "West" },
    { code: "360001", city: "Rajkot", zone: "West" },
  ],
};

export const DEFAULT_CONSIGNEE_TYPES = [
  "C&F",
  "Distributor",
  "Retailer",
  "Industry",
  "Fulfillment centre",
  "CSD",
  "GOVT Department - Seprrate Charges",
  "Individual",
  "Mall Delivery",
];

export const SALESPERSONS = [
  "Anjali Sharma",
  "Rohit Verma",
  "Neha Kulkarni",
  "Vikram Singh",
  "Pooja Iyer",
];

export const DOC_SLOTS = [
  "PAN Card",
  "GST Certificate",
  "Cancelled Cheque",
  "Address Proof",
];

export const STAGES: { key: Stage; label: string; short: string }[] = [
  { key: "lead", label: "Lead Generation", short: "Lead" },
  { key: "cis", label: "CIS Form", short: "CIS" },
  { key: "portal", label: "Intro to Company", short: "Portal" },
  { key: "rates-tat", label: "Rates & TAT", short: "Rates" },
  { key: "contract-creation", label: "Contract Creation", short: "Contract" },
  { key: "contract-verification", label: "Contract Verification", short: "Verify" },
  { key: "done", label: "Onboarded & Live", short: "Live" },
];

export const stageIndex = (s: Stage): number => {
  const map: Record<Stage, number> = {
    lead: 0,
    cis: 1,
    portal: 2,
    "rates-tat": 3,
    "contract-creation": 4,
    "contract-verification": 5,
    done: 6,
  };
  return map[s] ?? 0;
};

/* ------------------------------ formatting ------------------------------ */

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const uid = () => Math.random().toString(36).slice(2, 10);

export const genOtp = () => String(Math.floor(100000 + Math.random() * 900000));

/* ------------------------------ acceptance likelihood ------------------------------ */

export type Likelihood = {
  label: string;
  tone: "green" | "orange" | "red" | "gray";
  pct: number; // +ve = reduction %
};

export function likelihood(current: number, proposed: number): Likelihood {
  const pct = current > 0 ? Math.round(((current - proposed) / current) * 100) : 0;
  if (pct >= 20) return { label: "Very Low", tone: "red", pct };
  if (pct >= 10) return { label: "Moderate", tone: "orange", pct };
  if (pct > 0) return { label: "High", tone: "green", pct };
  return { label: "Price increase", tone: "gray", pct };
}

/* ------------------------------ defaults ------------------------------ */

export function defaultConsigneeTable(): ConsigneeRow[] {
  return DEFAULT_CONSIGNEE_TYPES.map((type, idx) => ({
    type,
    checked: idx < 3,
    applicable: idx < 3 ? "Yes" : "No",
    percent: idx === 0 ? 50 : idx === 1 ? 30 : idx === 2 ? 20 : 0,
  }));
}

export function defaultStats(): CustomerDashboardStats {
  return {
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
}

/* ------------------------------ tech mail template ------------------------------ */

export function renderTechMail(
  customer: Customer
): TechMailDraft {
  const c = customer;
  const cis = c.cis;
  const lead = c.lead;
  const company = cis?.company || lead.company || "New Customer";
  const contact = cis?.contactPerson || lead.name || "Customer Representative";
  const email = cis?.email || lead.email || "customer@company.com";
  const phone = cis?.mobile || lead.mobile || "—";
  const username = (email || "customer@company.com").toLowerCase();

  const consigneeDetails = (cis?.consigneeTable || [])
    .filter((r) => r.checked)
    .map((r) => `  - ${r.type}: ${r.percent}%`)
    .join("\n") || "  - Standard Distribution (100%)";

  const body = `Hi Tech Team,

Please provision a new Customer Panel for the following onboarded customer:

========================================
CUSTOMER & ACCOUNT DETAILS
========================================
• Company Name: ${company}
• Contact Person: ${contact}
• Registered Email: ${email}
• Mobile Number: ${phone}
• Industry: ${cis?.industry || "Logistics & Distribution"}
• Company Type: ${cis?.companyType || "Distributor"}
• Product Category: ${cis?.productCategory || "General Cargo"}
• Packing Type: ${cis?.packingType || "Corrugated Box"}
• Insurance Type: ${cis?.insuranceType === "carrier_risk" ? "Carrier Risk (Comprehensive Cover)" : "Owner Risk (Basic Liability)"}
• Monthly Potential: ${cis?.monthlyPotential || "₹5,00,000"}
• Weight / Month: ${cis?.weightPerMonth || "2 Tons"}
• Value in Lakhs / Month: ₹${cis?.valueInLakhsPerMonth || "15"} Lakhs
• Target Zones: ${cis?.zoneTarget?.join(", ") || "Pan-India All Zones"}

========================================
CONSIGNEE DISTRIBUTION
========================================
${consigneeDetails}

========================================
CREDENTIALS & CONFIGURATION
========================================
• Suggested Username: ${username}
• Assigned Billing Model: ${lead.paymentType || "Postpaid"}
• Credit Limit: ₹50,00,000
• Standard Rate Card: Standard Rev 4 (Zone A/B/C)

Please initiate the panel build, configure the rate matrix, and notify once the activation link & OTP are dispatched.

Thank you,
${lead.salesperson || "Super Admin"}
Sales & Customer Onboarding Team
MV Load Logistics`;

  return {
    to: email,
    cc: "onboarding@mvload.in, " + (lead.salesperson ? `${lead.salesperson.toLowerCase().replace(/\s+/g, ".")}@mvload.in` : "sales@mvload.in"),
    subject: `[MV Load Account Onboarding] Onboarding Summary & Service Plan for ${company}`,
    body,
    sent: false,
  };
}

/* ------------------------------ email templates ------------------------------ */

export interface EmailTemplate {
  subject: string;
  body: string;
}

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  Postpaid: {
    subject: "Welcome to MV Load — Postpaid Logistics Partnership & Account Terms",
    body: `Dear {{Customer Name}},

Thank you for choosing MV Load as your logistics partner. We are pleased to onboard {{Company Name}} onto our Postpaid billing programme.

HOW POSTPAID WORKS
• Shipments are booked against your credit account and invoiced monthly.
• Invoice date: 1st of the following month · Payment due: 15 days from invoice date.
• Your dedicated relationship manager is {{Salesperson}}.

TERMS & CONDITIONS
1. Credit period: 15 days from invoice date, reviewed quarterly based on payment history.
2. Late payment attracts 18% p.a. interest on overdue invoices.
3. Credit limit starts at ₹5,00,000 and may be revised by MV Load at its discretion.
4. Monthly reconciliation statement is shared on the 2nd; discrepancies must be raised within 7 days.
5. MV Load liability for loss/damage is capped at ₹250 per kg unless declared-value insurance is opted.
6. Cancellation/return pickup is chargeable as per the standard rate card.
7. Fuel surcharge (12%) is adjustable monthly based on IEC fuel index.
8. This agreement is governed by the laws of India; disputes are subject to Bengaluru jurisdiction.
9. MV Load reserves the right to convert the account to Prepaid if dues exceed 30 days.

Next steps:
1. Complete and return the Customer Information Sheet (CIS).
2. Share KYC documents (PAN, GST, cancelled cheque).
3. Receive your customer portal credentials to track shipments and invoices.

We look forward to moving your business forward.

Warm regards,
{{Salesperson}}
MV Load — Sales & Onboarding`,
  },
  Prepaid: {
    subject: "Welcome to MV Load — Prepaid Wallet Activation & Terms",
    body: `Dear {{Customer Name}},

Welcome aboard! {{Company Name}} is being onboarded on our Prepaid wallet model — load funds in advance and every shipment is deducted at our standard rate card, with zero billing surprises.

{{Salesperson}} has been assigned as your onboarding specialist and will help with the first wallet top-up once the CIS form is complete.

TERMS & CONDITIONS
1. Minimum wallet top-up: ₹500 · Wallet balance never expires (auto-reconciled yearly).
2. Charges are deducted at the time of shipment booking against wallet balance.
3. Insufficient balance blocks booking; no shipment is dispatched on credit.
4. Wallet refunds are processed to the source account within 7 working days after account closure.
5. Monthly top-ups above ₹1,00,000 earn 2% reward points (1 point = ₹0.10).
6. Rates are as per the standard rate card shared on your customer portal; revisions are intimated 15 days in advance.
7. Fuel surcharge (12%) is adjustable monthly based on IEC fuel index.
8. MV Load liability for loss/damage is capped at ₹250 per kg unless declared-value insurance is opted.
9. This agreement is governed by the laws of India; disputes are subject to Bengaluru jurisdiction.

Next steps:
1. Submit the Customer Information Sheet (CIS).
2. Upload PAN, GST and address proof.
3. Activate your customer portal to manage recharges and download invoices.

Happy shipping!

Warm regards,
{{Salesperson}}
MV Load — Sales & Onboarding`,
  },
  COD: {
    subject: "MV Load Onboarding — COD Collection Services & Settlement Terms",
    body: `Dear {{Customer Name}},

Greetings from MV Load! We are pleased to confirm that {{Company Name}} is being onboarded for our Cash-on-Delivery collection service.

TERMS & CONDITIONS
1. COD remittances are settled to your registered bank account on a T+2 cycle.
2. Collection report (delivered / returned / in-transit) is available daily on your portal.
3. Discrepancy claims must be raised within 72 hours of delivery; unresolved claims are treated as collected.
4. MV Load charges 2% COD handling fee (min. ₹20 per shipment) on collected value.
5. Returned shipments: return transit + ₹75 return handling fee; pickup within 48 hours of customer refusal.
6. COD per-parcel cap: ₹25,000; higher values require pre-approval by {{Salesperson}}.
7. Remittances are net of applicable GST (18%) and statutory deductions.
8. Accounts with COD rejection rate above 25% may be moved to Prepaid at MV Load's discretion.
9. This agreement is governed by the laws of India; disputes are subject to Bengaluru jurisdiction.

Next steps:
1. Complete the CIS with your bank details.
2. Share a cancelled cheque and GST certificate.
3. Activate your portal to track COD collections in real time.

Warm regards,
{{Salesperson}}
MV Load — Sales & Onboarding`,
  },
  Other: {
    subject: "Welcome to MV Load — Onboarding & General Service Terms",
    body: `Dear {{Customer Name}},

Thank you for your interest in MV Load. We have opened an onboarding file for {{Company Name}} and assigned {{Salesperson}} as your single point of contact.

TERMS & CONDITIONS
1. Commercial terms (Postpaid / Prepaid / COD) will be finalised after volume assessment.
2. Standard transit times: Metro 1–2 days · Inter-state 2–4 days · Remote 3–6 days.
3. MV Load liability for loss/damage is capped at ₹250 per kg unless declared-value insurance is opted.
4. Claims must be raised within 48 hours of delivery via the customer portal.
5. Cancellations after pickup are non-refundable; rescheduling is free up to dispatch.
6. GST (18%) is applicable on all logistics charges.
7. This agreement is governed by the laws of India; disputes are subject to Bengaluru jurisdiction.

Meanwhile, please keep your company KYC documents handy so we can complete the CIS formalities without delays.

Warm regards,
{{Salesperson}}
MV Load — Sales & Onboarding`,
  },
};

export function renderEmail(
  paymentType: string,
  lead: Pick<LeadData, "name" | "company" | "salesperson" | "email">
): { subject: string; body: string } {
  const t = EMAIL_TEMPLATES[paymentType] ?? EMAIL_TEMPLATES.Other;
  const sub = (s: string, token: string, val: string) => s.split(token).join(val);
  const fill = (s: string) =>
    sub(
      sub(
        sub(s, "{{Customer Name}}", lead.name || "[Customer Name]"),
        "{{Company Name}}",
        lead.company || "[Company Name]"
      ),
      "{{Salesperson}}",
      lead.salesperson || "[Salesperson]"
    );
  return { subject: fill(t.subject), body: fill(t.body) };
}

/* ------------------------------ validation ------------------------------ */

export const validators = {
  required: (v: string) => (v.trim() ? "" : "This field is required"),
  email: (v: string) =>
    !v.trim() ? "Email is required" : /^\S+@\S+\.\S+$/.test(v) ? "" : "Enter a valid email address",
  mobile: (v: string) =>
    !v.trim() ? "Mobile is required" : /^[6-9]\d{9}$/.test(v) ? "" : "Enter a valid 10-digit mobile number",
  pincode: (v: string) =>
    !v.trim() ? "Pincode is required" : /^\d{6}$/.test(v) ? "" : "Enter a valid 6-digit pincode",
  pan: (v: string) =>
    !v.trim() ? "PAN is required" : /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.toUpperCase()) ? "" : "Format: ABCDE1234F",
  gst: (v: string) =>
    !v.trim() ? "GSTIN is required" : /^[0-9]{2}[A-Z0-9]{13}$/.test(v.toUpperCase()) ? "" : "Enter a valid 15-character GSTIN",
};

/* ------------------------------ portal generators ------------------------------ */

export function defaultCharges(): Charge[] {
  return [
    { id: "ch-fuel", name: "Fuel Surcharge", value: 12, unit: "%", desc: "Adjustable monthly as per IEC fuel index", editable: true },
    { id: "ch-peak", name: "Peak Season Surcharge", value: 8, unit: "%", desc: "Applies Nov 1 – Jan 15 peak period", editable: true },
    { id: "ch-cod", name: "COD Handling", value: 2, unit: "%", desc: "Min. ₹20 per shipment, on collected value", editable: true },
    { id: "ch-remote", name: "Remote Area Charge", value: 50, unit: "₹", desc: "For pincodes outside metro coverage", editable: true },
    { id: "ch-ins", name: "Declared-Value Insurance", value: 0.5, unit: "%", desc: "Optional · covers loss/damage above ₹250/kg", editable: true },
    { id: "ch-gst", name: "GST", value: 18, unit: "%", desc: "Statutory — not negotiable", editable: false },
  ];
}

export function genPortalData(email: string, pincode?: string): Omit<
  PortalData,
  "status" | "createdAt"
> {
  const base = pincode && /^\d{6}$/.test(pincode) ? pincode : "560001";
  return {
    username: (email || "customer@company.com").toLowerCase(),
    password: "MVL-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    otp: genOtp(),
    otpSentAt: new Date().toISOString(),
    pincodes: [
      { code: base, city: "Bengaluru", zone: "South" },
      { code: "110001", city: "New Delhi", zone: "North" },
      { code: "600001", city: "Chennai", zone: "South" },
      { code: "400001", city: "Mumbai", zone: "West" },
      { code: "700001", city: "Kolkata", zone: "East" },
      { code: "500001", city: "Hyderabad", zone: "South" },
      { code: "380001", city: "Ahmedabad", zone: "West" },
      { code: "751001", city: "Bhubaneswar", zone: "East" },
    ],
    zones: [
      { name: "North", coverage: "DL, HR, PB, UP, RJ, UK", tat: "1–4 days", pincodes: 8 },
      { name: "South", coverage: "KA, TN, TS, AP, KL", tat: "1–4 days", pincodes: 7 },
      { name: "East", coverage: "WB, OR, BR, JH, NE", tat: "1–5 days", pincodes: 6 },
      { name: "West", coverage: "MH, GJ, GA, MP", tat: "1–4 days", pincodes: 7 },
    ],
    rateSlabs: ["North", "South", "East", "West"],
    rates: [
      { zone: "North", values: [35, 65, 75, 55] },
      { zone: "South", values: [65, 35, 70, 50] },
      { zone: "East", values: [75, 70, 35, 68] },
      { zone: "West", values: [55, 50, 68, 35] },
    ],
    charges: defaultCharges(),
    rateDoc: {
      name: "MV_Standard_Zone_Rate_Card_2026.pdf",
      version: "Rev 5",
      updatedAt: new Date().toISOString(),
      size: "1.2 MB",
    },
    requests: [],
  };
}

/* ------------------------------ seed data ------------------------------ */

const DAY = 86400000;
const ago = (d: number, h = 0) =>
  new Date(Date.now() - d * DAY - h * 3600000).toISOString();

let n = 0;
const act = (d: number, h: number, message: string, tone: Activity["tone"] = "gray"): Activity => ({
  id: "a" + ++n,
  ts: ago(d, h),
  message,
  tone,
});

const leadBase = (o: Partial<LeadData>): LeadData => ({
  name: "",
  company: "",
  mobile: "",
  email: "",
  source: "Website",
  leadType: "New Business Enquiry",
  description: "",
  salesperson: "Anjali Sharma",
  paymentType: "Postpaid",
  status: "draft",
  emailSent: false,
  ...o,
});

const cisBase = (o: Partial<CisData>): CisData => ({
  company: "",
  industry: "E-Commerce / D2C",
  companyType: "Manufacturer",
  productCategory: "Consumer Electronics & Appliances",
  packingType: "Corrugated Box",
  turnover: "₹5 – 25 Crore",
  monthlyPotential: "₹2,00,000 – ₹10,00,000",
  weightPerMonth: "5 Tons",
  valueInLakhsPerMonth: "25",
  zoneTarget: ["Zone A (South Metro - KA, TS, AP)", "Zone B (West & South - MH, TN)"],
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
  contactPerson: "",
  mobile: "",
  email: "",
  documents: { "PAN Card": null, "GST Certificate": null, "Cancelled Cheque": null, "Address Proof": null },
  status: "draft",
  ...o,
});

export function seedCustomers(): Customer[] {
  const portalOn = (
    email: string,
    pin: string,
    activated: boolean,
    createdDays: number,
    extra?: Partial<PortalData>
  ): PortalData => ({
    ...genPortalData(email, pin),
    status: activated ? "activated" : "otp_sent",
    createdAt: ago(createdDays),
    otpSentAt: ago(createdDays),
    activatedAt: activated ? ago(createdDays - 1) : undefined,
    ...extra,
  });

  const contractOn = (
    verified: boolean,
    hasFile: boolean,
    days: number
  ): ContractData => {
    const p = genPortalData("sample@mvload.in", "560001");
    return {
      generatedAt: ago(days),
      acceptedByCustomer: true,
      acceptedAt: ago(days),
      verifiedByAdmin: verified,
      verifiedAt: verified ? ago(days - 1) : undefined,
      signedContractFile: hasFile
        ? {
          name: "Signed_MVLoad_Logistics_Agreement_2026.pdf",
          size: 348160,
          uploadedAt: ago(days - 1),
        }
        : undefined,
      chargesSnapshot: p.charges,
      ratesSnapshot: p.rates,
      rateSlabsSnapshot: p.rateSlabs,
    };
  };

  return [
    {
      id: "c-ccf",
      createdAt: ago(150),
      stage: "done",
      isDummyAccount: false,
      isActive: true,
      rateType: "Rate",
      lead: leadBase({
        name: "Tarun Kumar",
        company: "CCF Logistics Services",
        mobile: "9810011223",
        email: "tarunccf@outlook.com",
        source: "Website",
        leadType: "New Business Enquiry",
        salesperson: "Anjali Sharma",
        paymentType: "Postpaid",
        status: "completed",
        emailSent: true,
      }),
      cis: cisBase({
        company: "CCF Logistics Services Pvt Ltd",
        industry: "Logistics & Distribution",
        companyType: "Loader",
        productCategory: "Industrial Goods & Machinery",
        packingType: "Wooden Crate / Box",
        turnover: "₹25 – 100 Crore",
        monthlyPotential: "₹10,00,000 – ₹50,00,000",
        weightPerMonth: "20 Tons",
        valueInLakhsPerMonth: "80",
        zoneTarget: ["Pan-India All Zones"],
        pan: "AAACC1122D",
        gst: "29AAACC1122D1Z4",
        businessType: "Private Limited",
        address: "Plot 88, Electronic City Phase 1, Bengaluru",
        pincode: "560100",
        contactPerson: "Tarun Kumar",
        mobile: "9810011223",
        email: "tarunccf@outlook.com",
        status: "submitted",
        insuranceType: "carrier_risk",
      }),
      portal: portalOn("tarunccf@outlook.com", "560100", true, 145),
      contract: contractOn(true, true, 142),
      stats: defaultStats(),
      techMailDraft: {
        to: "tech-team@mvload.in",
        cc: "onboarding@mvload.in, superadmin@mvikas.in",
        subject: "[Panel Build Request] Provision Customer Portal for CCF Logistics Services",
        body: "Portal built and active.",
        sent: true,
        sentAt: ago(146),
      },
      activity: [
        act(150, 2, "Lead created from Website", "orange"),
        act(148, 4, "Onboarding email sent (Postpaid template + T&C)", "blue"),
        act(147, 1, "Lead completed — CIS Form unlocked", "green"),
        act(146, 3, "CIS form submitted with full statutory details", "green"),
        act(146, 1, "Salesperson drafted & sent email to Tech Team for panel build", "blue"),
        act(145, 2, "Customer portal credentials created", "orange"),
        act(144, 5, "Customer verified OTP & activated account", "green"),
      ],
    },
    {
      id: "c-firstmile",
      createdAt: ago(122),
      stage: "done",
      isDummyAccount: false,
      isActive: true,
      rateType: "Rate",
      lead: leadBase({
        name: "Karthik Rao",
        company: "First Mile Innovative Solutions",
        mobile: "9845012340",
        email: "first.mile@vendor.com",
        source: "Referral",
        leadType: "New Business Enquiry",
        salesperson: "Anjali Sharma",
        paymentType: "Postpaid",
        status: "completed",
        emailSent: true,
        description: "High-volume D2C shipper, 4k parcels/month.",
      }),
      cis: cisBase({
        company: "First Mile Innovative Solutions Pvt Ltd",
        industry: "E-Commerce / D2C",
        companyType: "Distributor",
        productCategory: "Consumer Electronics & Appliances",
        packingType: "Corrugated Box",
        turnover: "₹5 – 25 Crore",
        monthlyPotential: "₹2,00,000 – ₹10,00,000",
        weightPerMonth: "4 Tons",
        valueInLakhsPerMonth: "35",
        pan: "AABCF1234K",
        gst: "29AABCF1234K1Z5",
        businessType: "Private Limited",
        address: "42, 4th Cross, HSR Layout, Bengaluru",
        pincode: "560102",
        contactPerson: "Karthik Rao",
        mobile: "9845012340",
        email: "first.mile@vendor.com",
        status: "submitted",
        submittedAt: ago(118),
        insuranceType: "carrier_risk",
        documents: {
          "PAN Card": { name: "pan-firstmile.pdf", size: 182340 },
          "GST Certificate": { name: "gst-cert.pdf", size: 240112 },
          "Cancelled Cheque": { name: "cheque.jpg", size: 90211 },
          "Address Proof": null,
        },
      }),
      portal: portalOn("first.mile@vendor.com", "560102", true, 116),
      contract: contractOn(true, true, 112),
      stats: defaultStats(),
      techMailDraft: {
        to: "tech-team@mvload.in",
        cc: "onboarding@mvload.in, superadmin@mvikas.in",
        subject: "[Panel Build Request] Provision Customer Portal for First Mile Innovative Solutions",
        body: "Panel built and active.",
        sent: true,
        sentAt: ago(117),
      },
      activity: [
        act(122, 2, "Lead created from Referral (New Business Enquiry)", "orange"),
        act(121, 4, "Onboarding email sent (Postpaid template + T&C)", "blue"),
        act(120, 1, "Lead completed — CIS Form unlocked", "green"),
        act(118, 3, "CIS form submitted with 3 documents", "green"),
        act(117, 2, "Salesperson drafted & sent email to Tech Team to build panel", "blue"),
        act(116, 2, "Customer portal created — OTP sent to email", "orange"),
        act(115, 5, "Customer verified OTP & activated account", "green"),
      ],
    },
    {
      id: "c-allied",
      createdAt: ago(95),
      stage: "portal",
      isDummyAccount: true,
      isActive: true,
      rateType: "Rate",
      lead: leadBase({
        name: "Suresh Babu",
        company: "Mv Allied Power",
        mobile: "9543210987",
        email: "alliedpoweranjali@gmail.com",
        source: "Referral",
        leadType: "New Business Enquiry",
        salesperson: "Vikram Singh",
        paymentType: "Postpaid",
        status: "completed",
        emailSent: true,
        description: "Needs industrial freight rates for power machinery.",
      }),
      cis: cisBase({
        company: "MV Allied Power Pvt Ltd",
        industry: "Manufacturing & Heavy Engineering",
        companyType: "Manufacturer",
        productCategory: "Industrial Goods & Machinery",
        packingType: "Palletized / Shrink Wrapped",
        turnover: "₹25 – 100 Crore",
        monthlyPotential: "₹10,00,000 – ₹50,00,000",
        weightPerMonth: "15 Tons",
        valueInLakhsPerMonth: "60",
        pan: "AABCA9876P",
        gst: "29AABCA9876P1Z2",
        address: "Peenya Industrial Area, Bengaluru",
        pincode: "560058",
        contactPerson: "Suresh Babu",
        mobile: "9543210987",
        email: "alliedpoweranjali@gmail.com",
        status: "submitted",
        insuranceType: "carrier_risk",
      }),
      portal: portalOn("alliedpoweranjali@gmail.com", "560058", false, 90),
      stats: defaultStats(),
      activity: [
        act(95, 2, "Lead created from Referral", "orange"),
        act(93, 3, "CIS form submitted", "green"),
        act(90, 1, "Customer portal credentials created", "orange"),
      ],
    },
    {
      id: "c-vaidrishi",
      createdAt: ago(60),
      stage: "portal",
      isDummyAccount: true,
      isActive: true,
      rateType: "Rate",
      lead: leadBase({
        name: "Anjali Desai",
        company: "Vaidrishi",
        mobile: "9654321098",
        email: "anjali@mvika.com",
        source: "Telephonic",
        leadType: "New Business Enquiry",
        salesperson: "Neha Kulkarni",
        paymentType: "COD",
        status: "completed",
        emailSent: true,
      }),
      cis: cisBase({
        company: "Vaidrishi Ayurveda Herbals",
        industry: "Pharmaceuticals & Healthcare",
        companyType: "Manufacturer",
        productCategory: "Pharmaceuticals & Medical Devices",
        packingType: "Corrugated Box",
        turnover: "₹5 – 25 Crore",
        monthlyPotential: "₹2,00,000 – ₹10,00,000",
        weightPerMonth: "3 Tons",
        valueInLakhsPerMonth: "20",
        pan: "AABCV5544R",
        gst: "07AABCV5544R1Z8",
        address: "Connaught Place, New Delhi",
        pincode: "110001",
        contactPerson: "Anjali Desai",
        mobile: "9654321098",
        email: "anjali@mvika.com",
        status: "submitted",
        insuranceType: "owner_risk",
      }),
      portal: portalOn("anjali@mvika.com", "110001", true, 55),
      stats: defaultStats(),
      activity: [
        act(60, 1, "Lead created from Telephonic", "orange"),
        act(58, 2, "CIS form submitted", "green"),
        act(55, 3, "Customer portal activated", "green"),
      ],
    },
    {
      id: "c-loom",
      createdAt: ago(45),
      stage: "portal",
      isDummyAccount: true,
      isActive: true,
      rateType: "Rate",
      lead: leadBase({
        name: "Divya Menon",
        company: "MV Loom solar",
        mobile: "9765432109",
        email: "loom.solar@gmail.com",
        source: "WhatsApp",
        leadType: "Price Quote Request",
        salesperson: "Rohit Verma",
        paymentType: "Postpaid",
        status: "completed",
        emailSent: true,
      }),
      cis: cisBase({
        company: "MV Loom Solar Energy",
        industry: "Solar & Renewable Energy",
        companyType: "Distributor",
        productCategory: "Solar Panels & Inverters",
        packingType: "Wooden Crate / Box",
        turnover: "₹25 – 100 Crore",
        monthlyPotential: "₹10,00,000 – ₹50,00,000",
        weightPerMonth: "12 Tons",
        valueInLakhsPerMonth: "50",
        pan: "AABCL3322T",
        gst: "06AABCL3322T1Z3",
        address: "Sector 34, Gurugram",
        pincode: "122001",
        contactPerson: "Divya Menon",
        mobile: "9765432109",
        email: "loom.solar@gmail.com",
        status: "submitted",
        insuranceType: "carrier_risk",
      }),
      portal: portalOn("loom.solar@gmail.com", "122001", true, 40),
      stats: defaultStats(),
      activity: [
        act(45, 3, "Lead created from WhatsApp", "orange"),
        act(42, 2, "CIS form submitted", "green"),
        act(40, 1, "Customer portal activated", "green"),
      ],
    },
    {
      id: "c-parcelit",
      createdAt: ago(35),
      stage: "rates-tat",
      isDummyAccount: false,
      isActive: true,
      rateType: "Rate",
      lead: leadBase({
        name: "Sneha Patil",
        company: "OLD Parcel-It (Gati)",
        mobile: "9822045671",
        email: "parcelit@gati.com",
        source: "Telephonic",
        leadType: "Reactivation",
        salesperson: "Rohit Verma",
        paymentType: "Prepaid",
        status: "completed",
        emailSent: true,
      }),
      cis: cisBase({
        company: "Parcel-It Logistics Solutions",
        industry: "Logistics & Distribution",
        companyType: "Loader",
        productCategory: "Consumer Electronics & Appliances",
        packingType: "Corrugated Box",
        turnover: "₹5 – 25 Crore",
        monthlyPotential: "₹2,00,000 – ₹10,00,000",
        weightPerMonth: "8 Tons",
        valueInLakhsPerMonth: "30",
        pan: "AADCP5678L",
        gst: "27AADCP5678L1Z9",
        businessType: "Partnership",
        address: "11, MG Road, Pune",
        pincode: "411001",
        contactPerson: "Sneha Patil",
        mobile: "9822045671",
        email: "parcelit@gati.com",
        status: "submitted",
        submittedAt: ago(30),
        insuranceType: "carrier_risk",
      }),
      portal: portalOn("parcelit@gati.com", "411001", true, 28),
      stats: defaultStats(),
      activity: [
        act(35, 1, "Lead created from Telephonic (Reactivation)", "orange"),
        act(32, 2, "Lead completed — CIS Form unlocked", "green"),
        act(30, 6, "CIS form submitted", "green"),
        act(28, 1, "Customer verified OTP & activated account", "green"),
      ],
    },
    {
      id: "c-dpworld",
      createdAt: ago(28),
      stage: "contract-creation",
      isDummyAccount: false,
      isActive: true,
      rateType: "Rate",
      lead: leadBase({
        name: "Farhan Qureshi",
        company: "DP WORLD",
        mobile: "9811022334",
        email: "DP.world@gmail.com",
        source: "Email",
        leadType: "New Business Enquiry",
        salesperson: "Vikram Singh",
        paymentType: "COD",
        status: "completed",
        emailSent: true,
      }),
      cis: cisBase({
        company: "DP World Logistics India Pvt Ltd",
        industry: "Logistics & Distribution",
        companyType: "Loader",
        productCategory: "Industrial Goods & Machinery",
        packingType: "Palletized / Shrink Wrapped",
        turnover: "₹100 Crore+",
        monthlyPotential: "₹50,00,000+",
        weightPerMonth: "50 Tons",
        valueInLakhsPerMonth: "250",
        pan: "AAACD3456N",
        gst: "07AAACD3456N1Z1",
        businessType: "Public Limited",
        address: "Jawaharlal Nehru Port, Mumbai",
        pincode: "400001",
        contactPerson: "Farhan Qureshi",
        mobile: "9811022334",
        email: "DP.world@gmail.com",
        status: "submitted",
        submittedAt: ago(21),
        insuranceType: "carrier_risk",
      }),
      portal: portalOn("DP.world@gmail.com", "400001", true, 20),
      contract: contractOn(false, false, 2),
      stats: defaultStats(),
      activity: [
        act(28, 2, "Lead created from Email (New Business Enquiry)", "orange"),
        act(26, 3, "Lead completed — CIS Form unlocked", "green"),
        act(21, 5, "CIS form submitted", "green"),
        act(20, 1, "Customer verified OTP & activated account", "green"),
        act(2, 1, "Customer accepted charges & locked in rate card", "green"),
      ],
    },
    {
      id: "c-edusoft",
      createdAt: ago(20),
      stage: "cis",
      isDummyAccount: false,
      isActive: true,
      rateType: "Rate",
      lead: leadBase({
        name: "Rajesh Gupta",
        company: "EDUSOFT HEALTHCARE LIMITED",
        mobile: "9899887766",
        email: "Edusoft@Vendor.in",
        source: "Website",
        leadType: "New Business Enquiry",
        salesperson: "Anjali Sharma",
        paymentType: "Prepaid",
        status: "completed",
        emailSent: true,
      }),
      cis: cisBase({
        company: "Edusoft Healthcare Limited",
        industry: "Pharmaceuticals & Healthcare",
        companyType: "Manufacturer",
        productCategory: "Pharmaceuticals & Medical Devices",
        packingType: "Corrugated Box",
        turnover: "₹25 – 100 Crore",
        monthlyPotential: "₹10,00,000 – ₹50,00,000",
        weightPerMonth: "6 Tons",
        valueInLakhsPerMonth: "45",
        contactPerson: "Rajesh Gupta",
        email: "Edusoft@Vendor.in",
        mobile: "9899887766",
        pan: "AABCE6677K",
        gst: "29AABCE6677K1Z7",
        pincode: "560001",
        address: "Koramangala, Bengaluru",
        insuranceType: "carrier_risk",
      }),
      stats: defaultStats(),
      activity: [
        act(20, 2, "Lead created from Website", "orange"),
        act(18, 1, "Onboarding email sent (Prepaid template + T&C)", "blue"),
        act(15, 4, "Lead completed — CIS Form unlocked", "green"),
      ],
    },
    {
      id: "c-ornate",
      createdAt: ago(15),
      stage: "lead",
      isDummyAccount: true,
      isActive: true,
      rateType: "Rate",
      lead: leadBase({
        name: "Priya Kapoor",
        company: "MV-Ornate",
        mobile: "9811223344",
        email: "ornate.dummy@gmail.com",
        source: "Website",
        leadType: "New Business Enquiry",
        salesperson: "Pooja Iyer",
        paymentType: "Postpaid",
        status: "draft",
      }),
      stats: defaultStats(),
      activity: [act(15, 4, "Lead created from Website", "orange")],
    },
    {
      id: "c-glocal",
      createdAt: ago(10),
      stage: "contract-verification",
      isDummyAccount: true,
      isActive: true,
      rateType: "Rate",
      lead: leadBase({
        name: "Imran Shaikh",
        company: "Glocal Delivery Solutions Pvt Ltd (HYD)",
        mobile: "9432109876",
        email: "Glocal.delhivery2@gmail.com",
        source: "Other",
        leadType: "Existing Customer Upsell",
        salesperson: "Anjali Sharma",
        paymentType: "Postpaid",
        status: "completed",
        emailSent: true,
      }),
      cis: cisBase({
        company: "Glocal Delivery Solutions Pvt Ltd",
        industry: "Logistics & Distribution",
        companyType: "Loader",
        productCategory: "Consumer Electronics & Appliances",
        packingType: "Corrugated Box",
        turnover: "₹5 – 25 Crore",
        monthlyPotential: "₹2,00,000 – ₹10,00,000",
        weightPerMonth: "10 Tons",
        valueInLakhsPerMonth: "40",
        pan: "AAGCG4321Q",
        gst: "36AAGCG4321Q1Z8",
        businessType: "Private Limited",
        address: "HITEC City, Hyderabad",
        pincode: "500081",
        contactPerson: "Imran Shaikh",
        mobile: "9432109876",
        email: "Glocal.delhivery2@gmail.com",
        status: "submitted",
        submittedAt: ago(8),
        insuranceType: "carrier_risk",
      }),
      portal: portalOn("Glocal.delhivery2@gmail.com", "500081", true, 6),
      contract: contractOn(false, true, 4),
      stats: defaultStats(),
      activity: [
        act(10, 2, "Lead created (Existing Customer Upsell)", "orange"),
        act(9, 3, "Lead completed — CIS Form unlocked", "green"),
        act(8, 1, "CIS form submitted", "green"),
        act(6, 2, "Customer verified OTP & activated account", "green"),
        act(4, 1, "Customer accepted charges & locked in rates", "green"),
        act(2, 1, "Customer uploaded signed contract — awaiting admin verification", "blue"),
      ],
    },
  ];
}
