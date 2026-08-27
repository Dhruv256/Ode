"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ── Step heading: oversized editorial headline ─────────────────────────── */

export function StepHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "font-display font-light leading-[1.02] tracking-tightest text-4xl sm:text-5xl lg:text-6xl",
        className
      )}
    >
      {children}
    </h1>
  );
}

/* ── Step eyebrow: mono step marker, e.g. “01 / PERSON” ─────────────────── */

export function StepEyebrow({
  index,
  label,
  className,
}: {
  index: string;
  label: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] uppercase tracking-widest2 text-ink-faint sm:text-xs",
        className
      )}
    >
      {index} / {label}
    </p>
  );
}

/* ── Primary action button: rectangular, ink-on-paper inversion ─────────── */

export function ActionButton({
  children,
  onClick,
  disabled,
  variant = "solid",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "solid" | "ghost";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-3 border px-6 py-3 font-mono text-xs uppercase tracking-widest2 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-30 sm:text-[13px]",
        variant === "solid"
          ? "border-ink bg-ink text-paper hover:bg-transparent hover:text-ink"
          : "border-line bg-transparent text-ink hover:border-ink",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ── Text field: hairline underline style, no rounded boxes ─────────────── */

export function TextField({
  value,
  onChange,
  placeholder,
  label,
  required,
  maxLength = 120,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
          {label}
          {!required && <span className="normal-case"> · optional</span>}
        </span>
      )}
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-b border-line bg-transparent pb-2 font-sans text-lg text-ink placeholder:text-ink-faint/70 focus:border-ink focus:outline-none"
      />
    </label>
  );
}

/* ── Selectable chip (interests) — square, not pill-spam ────────────────── */

export function Chip({
  label,
  selected,
  onClick,
  custom,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  custom?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "border px-3 py-1.5 text-sm transition-colors duration-150",
        selected
          ? "border-ink bg-ink text-paper"
          : "border-line bg-transparent text-ink-soft hover:border-ink"
      )}
    >
      {label}
      {custom && selected && <span className="ml-1.5 font-mono text-[10px] opacity-60">+</span>}
    </button>
  );
}

/* ── Skip affordance for optional questions ─────────────────────────────── */

export function SkipButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-mono text-[11px] uppercase tracking-widest2 text-ink-faint underline underline-offset-4 transition-colors hover:text-ink"
    >
      Skip →
    </button>
  );
}
