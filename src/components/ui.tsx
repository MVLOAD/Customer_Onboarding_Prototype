import { useEffect, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Check, Circle, X, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "../utils/cn";
import { useStore } from "../store";
import { STAGES, stageIndex } from "../data";
import type { Stage } from "../types";

/* ------------------------------ buttons ------------------------------ */

type Variant = "primary" | "outline" | "ghost" | "danger" | "dark";

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary:
      "bg-brand-500 text-white shadow-sm shadow-brand-500/30 hover:bg-brand-600 active:scale-[.98] disabled:bg-brand-300 disabled:shadow-none",
    outline:
      "border border-gray-300 bg-white text-ink-700 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 active:scale-[.98] disabled:text-gray-400 disabled:hover:bg-white disabled:hover:border-gray-300",
    ghost: "text-ink-500 hover:bg-gray-100 hover:text-ink-900",
    danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50 active:scale-[.98]",
    dark: "bg-ink-900 text-white hover:bg-ink-700 active:scale-[.98]",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed",
        styles[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ------------------------------ badges ------------------------------ */

export function Badge({
  tone = "gray",
  children,
  className,
}: {
  tone?: "green" | "red" | "orange" | "gray" | "blue";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    red: "bg-red-50 text-red-600 ring-red-600/20",
    orange: "bg-brand-50 text-brand-700 ring-brand-600/25",
    gray: "bg-gray-100 text-gray-600 ring-gray-500/20",
    blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------ form controls ------------------------------ */

const control =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder-gray-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function Field({
  label,
  required,
  error,
  children,
  className,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-center gap-1 text-[13px] font-semibold text-ink-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 flex items-center gap-1 text-xs font-medium text-red-500">
          <AlertTriangle size={12} /> {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-gray-400">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput({
  invalid,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(
        control,
        invalid ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-300",
        className
      )}
      {...rest}
    />
  );
}

export function Select({
  invalid,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      className={cn(
        control,
        "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%235d6b7b%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.9rem_center] bg-no-repeat pr-9",
        invalid ? "border-red-400" : "border-gray-300",
        className
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

export function TextArea({
  invalid,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(control, "min-h-[84px] resize-y", invalid ? "border-red-400" : "border-gray-300", className)}
      {...rest}
    />
  );
}

/* ------------------------------ card ------------------------------ */

export function Card({
  title,
  subtitle,
  actions,
  children,
  className,
  icon,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(16,24,40,.06)]",
        className
      )}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            {icon && (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                {icon}
              </span>
            )}
            <div>
              <h3 className="font-display text-[15px] font-semibold text-ink-900">{title}</h3>
              {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
            </div>
          </div>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/* ------------------------------ modal ------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cn(
          "anim-scale-in relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl",
          wide ? "max-w-2xl" : "max-w-lg"
        )}
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-ink-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>
        <div className="nice-scroll overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------ toasts ------------------------------ */

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed right-5 top-5 z-[60] flex w-[340px] flex-col gap-2.5">
      {toasts.map((t) => {
        const Icon = t.kind === "success" ? CheckCircle2 : t.kind === "error" ? AlertTriangle : Info;
        const tone =
          t.kind === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : t.kind === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-brand-200 bg-brand-50 text-brand-800";
        return (
          <div
            key={t.id}
            className={cn(
              "anim-slide-right pointer-events-auto flex items-start gap-2.5 rounded-lg border px-3.5 py-3 shadow-lg shadow-black/5",
              tone
            )}
          >
            <Icon size={17} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-[13px] font-semibold leading-snug">{t.message}</p>
            <button onClick={() => dismissToast(t.id)} className="opacity-50 transition hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ funnel stage dots ------------------------------ */

export function StageDots({ stage, size = "sm" }: { stage: Stage; size?: "sm" | "md" }) {
  const current = stageIndex(stage);
  const dim = size === "sm" ? "h-[18px] w-[18px]" : "h-6 w-6";
  const icon = size === "sm" ? 10 : 13;
  return (
    <div className="flex items-center">
      {STAGES.map((s, i) => {
        const done = stage === "done" ? i < 3 : i < current;
        const isCurrent = i === current && stage !== "done";
        const isFuture = i === 3;
        return (
          <div key={s.key} className="flex items-center">
            {i > 0 && (
              <span
                className={cn(
                  "h-[2px] w-3 rounded",
                  done || isCurrent ? "bg-emerald-400" : "bg-gray-200"
                )}
              />
            )}
            <span
              title={s.label}
              className={cn(
                "flex items-center justify-center rounded-full transition",
                dim,
                done && !isFuture
                  ? "bg-emerald-500 text-white"
                  : isCurrent
                    ? "pulse-ring bg-brand-500 text-white"
                    : isFuture && (done || i <= current)
                      ? "border-2 border-gray-300 bg-white text-gray-300"
                      : "border-2 border-gray-300 bg-white"
              )}
            >
              {done && !isFuture ? (
                <Check size={icon} strokeWidth={3.5} />
              ) : isCurrent ? (
                <Circle size={icon - 3} fill="currentColor" stroke="none" />
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function StageLabel({ stage }: { stage: Stage }) {
  const idx = stageIndex(stage);
  if (stage === "done") return <Badge tone="green">Onboarded</Badge>;
  return (
    <Badge tone="orange">
      <Circle size={7} fill="currentColor" stroke="none" />
      {STAGES[idx].label}
    </Badge>
  );
}
