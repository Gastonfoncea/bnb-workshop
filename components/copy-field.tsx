"use client";

import { useEffect, useRef, useState } from "react";

type CopyFieldProps = {
  value: string;
  label?: string;
  hint?: string;
  /** Render a wrapping textarea instead of a single line, for long prompts. */
  multiline?: boolean;
};

const fieldStyles =
  "w-full min-w-0 flex-1 resize-none rounded-lg border border-line bg-ink px-4 py-3 font-mono text-sm text-white/80 outline-none transition focus:border-bnb/60 focus:text-white";

export function CopyField({ value, label, hint, multiline }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API needs a secure context — fall back to selecting the text
      // so the attendee can still copy it by hand.
      fieldRef.current?.select();
    }

    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2">
      {label || hint ? (
        <div className="flex flex-col gap-1">
          {label ? (
            <span className="font-display text-sm font-semibold text-white">
              {label}
            </span>
          ) : null}
          {hint ? <span className="text-xs text-white/40">{hint}</span> : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        {multiline ? (
          <textarea
            ref={fieldRef as React.RefObject<HTMLTextAreaElement>}
            readOnly
            rows={3}
            value={value}
            aria-label={label ?? "Texto para copiar"}
            onFocus={(e) => e.currentTarget.select()}
            className={`${fieldStyles} leading-relaxed`}
          />
        ) : (
          <input
            ref={fieldRef as React.RefObject<HTMLInputElement>}
            readOnly
            value={value}
            aria-label={label ?? "Texto para copiar"}
            onFocus={(e) => e.currentTarget.select()}
            className={`${fieldStyles} truncate`}
          />
        )}
        <button
          type="button"
          onClick={copy}
          aria-live="polite"
          className="shrink-0 rounded-lg bg-bnb px-5 py-3 font-display text-sm font-semibold text-black transition hover:bg-bnb-bright active:scale-[0.98] sm:w-28"
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
