"use client";

import { useState } from "react";
import { CopyField } from "@/components/copy-field";
import { installCommands } from "@/lib/content";

export function InstallCommand() {
  const [osId, setOsId] = useState(installCommands[0].id);
  const selected =
    installCommands.find((c) => c.id === osId) ?? installCommands[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="font-display text-sm font-semibold text-white">
          1 · Instalá la skill
        </span>
        <span className="text-xs text-white/40">
          Corrélo en tu terminal. Se instala en Claude Code, Codex o Cursor — el
          que tengas.
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Sistema operativo"
        className="flex w-fit gap-1 rounded-lg border border-line bg-ink p-1"
      >
        {installCommands.map((command) => {
          const active = command.id === selected.id;
          return (
            <button
              key={command.id}
              role="tab"
              aria-selected={active}
              onClick={() => setOsId(command.id)}
              className={`rounded-md px-3 py-1.5 font-display text-xs font-semibold transition ${
                active
                  ? "bg-bnb text-black"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {command.os}
            </button>
          );
        })}
      </div>

      <CopyField value={selected.value} />
    </div>
  );
}
