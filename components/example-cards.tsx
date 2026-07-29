"use client";

import { useEffect, useRef, useState } from "react";
import { agentExamples } from "@/lib/content";

/* The hero already owns the one loud yellow button on this page, so these copy
   affordances stay as quiet text buttons — four more filled buttons would
   compete with the step the attendee is actually supposed to do first. */

function ExampleCard({
  name,
  tag,
  useCase,
  prompt,
}: (typeof agentExamples)[number]) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Clipboard API needs a secure context. Nothing to select here, so say
      // nothing rather than claim a copy that never happened.
      return;
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-panel p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-white">
          {name}
        </h3>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-white/30">
          {tag}
        </span>
      </div>

      <p className="min-w-0 flex-1 text-sm leading-relaxed text-white/50">
        {useCase}
      </p>

      <button
        type="button"
        onClick={copy}
        aria-live="polite"
        className="mt-1 self-start rounded font-mono text-xs text-bnb transition-colors hover:text-bnb-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bnb"
      >
        {copied ? "Copiado ✓" : "Copiar la frase →"}
      </button>
    </div>
  );
}

export function ExampleCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {agentExamples.map((example) => (
        <ExampleCard key={example.id} {...example} />
      ))}
    </div>
  );
}
