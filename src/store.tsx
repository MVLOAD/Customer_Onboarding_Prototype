import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Activity, Customer, DocFile, PriceRequest, TechMailDraft } from "./types";
import { defaultStats, genPortalData, seedCustomers, uid } from "./data";

export interface Toast {
  id: string;
  kind: "success" | "error" | "info";
  message: string;
}

interface StoreValue {
  customers: Customer[];
  toasts: Toast[];
  toast: (kind: Toast["kind"], message: string) => void;
  dismissToast: (id: string) => void;
  get: (id: string) => Customer | undefined;
  mutate: (id: string, fn: (c: Customer) => Customer) => void;
  log: (id: string, message: string, tone?: Activity["tone"]) => void;
  createLead: (seed: Partial<Customer["lead"]>) => string;
  deleteCustomer: (id: string) => void;
  toggleDummyAccount: (id: string) => void;
  toggleActiveStatus: (id: string) => void;
  sendTechMail: (id: string, draft: TechMailDraft) => void;
  resolveRequest: (id: string, reqId: string, status: "approved" | "rejected") => void;
  addPriceRequest: (id: string, req: Omit<PriceRequest, "id" | "ts" | "status">) => void;
  acceptCharges: (id: string) => void;
  uploadSignedContract: (id: string, file: DocFile) => void;
  verifyContract: (id: string) => void;
}

const Ctx = createContext<StoreValue | null>(null);
const KEY = "mvload-onboarding-v5";

function load(): Customer[] {
  try {
    const raw = sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Customer[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* fall through to seed */
  }
  return seedCustomers();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(customers));
    } catch {
      /* storage unavailable */
    }
  }, [customers]);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    window.clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const toast = useCallback(
    (kind: Toast["kind"], message: string) => {
      const id = uid();
      setToasts((t) => [...t.slice(-3), { id, kind, message }]);
      timers.current[id] = window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast]
  );

  const mutate = useCallback((id: string, fn: (c: Customer) => Customer) => {
    setCustomers((list) => list.map((c) => (c.id === id ? fn(c) : c)));
  }, []);

  const log = useCallback(
    (id: string, message: string, tone: Activity["tone"] = "gray") => {
      mutate(id, (c) => ({
        ...c,
        activity: [
          ...c.activity,
          { id: uid(), ts: new Date().toISOString(), message, tone },
        ],
      }));
    },
    [mutate]
  );

  const createLead = useCallback(
    (seed: Partial<Customer["lead"]>) => {
      const id = "c-" + uid();
      const customer: Customer = {
        id,
        createdAt: new Date().toISOString(),
        stage: "lead",
        isDummyAccount: false,
        isActive: true,
        rateType: "Rate",
        stats: defaultStats(),
        lead: {
          name: seed.name ?? "",
          company: seed.company ?? "",
          mobile: seed.mobile ?? "",
          email: seed.email ?? "",
          source: seed.source ?? "Website",
          leadType: seed.leadType ?? "New Business Enquiry",
          description: seed.description ?? "",
          salesperson: seed.salesperson ?? "Anjali Sharma",
          paymentType: seed.paymentType ?? "Postpaid",
          status: "draft",
          emailSent: false,
        },
        activity: [
          {
            id: uid(),
            ts: new Date().toISOString(),
            message: `Lead created from ${seed.source ?? "Website"}`,
            tone: "orange",
          },
        ],
      };
      setCustomers((list) => [customer, ...list]);
      return id;
    },
    []
  );

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((list) => list.filter((c) => c.id !== id));
  }, []);

  const toggleDummyAccount = useCallback((id: string) => {
    setCustomers((list) =>
      list.map((c) =>
        c.id === id ? { ...c, isDummyAccount: !c.isDummyAccount } : c
      )
    );
  }, []);

  const toggleActiveStatus = useCallback((id: string) => {
    setCustomers((list) =>
      list.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  }, []);

  const sendTechMail = useCallback(
    (id: string, draft: TechMailDraft) => {
      mutate(id, (c) => ({
        ...c,
        techMailDraft: { ...draft, sent: true, sentAt: new Date().toISOString() },
      }));
      log(id, "Salesperson drafted & sent panel build email to Tech Team", "blue");
    },
    [mutate, log]
  );

  const addPriceRequest = useCallback(
    (id: string, req: Omit<PriceRequest, "id" | "ts" | "status">) => {
      mutate(id, (c) =>
        c.portal
          ? {
              ...c,
              portal: {
                ...c.portal,
                requests: [
                  ...c.portal.requests,
                  { ...req, id: uid(), ts: new Date().toISOString(), status: "pending" },
                ],
              },
            }
          : c
      );
    },
    [mutate]
  );

  const resolveRequest = useCallback(
    (id: string, reqId: string, status: "approved" | "rejected") => {
      mutate(id, (c) => {
        if (!c.portal) return c;
        const req = c.portal.requests.find((r) => r.id === reqId);
        if (!req) return c;
        let portal = { ...c.portal };
        if (status === "approved") {
          if (req.kind === "rate" && req.zone && req.slab) {
            portal = {
              ...portal,
              rates: portal.rates.map((row) =>
                row.zone === req.zone
                  ? {
                      ...row,
                      values: row.values.map((v, i) =>
                        portal.rateSlabs[i] === req.slab ? req.proposedRate : v
                      ),
                    }
                  : row
              ),
            };
          } else if (req.kind === "charge" && req.chargeId) {
            portal = {
              ...portal,
              charges: portal.charges.map((ch) =>
                ch.id === req.chargeId ? { ...ch, value: req.proposedRate } : ch
              ),
            };
          }
        }
        return {
          ...c,
          portal: {
            ...portal,
            requests: portal.requests.map((r) =>
              r.id === reqId ? { ...r, status } : r
            ),
          },
        };
      });
    },
    [mutate]
  );

  const acceptCharges = useCallback(
    (id: string) => {
      mutate(id, (c) => {
        if (!c.portal) return c;
        return {
          ...c,
          stage: "contract-creation" as const,
          contract: {
            generatedAt: new Date().toISOString(),
            acceptedByCustomer: true,
            acceptedAt: new Date().toISOString(),
            verifiedByAdmin: false,
            chargesSnapshot: [...c.portal.charges],
            ratesSnapshot: c.portal.rates.map((r) => ({ ...r, values: [...r.values] })),
            rateSlabsSnapshot: [...c.portal.rateSlabs],
          },
        };
      });
      log(id, "Customer accepted & locked in final charges — contract creation started", "green");
    },
    [mutate, log]
  );

  const uploadSignedContract = useCallback(
    (id: string, file: DocFile) => {
      mutate(id, (c) => {
        if (!c.contract) return c;
        return {
          ...c,
          stage: "contract-verification" as const,
          contract: {
            ...c.contract,
            signedContractFile: { ...file, uploadedAt: new Date().toISOString() },
          },
        };
      });
      log(id, `Signed contract uploaded: ${file.name} — awaiting admin verification`, "blue");
    },
    [mutate, log]
  );

  const verifyContract = useCallback(
    (id: string) => {
      mutate(id, (c) => {
        if (!c.contract) return c;
        return {
          ...c,
          stage: "done" as const,
          contract: {
            ...c.contract,
            verifiedByAdmin: true,
            verifiedAt: new Date().toISOString(),
          },
        };
      });
      log(id, "Contract verified by admin — customer is fully onboarded & live!", "green");
    },
    [mutate, log]
  );

  const get = useCallback(
    (id: string) => customers.find((c) => c.id === id),
    [customers]
  );

  const value = useMemo(
    () => ({
      customers,
      toasts,
      toast,
      dismissToast,
      get,
      mutate,
      log,
      createLead,
      deleteCustomer,
      toggleDummyAccount,
      toggleActiveStatus,
      sendTechMail,
      addPriceRequest,
      resolveRequest,
      acceptCharges,
      uploadSignedContract,
      verifyContract,
    }),
    [
      customers,
      toasts,
      toast,
      dismissToast,
      get,
      mutate,
      log,
      createLead,
      deleteCustomer,
      toggleDummyAccount,
      toggleActiveStatus,
      sendTechMail,
      addPriceRequest,
      resolveRequest,
      acceptCharges,
      uploadSignedContract,
      verifyContract,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used within StoreProvider");
  return v;
}

export function usePortalDefaults() {
  return genPortalData;
}
