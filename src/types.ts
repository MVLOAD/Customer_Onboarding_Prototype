export type Stage =
  | "lead"
  | "cis"
  | "portal"
  | "rates-tat"
  | "contract-creation"
  | "contract-verification"
  | "done";

export interface DocFile {
  name: string;
  size: number;
}

export interface LeadData {
  name: string;
  company: string;
  mobile: string;
  email: string;
  source: string;
  leadType: string;
  description: string;
  salesperson: string;
  paymentType: string;
  status: "draft" | "completed";
  emailSent: boolean;
  customSubject?: string;
  customBody?: string;
}

export interface ConsigneeRow {
  type: string;
  checked: boolean;
  applicable?: "Yes" | "No";
  percent: number;
  subCategory?: string;
}

export type InsuranceType = "owner_risk" | "carrier_risk";

export interface CisData {
  company: string;
  industry: string;
  industrySubCategory?: string;
  companyType: string;
  productCategory: string;
  packingType: string;
  turnover: string;
  monthlyPotential: string;
  weightPerMonth: string;
  valueInLakhsPerMonth: string;
  zoneTarget: string[];
  consigneeTable: ConsigneeRow[];
  insuranceType: InsuranceType;
  pan: string;
  gst: string;
  businessType: string;
  website: string;
  annualVolume: string;
  branches: string;
  address: string;
  pincode: string;
  contactPerson: string;
  mobile: string;
  email: string;
  documents: Record<string, DocFile | null>;
  status: "draft" | "submitted";
  submittedAt?: string;
}

export interface Charge {
  id: string;
  name: string;
  value: number;
  unit: "₹" | "%";
  desc: string;
  editable: boolean;
}

export interface PriceRequest {
  id: string;
  kind: "rate" | "charge";
  zone?: string;
  slab?: string;
  chargeId?: string;
  chargeName?: string;
  unit?: "₹" | "%";
  currentRate: number;
  proposedRate: number;
  reason: string;
  likelihood: string;
  status: "pending" | "approved" | "rejected";
  ts: string;
}

export interface PincodeInfo {
  code: string;
  city: string;
  zone: string;
}

export interface ZoneInfo {
  name: string;
  coverage: string;
  tat: string;
  pincodes: number;
}

export interface TechMailDraft {
  to: string;
  cc: string;
  subject: string;
  body: string;
  sent: boolean;
  sentAt?: string;
}

export interface CustomerDashboardStats {
  creditLimit: number;
  availableLimit: number;
  nextBillingDate: string;
  paymentDueDate: string;
  accountType: "POSTPAID" | "PREPAID" | "COD";
  ordersCount: number;
  totalOrderValue: number;
  paymentPending: number;
  invoicesCount: number;
  statusCounts: {
    booked: number;
    pickedUp: number;
    inTransit: number;
    ofd: number;
    rto: number;
    delivered: number;
    cancelled: number;
    lost: number;
  };
  monthlyTrend: { month: string; value: number }[];
}

export interface PortalData {
  username: string;
  password: string;
  status: "created" | "otp_sent" | "activated";
  createdAt: string;
  activatedAt?: string;
  otp: string;
  otpSentAt: string;
  pincodes: PincodeInfo[];
  zones: ZoneInfo[];
  rateSlabs: string[];
  rates: { zone: string; values: number[] }[];
  charges: Charge[];
  rateDoc: { name: string; version: string; updatedAt: string; size: string };
  requests: PriceRequest[];
}

export interface ContractData {
  generatedAt: string;
  contractType?: "company_standard" | "custom_upload";
  acceptedByCustomer: boolean;
  acceptedAt?: string;
  otpVerified?: boolean;
  contractOtp?: string;
  signedContractFile?: { name: string; size: number; uploadedAt: string };
  verifiedByAdmin: boolean;
  verifiedAt?: string;
  /** Frozen snapshot of charges at time of acceptance */
  chargesSnapshot: Charge[];
  /** Frozen snapshot of rates at time of acceptance */
  ratesSnapshot: { zone: string; values: number[] }[];
  rateSlabsSnapshot: string[];
}

export interface Activity {
  id: string;
  ts: string;
  message: string;
  tone: "orange" | "green" | "blue" | "gray";
}

export interface Customer {
  id: string;
  createdAt: string;
  stage: Stage;
  lead: LeadData;
  cis?: CisData;
  portal?: PortalData;
  contract?: ContractData;
  techMailDraft?: TechMailDraft;
  stats?: CustomerDashboardStats;
  isDummyAccount?: boolean;
  isActive?: boolean;
  rateType?: string;
  activity: Activity[];
}

export type View =
  | { name: "list" }
  | { name: "detail"; id: string }
  | { name: "portal"; id: string; tab?: "dashboard" | "standard-rate-tat" | "contract" | string };
