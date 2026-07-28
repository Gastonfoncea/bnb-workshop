"use client";

import { useEffect, useRef, useState } from "react";

type CopyFieldProps = {
  label: string;
  hint?: string;
  value: string;
};

export function CopyField({ label, hint, value }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function copy() {
    const input = inputRef.current;

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API needs a secure context — fall back to selecting the field.
      input?.select();
      input?.setSelectionRange(0, value.length);
    }

    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-sm font-semibold text-white">
          {label}
        </span>
        {hint ? (
          <span className="text-xs text-white/40">{hint}</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={inputRef}
          readOnly
          value={value}
          aria-label={label}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 truncate rounded-lg border border-line bg-ink px-4 py-3 font-mono text-sm text-white/80 outline-none transition focus:border-bnb/60 focus:text-white"
        />
        <button
          type="button"
          onClick={copy}
          aria-live="polite"
          className="shrink-0 rounded-lg bg-bnb px-5 py-3 font-display text-sm font-semibold text-black transition hover:bg-bnb-bright active:scale-[0.98] sm:w-28"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}
