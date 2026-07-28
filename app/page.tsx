import { CopyField } from "@/components/copy-field";
import { copyLinks, steps, workshop } from "@/lib/content";

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
              Start here
            </h2>
            <p className="text-sm text-white/50">
              Copy these two links before we begin.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {copyLinks.map((link) => (
              <CopyField
                key={link.id}
                label={link.label}
                hint={link.hint}
                value={link.value}
              />
            ))}
          </div>
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
