"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

/* ---------- building blocks ---------------------------------------------- */
/* Every list row is flex with a shrink-0 marker and a min-w-0 body. A grid
   with a fixed first column strangles the text cell at some widths and the
   words break one letter per line — min-w-0 on a flex child is what keeps
   long content wrapping normally instead of collapsing. */

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bnb">
        {children}
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function Title({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-balance font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
      {children}
    </h2>
  );
}

function Lede({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-2xl text-pretty text-base leading-relaxed text-white/60 sm:text-lg">
      {children}
    </p>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-bnb/12 px-1.5 py-0.5 font-mono text-[0.86em] text-bnb-bright">
      {children}
    </code>
  );
}

function Terminal({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line border-l-2 border-l-bnb bg-panel p-4 sm:p-5">
      <pre className="font-mono text-[0.78rem] leading-relaxed text-white/85 sm:text-sm">
        {children}
      </pre>
    </div>
  );
}

function Dim({ children }: { children: ReactNode }) {
  return <span className="text-white/35">{children}</span>;
}

function Gold({ children }: { children: ReactNode }) {
  return <span className="text-bnb">{children}</span>;
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-baseline gap-4 border-b border-line/60 pb-3 last:border-0 last:pb-0"
        >
          <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-bnb">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1 text-sm leading-relaxed text-white/70 sm:text-base">
            {item}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-baseline gap-3">
          <span className="shrink-0 font-mono text-bnb">—</span>
          <span className="min-w-0 flex-1 text-sm leading-relaxed text-white/70 sm:text-base">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Panel({
  tone,
  heading,
  items,
  footer,
}: {
  tone: "in" | "out";
  heading: string;
  items: string[];
  footer?: ReactNode;
}) {
  const accent = tone === "in" ? "text-emerald-400" : "text-orange-400";
  const edge = tone === "in" ? "border-t-emerald-400" : "border-t-orange-400";
  return (
    <div
      className={`flex min-w-0 flex-col gap-4 rounded-lg border border-line border-t-2 bg-panel p-5 ${edge}`}
    >
      <h3 className={`font-display text-base font-semibold ${accent}`}>
        {heading}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-baseline gap-2.5">
            <span className={`shrink-0 font-mono text-xs ${accent}`}>
              {tone === "in" ? "✓" : "×"}
            </span>
            <span className="min-w-0 flex-1 text-sm leading-snug text-white/65">
              {item}
            </span>
          </li>
        ))}
      </ul>
      {footer ? (
        <p className="text-sm leading-snug text-white/40">{footer}</p>
      ) : null}
    </div>
  );
}

function Split({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Note({
  tag,
  children,
  tone = "gold",
}: {
  tag: string;
  children: ReactNode;
  tone?: "gold" | "warn";
}) {
  const edge = tone === "gold" ? "border-l-bnb" : "border-l-orange-400";
  const label = tone === "gold" ? "text-bnb" : "text-orange-400";
  return (
    <div
      className={`flex flex-col gap-2 rounded-r-lg border-l-2 bg-panel/70 p-4 sm:p-5 ${edge}`}
    >
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.16em] ${label}`}
      >
        {tag}
      </span>
      <p className="text-sm leading-relaxed text-white/70 sm:text-base">
        {children}
      </p>
    </div>
  );
}

function Facts({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
      {items.map(([term, value]) => (
        <div key={term} className="flex flex-col gap-1 bg-panel p-4">
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            {term}
          </dt>
          <dd className="min-w-0 break-words font-mono text-sm text-white sm:text-base">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- slides -------------------------------------------------------- */

type Slide = { section: string; eyebrow: string; body: ReactNode };

const slides: Slide[] = [
  {
    section: "Inicio",
    eyebrow: "Workshop · BNB Chain",
    body: (
      <>
        <h1 className="text-balance font-display text-4xl font-bold leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Agentes que cobran on-chain
        </h1>
        <Lede>
          Vas a construir un agente vendedor sobre BNB Chain: cotiza un trabajo,
          lo firma con su propia wallet, y cobra cuando lo entrega.
        </Lede>
        <div className="h-px w-full bg-line" />
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-white/35">
          <span>ERC-8004 · ERC-8183 · x402</span>
          <span>Protocolo A2A</span>
          <span>Google ADK sobre AgentCore</span>
        </div>
      </>
    ),
  },
  {
    section: "Inicio",
    eyebrow: "De qué se trata",
    body: (
      <>
        <Title>Tres preguntas</Title>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Cómo se usa",
              "Un comando, ocho fases, y terminás con un agente que responde.",
            ],
            [
              "Qué queda afuera",
              "El recorte no es pereza: es dónde está el cuello de botella real.",
            ],
            [
              "Cómo seguir",
              "Qué falta entre “anda en mi máquina” y “está publicado”.",
            ],
          ].map(([heading, text], i) => (
            <div
              key={heading}
              className="flex min-w-0 flex-col gap-2 rounded-lg border border-line bg-panel p-5"
            >
              <span className="font-mono text-xs tabular-nums text-bnb">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-lg font-semibold text-white">
                {heading}
              </h3>
              <p className="text-sm leading-relaxed text-white/55">{text}</p>
            </div>
          ))}
        </div>
        <Lede>
          Al final vas a poder probar tu agente sin gastar un centavo ni esperar
          un faucet.
        </Lede>
      </>
    ),
  },
  {
    section: "Cómo se usa",
    eyebrow: "Parte 1 · Cómo se usa la skill",
    body: (
      <>
        <Title>Le pedís el agente en una frase</Title>
        <Terminal>
          <Dim># en Claude Code, dentro de la carpeta del workshop</Dim>
          {"\n"}Usá la skill <Gold>create-bnb-agent</Gold> para crear un agente
          {"\n"}llamado <Gold>&quot;TxExplainer&quot;</Gold> que explique qué
          hizo una{"\n"}transacción de BNB Chain en lenguaje simple.
        </Terminal>
        <Lede>
          La skill sólo te pregunta dos cosas: <strong>cómo se llama</strong> y{" "}
          <strong>qué entrega</strong>. Precio, red, wallet, modelo y protocolo
          ya vienen fijados.
        </Lede>
      </>
    ),
  },
  {
    section: "Cómo se usa",
    eyebrow: "Parte 1 · Las ocho fases",
    body: (
      <>
        <Title>Qué hace por vos</Title>
        <Steps
          items={[
            "Verifica dependencias e instala lo que falte",
            "Crea el proyecto y una wallet descartable de testnet",
            "Activa el LLM con depósito cero",
            "Fija el precio e implementa tu función",
            "Corre el diagnóstico y levanta el agente local",
            "Prueba el protocolo y el producto que entrega",
            "Chequea si tenés gas, y te avisa si falta",
            <>
              <strong className="text-white">Frena antes del deploy.</strong>{" "}
              Siempre.
            </>,
          ]}
        />
      </>
    ),
  },
  {
    section: "Cómo se usa",
    eyebrow: "Parte 1 · Lo que ya viene decidido",
    body: (
      <>
        <Title>Los datos fijos</Title>
        <Facts
          items={[
            ["Precio", "0.1 U"],
            ["Red", "bsc-testnet"],
            ["Protocolo", "A2A"],
            ["Wallet", "evm-local"],
            ["Modelo", "auto/free"],
            ["Storage", "local"],
          ]}
        />
        <Lede>
          La wallet es <strong>descartable</strong> y sólo de testnet. No la
          reuses nunca en mainnet — su clave viaja al operador cuando desplegás
          al trial.
        </Lede>
      </>
    ),
  },
  {
    section: "Probarlo",
    eyebrow: "Parte 1 · La prueba que importa",
    body: (
      <>
        <Title>Probar el producto</Title>
        <Terminal>
          python <Gold>product_smoke_test.py</Gold> \{"\n"}
          {"  "}--project-root . \{"\n"}
          {"  "}--task &quot;Explicá la transacción 0xa8a2b1f6…&quot;
        </Terminal>
        <Lede>
          Corre tu función real contra el LLM y te imprime el entregable —{" "}
          <strong>sin escrow, sin faucet, sin comprador</strong>. Es la forma de
          ver tu agente haciendo lo suyo antes de tener un peso.
        </Lede>
        <Note tag="Qué devuelve">
          <Code>0</Code> entregable producido · <Code>1</Code> problema de
          configuración · <Code>2</Code> se acabó la cuota diaria del modelo
          gratis, que no es un error tuyo.
        </Note>
      </>
    ),
  },
  {
    section: "Qué queda afuera",
    eyebrow: "Parte 2 · El recorte",
    body: (
      <>
        <Title>Qué entra y qué no</Title>
        <Split>
          <Panel
            tone="in"
            heading="Entra"
            items={[
              "Scaffold, wallet y activación del LLM",
              "Tu función implementada",
              "Cotización firmada verificable",
              "Prueba del producto sin fondos",
              "Lectura de cadena ilimitada",
            ]}
          />
          <Panel
            tone="out"
            heading="Queda afuera"
            items={[
              "Registro ERC-8004",
              "Compra de datos pagos (x402)",
              "OAuth y Cognito",
              "El ciclo económico completo",
              "Deploy, salvo que quieras y puedas",
            ]}
          />
        </Split>
      </>
    ),
  },
  {
    section: "Qué queda afuera",
    eyebrow: "Parte 2 · Fondeo",
    body: (
      <>
        <Title>El faucet es opcional</Title>
        <Lede>
          Para <strong>armar el agente y probarlo</strong> no necesitás fondos.
          El faucet recién hace falta si querés cerrar el ciclo económico.
        </Lede>
        <Split>
          <Panel
            tone="in"
            heading="Sin fondos ya podés"
            items={[
              "Armar el agente completo",
              "Cotizar y firmar ofertas",
              "Correr el smoke test del producto",
              "Leer datos de la cadena",
            ]}
          />
          <Panel
            tone="out"
            heading="Con gas de testnet sumás"
            items={[
              "Financiar un trabajo real",
              "Entregar contra la cadena",
              "Cobrar y liquidar",
            ]}
            footer="Los faucets son lentos y tienen límite por dirección. Por eso está fuera del camino crítico."
          />
        </Split>
        <Note tag="Si trajiste BNB de mainnet">
          Podés desplegar de verdad. Usá una{" "}
          <strong>wallet nueva, nunca la del workshop</strong>: la del workshop
          es descartable y su clave ya viajó.
        </Note>
      </>
    ),
  },
  {
    section: "Qué queda afuera",
    eyebrow: "Parte 2 · Antes de desplegar",
    body: (
      <>
        <Title>Dónde se configura el storage</Title>
        <Terminal>
          <Dim># app/agent/studio.toml</Dim>
          {"\n"}[storage]{"\n"}kind = <Gold>&quot;ipfs&quot;</Gold>{" "}
          <Dim># en el workshop viene &quot;local&quot;</Dim>
          {"\n\n"}
          <Dim># y su endpoint, en .studio/.env.local</Dim>
          {"\n"}STORAGE_API_URL=…
        </Terminal>
        <Lede>
          El comprador lee tu entregable <strong>desde la cadena</strong>. Con
          storage <Code>local</Code> esa dirección apunta a un disco que sólo ve
          tu máquina — por eso un agente publicado no arranca así.
        </Lede>
      </>
    ),
  },
  {
    section: "Qué queda afuera",
    eyebrow: "Parte 2 · Antes de elegir tu función",
    body: (
      <>
        <Title>Qué agente encaja</Title>
        <Split>
          <Panel
            tone="in"
            heading="Encaja"
            items={[
              "Explicar una transacción",
              "Analizar una wallet o un contrato",
              "Resumir, traducir, auditar",
              "Investigar y redactar un informe",
            ]}
            footer={
              <>
                Entregan <strong className="text-white/70">un texto</strong> que
                el comprador puede juzgar.
              </>
            }
          />
          <Panel
            tone="out"
            heading="No encaja"
            items={[
              "Ejecutar órdenes de trading",
              "Mover fondos de terceros",
              "Cualquier cosa que firme por vos",
            ]}
            footer={
              <>
                La arquitectura{" "}
                <strong className="text-white/70">lo impide a propósito</strong>
                : el modelo no tiene ninguna herramienta que escriba en la
                cadena.
              </>
            }
          />
        </Split>
      </>
    ),
  },
  {
    section: "Qué queda afuera",
    eyebrow: "Parte 2 · La pregunta que siempre aparece",
    body: (
      <>
        <Title>“¿Y si hago uno que opere?”</Title>
        <Lede>
          Se puede vender <strong>análisis</strong> de trading. No se puede
          vender <strong>ejecución</strong>. Y no es una cuestión de criterio.
        </Lede>
        <Bullets
          items={[
            <>
              El modelo cobra por <em>entregar un trabajo</em>: hay un
              entregable que se evalúa y una ventana de disputa. Una orden
              ejecutada no tiene eso
            </>,
            <>
              La wallet del agente es la que <em>cobra</em>. Mezclarla con una
              tesorería que opera junta la clave comercial con el capital de
              riesgo
            </>,
          ]}
        />
        <Note tag="La versión que sí funciona">
          “Analizá este par y entregame una tesis con niveles y riesgos.” Texto,
          verificable, sin tocar fondos.
        </Note>
      </>
    ),
  },
  {
    section: "Cómo seguir",
    eyebrow: "Parte 3 · Después del workshop",
    body: (
      <>
        <Title>Cómo seguir solo</Title>
        <Steps
          items={[
            "Conseguí gas de testnet si querés cerrar el ciclo económico",
            "Probalo con una segunda wallet actuando de compradora",
            <>
              Configurá storage durable: <Code>kind = &quot;ipfs&quot;</Code> y
              su endpoint
            </>,
            "Iniciá sesión en la plataforma y corré el chequeo de pre-deploy",
            "Desplegá al trial de 48 horas y verificá que responde",
          ]}
        />
        <Lede>
          Recién después tiene sentido pensar en mainnet — con una wallet nueva,
          nunca la del workshop.
        </Lede>
      </>
    ),
  },
  {
    section: "Cómo seguir",
    eyebrow: "Parte 3 · Lo que te va a pasar",
    body: (
      <>
        <Title>Trampas conocidas</Title>
        <Bullets
          items={[
            <>
              <strong className="text-white">Python 3.9 no alcanza.</strong>{" "}
              Hace falta 3.10 o más. Es la falla de arranque más común
            </>,
            <>
              <strong className="text-white">
                El puerto 9000 puede estar ocupado
              </strong>{" "}
              si ya tenés otro agente corriendo. Levantalo en otro puerto
            </>,
            <>
              <strong className="text-white">
                El modelo gratis tiene tope diario.
              </strong>{" "}
              Se agota con pocas corridas, y no es tu código
            </>,
            <>
              <strong className="text-white">
                Algunas herramientas de lectura fallan en testnet.
              </strong>{" "}
              Verificá antes de dárselas al modelo
            </>,
          ]}
        />
        <Note tag="Regla general" tone="warn">
          Si una herramienta devuelve datos crudos sin decodificar,{" "}
          <strong>decodificalos en código</strong> antes de pasárselos al
          modelo. Los va a leer mal.
        </Note>
      </>
    ),
  },
  {
    section: "Cierre",
    eyebrow: "Cierre",
    body: (
      <>
        <Title>Lo que te llevás</Title>
        <Bullets
          items={[
            <>
              Un agente que <strong>cotiza y firma</strong> con su propia
              identidad on-chain
            </>,
            <>
              Una forma de <strong>probarlo sin plata</strong>, hoy, en tu
              máquina
            </>,
            <>Y el motivo por el que la plata nunca pasa por el modelo</>,
          ]}
        />
        <div className="h-px w-full bg-line" />
        <Lede>
          El agente ya es un vendedor. Lo que falta es publicarlo — y eso ahora
          sabés exactamente cómo hacerlo.
        </Lede>
      </>
    ),
  },
];

/* ---------- deck ---------------------------------------------------------- */

/* The URL hash IS the state: deep links work, the back button works, and there
   is no effect syncing two sources of truth against each other. */
function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function indexFromHash(hash: string) {
  const n = parseInt(hash.slice(1), 10);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(slides.length - 1, n - 1));
}

export function SlideDeck() {
  const hash = useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash,
    () => "",
  );
  const index = indexFromHash(hash);
  const touchStart = useRef<number | null>(null);

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, next));
    window.location.hash = String(clamped + 1);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const current = indexFromHash(window.location.hash);
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        go(current + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(current - 1);
      } else if (e.key === " ") {
        e.preventDefault();
        go(current + (e.shiftKey ? -1 : 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(slides.length - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const slide = slides[index];

  return (
    <div className="flex min-h-screen flex-col">
      {/* progress */}
      <div className="fixed inset-x-0 top-0 z-30 h-0.5 bg-line/60">
        <div
          className="h-full bg-bnb transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${((index + 1) / slides.length) * 100}%` }}
        />
      </div>

      <main
        className="flex flex-1 flex-col justify-center overflow-y-auto px-5 pb-24 pt-14 sm:px-8 lg:px-12"
        onTouchStart={(e) => {
          touchStart.current = e.changedTouches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStart.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(dx) > 55) go(index + (dx < 0 ? 1 : -1));
          touchStart.current = null;
        }}
      >
        <section
          key={index}
          className="mx-auto flex w-full max-w-5xl flex-col gap-6 motion-safe:animate-[rise_.35s_cubic-bezier(.22,.68,.4,1)]"
        >
          <Eyebrow>{slide.eyebrow}</Eyebrow>
          {slide.body}
        </section>
      </main>

      {/* chrome */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-line bg-ink/85 px-4 py-2.5 backdrop-blur sm:px-6">
        <span className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-white/35">
          {slide.section}
        </span>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Slide anterior"
            className="rounded border border-line px-2.5 py-1.5 font-mono text-xs text-white/60 transition-colors hover:border-bnb hover:text-bnb focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bnb disabled:opacity-30 disabled:hover:border-line disabled:hover:text-white/60"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === slides.length - 1}
            aria-label="Slide siguiente"
            className="rounded border border-line px-2.5 py-1.5 font-mono text-xs text-white/60 transition-colors hover:border-bnb hover:text-bnb focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bnb disabled:opacity-30 disabled:hover:border-line disabled:hover:text-white/60"
          >
            →
          </button>
          <span className="ml-1 min-w-[3.5ch] text-right font-mono text-[11px] tabular-nums text-white/35">
            <span className="text-white">{index + 1}</span>/{slides.length}
          </span>
        </div>
      </div>
    </div>
  );
}
