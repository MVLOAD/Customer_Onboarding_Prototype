import { useState } from "react";
import {
  ArrowLeft,
  KeySquare,
  BadgeCheck,
  RefreshCw,
  Mail,
  MailWarning,
} from "lucide-react";
import { useStore } from "../store";
import CustomerHeader from "./CustomerPortal/CustomerHeader";
import CustomerSidebar, { type CustomerTab } from "./CustomerPortal/CustomerSidebar";
import CustomerDashboard from "./CustomerPortal/CustomerDashboard";
import StandardRateAndTat from "./CustomerPortal/StandardRateAndTat";
import ContractCreation from "./CustomerPortal/ContractCreation";
import { Badge, Button } from "./ui";
import { cn } from "../utils/cn";

export default function Portal({
  id,
  initialTab = "dashboard",
  onExit,
}: {
  id: string;
  initialTab?: CustomerTab;
  onExit: () => void;
}) {
  const { get, mutate, log, toast } = useStore();
  const customer = get(id);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const [activeTab, setActiveTab] = useState<CustomerTab>(initialTab);
  const [otpInput, setOtpInput] = useState("");
  const [otpErr, setOtpErr] = useState("");

  const portal = customer?.portal;

  if (!customer || !portal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6 select-none">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-md max-w-md">
          <img src="/mvload.png" alt="MV LOAD" className="h-12 w-auto mx-auto mb-4" />
          <h3 className="font-display text-lg font-bold text-ink-900">
            Portal Not Provisioned
          </h3>
          <p className="text-xs text-ink-500 mt-1 mb-5">
            The customer panel for <span className="font-semibold text-ink-700">{customer?.lead.company || "this account"}</span> has not been initialized yet.
          </p>
          <Button onClick={onExit} className="w-full">
            <ArrowLeft size={15} /> Return to Admin Panel
          </Button>
        </div>
      </div>
    );
  }

  const activated = portal.status === "activated";

  /* ---------------- OTP Verification Handlers ---------------- */
  const verifyOtp = () => {
    if (otpInput.trim() === portal.otp) {
      mutate(customer.id, (c) =>
        c.portal
          ? {
              ...c,
              stage: "rates-tat" as const,
              portal: {
                ...c.portal,
                status: "activated",
                activatedAt: new Date().toISOString(),
              },
            }
          : c
      );
      log(customer.id, "Customer verified OTP & generated portal password — moved to Rates & TAT stage", "green");
      toast("success", "OTP Verified! Your access password has been generated.");
      setOtpErr("");
      setLoginEmail(portal.username);
      setLoginPassword(portal.password);
    } else {
      setOtpErr("Incorrect OTP code — please check the email and try again.");
      toast("error", "The OTP code entered did not match.");
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginErr("Please enter both email and password.");
      return;
    }
    const cleanEmail = loginEmail.trim().toLowerCase();
    const expectedEmail = portal.username.toLowerCase();
    if (cleanEmail === expectedEmail && loginPassword.trim() === portal.password) {
      setIsLoggedIn(true);
      setLoginErr("");
      toast("success", "Login successful! Welcome to your customer portal.");
    } else {
      setLoginErr("Invalid email or password. Please check your credentials.");
      toast("error", "Login failed — invalid credentials.");
    }
  };

  const resendOtp = () => {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    mutate(customer.id, (c) =>
      c.portal
        ? {
            ...c,
            portal: {
              ...c.portal,
              otp,
              otpSentAt: new Date().toISOString(),
            },
          }
        : c
    );
    log(customer.id, "Customer requested fresh OTP from panel", "blue");
    setOtpInput("");
    setOtpErr("");
    toast("info", "A fresh OTP has been sent to your registered email.");
  };

  // Step 1: If not yet activated via OTP
  if (!activated) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col select-none">
        <header className="border-b border-gray-200 bg-white px-6 py-3 shadow-2xs">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/mvload.png" alt="MV LOAD" className="h-9 w-auto" />
              <span className="font-display text-sm font-bold text-ink-900 border-l border-gray-200 pl-3">
                Customer Authentication & Password Generation
              </span>
            </div>
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-gray-50"
            >
              <ArrowLeft size={13} /> Back to Admin
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="anim-fade-up w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-brand-50/60 px-6 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white">
                <MailWarning size={18} />
              </span>
              <div>
                <p className="font-display text-base font-bold text-ink-900">
                  Step 1: Verify OTP Sent to Your Email
                </p>
                <p className="text-xs text-ink-500">
                  Enter the one-time OTP sent to{" "}
                  <span className="font-semibold text-ink-700">{portal.username}</span> to generate your portal password.
                </p>
              </div>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50/60 p-6 text-center">
                <KeySquare size={24} className="mb-2 text-brand-500" />
                <p className="text-sm font-bold text-ink-900">Enter 6-Digit OTP</p>
                <p className="mb-4 text-xs text-ink-400">
                  Check your simulated email inbox on the right
                </p>
                <input
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setOtpErr("");
                  }}
                  placeholder="••••••"
                  inputMode="numeric"
                  className={cn(
                    "w-44 rounded-xl border bg-white px-3 py-2.5 text-center font-mono text-2xl font-bold tracking-[0.4em] text-ink-900 outline-none transition focus:ring-2",
                    otpErr
                      ? "border-red-400 focus:ring-red-100"
                      : "border-gray-300 focus:border-brand-500 focus:ring-brand-100"
                  )}
                />
                {otpErr && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">
                    {otpErr}
                  </p>
                )}
                <Button
                  className="mt-4 w-44 bg-brand-500 hover:bg-brand-600 font-semibold"
                  onClick={verifyOtp}
                  disabled={otpInput.length !== 6}
                >
                  <BadgeCheck size={16} /> Verify OTP & Password
                </Button>
                <button
                  onClick={resendOtp}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition hover:text-brand-700"
                >
                  <RefreshCw size={12} /> Resend OTP
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 text-left text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-3.5 py-2">
                    <Mail size={13} className="text-ink-500" />
                    <span className="font-bold text-ink-700">Inbox · {portal.username}</span>
                    <Badge tone="gray" className="ml-auto text-[10px]">
                      Simulated
                    </Badge>
                  </div>
                  <div className="space-y-1 border-b border-gray-100 px-3.5 py-2.5 text-[11.5px]">
                    <p>
                      <span className="font-semibold text-ink-500">From:</span> MV Load &lt;onboarding@mvload.in&gt;
                    </p>
                    <p>
                      <span className="font-semibold text-ink-500">Subject:</span> Portal Verification OTP Code
                    </p>
                  </div>
                  <div className="p-3.5 space-y-2 text-ink-700">
                    <p>Dear {customer.lead.name || "Customer"},</p>
                    <p className="text-[11.5px]">
                      Your one-time verification code for activating portal credentials is:
                    </p>
                    <p className="my-2 rounded-lg bg-brand-50 py-2.5 text-center font-mono text-2xl font-bold tracking-[0.4em] text-brand-700 ring-1 ring-brand-200">
                      {portal.otp}
                    </p>
                    <p className="text-[10.5px] text-gray-400">
                      Valid for 10 minutes. Verifying this code will generate your portal password.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50/60 border-t border-gray-100 text-center">
                  <button
                    onClick={() => {
                      setOtpInput(portal.otp);
                      setOtpErr("");
                    }}
                    className="text-[11px] font-bold text-brand-600 hover:underline"
                  >
                    Click to auto-fill OTP ({portal.otp})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Step 2: Customer Login Screen (Requires username & generated password)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col select-none">
        <header className="border-b border-gray-200 bg-white px-6 py-3 shadow-2xs">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/mvload.png" alt="MV LOAD" className="h-9 w-auto" />
              <span className="font-display text-sm font-bold text-ink-900 border-l border-gray-200 pl-3">
                Customer Portal Login
              </span>
            </div>
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-gray-50"
            >
              <ArrowLeft size={13} /> Exit Portal
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="anim-fade-up w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-100 bg-gradient-to-r from-ink-900 to-ink-800 px-6 py-6 text-center text-white">
              <img src="/mvload.png" alt="MV LOAD" className="h-10 w-auto mx-auto mb-3 invert brightness-200" />
              <h2 className="font-display text-xl font-bold">Welcome Back</h2>
              <p className="text-xs text-white/70 mt-1">
                Log in with your registered email and generated password
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Email / Username
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setLoginErr("");
                  }}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs font-medium outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Generated Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginErr("");
                  }}
                  placeholder="MVL-••••••"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs font-mono font-medium outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {loginErr && (
                <p className="text-xs font-semibold text-red-500">{loginErr}</p>
              )}

              <Button type="submit" className="w-full py-2.5 text-xs font-bold bg-brand-500 hover:bg-brand-600">
                Log In to Customer Portal
              </Button>

              <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3 text-center text-xs">
                <p className="text-ink-600 text-[11px] mb-1">Testing shortcut / Demo convenience:</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail(portal.username);
                    setLoginPassword(portal.password);
                    setLoginErr("");
                  }}
                  className="font-bold text-brand-700 hover:underline"
                >
                  Auto-fill Credentials ({portal.username} / {portal.password})
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Fully activated Customer Panel Layout matching Image 2
  return (
    <div className="flex h-screen overflow-hidden bg-canvas font-sans">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Exact Customer Header */}
        <CustomerHeader customer={customer} onExit={onExit} />

        {/* Sidebar + Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Exact Customer Sidebar */}
          <CustomerSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

          {/* Main Panel Views */}
          <main className="nice-scroll flex-1 overflow-y-auto px-7 py-6">
            {activeTab === "standard-rate-tat" ? (
              <StandardRateAndTat
                customer={customer}
                onNavigateToContract={() => setActiveTab("contract")}
              />
            ) : activeTab === "contract" ? (
              <ContractCreation customer={customer} />
            ) : (
              <CustomerDashboard
                customer={customer}
                onNavigateToRates={() => setActiveTab("standard-rate-tat")}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
