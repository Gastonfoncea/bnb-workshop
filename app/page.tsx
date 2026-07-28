import { CopyField } from "@/components/copy-field";
import { InstallCommand } from "@/components/install-command";
import { agentPrompt, claudeCodeAlt, steps, workshop } from "@/lib/content";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
      {/* ambient gold wash behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-64 h-[42rem] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(240,185,11,0.16),transparent_70%)]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
        <span className="font-display text-sm font-semibold tracking-tight">
          BNB Agent Studio
        </span>
        <span className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-white/50">
          Workshop
        </span>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col gap-16 px-6 pb-24 pt-10 sm:pt-20">
        <section className="flex flex-col gap-6">
          <span className="font-mono text-xs uppercase tracking-widest text-bnb">
            {workshop.eyebrow}
          </span>
          <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl">
            {workshop.title}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-white/60">
            {workshop.lede}
          </p>
        </section>

        <section className="flex flex-col gap-6 rounded-xl border border-line bg-panel p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-lg font-semibold text-white">
              Get started
            </h2>
            <p className="text-sm text-white/50">
              Two steps, before we begin.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <InstallCommand />

            <CopyField
              multiline
              label={agentPrompt.label}
              hint={agentPrompt.hint}
              value={agentPrompt.value}
            />
          </div>

          <details className="group border-t border-line pt-5">
            <summary className="cursor-pointer list-none font-mono text-xs text-white/40 transition hover:text-white/70">
              <span className="group-open:hidden">
                + Using Claude Code? There&apos;s a native install too
              </span>
              <span className="hidden group-open:inline">
                − Native Claude Code install
              </span>
            </summary>
            <div className="flex flex-col gap-3 pt-4">
              <p className="text-xs leading-relaxed text-white/40">
                Installing as a plugin instead of a plain skill gets you
                versioning and updates via{" "}
                <code className="font-mono text-white/60">/plugin update</code>.
                Run both in Claude Code, then{" "}
                <code className="font-mono text-white/60">/reload-plugins</code>.
              </p>
              <CopyField value={claudeCodeAlt.marketplace} />
              <CopyField value={claudeCodeAlt.install} />
            </div>
          </details>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-white/40">
            What we&apos;re building
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.n}
                className="flex flex-col gap-2 rounded-lg border border-line bg-panel p-5"
              >
                <span className="font-mono text-xs text-bnb">{step.n}</span>
                <h3 className="font-display text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/50">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-3xl border-t border-line px-6 py-8">
        <p className="font-mono text-xs text-white/30">
          BNB Chain · AI Agents on Chain
        </p>
      </footer>
    </div>
  );
}
