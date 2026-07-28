export const SITE_URL = "https://bnb-workshop-red.vercel.app";

export const workshop = {
  eyebrow: "BNB Chain · Workshop",
  title: "Agentes de IA on-chain",
  lede: "Construí y desplegá agentes autónomos que viven en BNB Smart Chain, cobran por su trabajo y se financian solos — a partir de una sola frase.",
};

/**
 * Step 1 — install. One command per platform; the script auto-detects Claude
 * Code, Codex and Cursor and installs into whichever it finds.
 */
export const installCommands = [
  {
    id: "posix",
    os: "macOS / Linux",
    value: `curl -fsSL ${SITE_URL}/install.sh | sh`,
  },
  {
    id: "windows",
    os: "Windows",
    value: `irm ${SITE_URL}/install.ps1 | iex`,
  },
];

/**
 * Step 2 — what to say to the assistant once the skill is installed. The skill
 * only needs a name and a function; it asks for whatever is missing and picks
 * every other setting itself.
 */
export const agentPrompt = {
  label: "2 · Decile qué agente querés",
  hint: "Reiniciá tu asistente primero. Cambiá el nombre y la función — la skill te pregunta lo que le falte.",
  value:
    'Usá la skill create-bnb-agent para crear un agente vendedor llamado "TxExplainer" que explique qué hizo una transacción de BNB Chain en lenguaje simple.',
};

export const claudeCodeAlt = {
  marketplace: `/plugin marketplace add ${"https://github.com/Gastonfoncea/bnb-workshop.git"}`,
  install: "/plugin install create-bnb-agent@bnb-workshop",
};

export const steps = [
  {
    n: "01",
    title: "Describilo",
    body: "Una frase es toda la especificación. Decí qué hace tu agente y qué entrega — la skill elige el resto de la configuración.",
  },
  {
    n: "02",
    title: "Se arma solo",
    body: "Un agente vendedor sobre BSC Testnet, con wallet descartable, LLM activado y su cotización firmada, todo cableado.",
  },
  {
    n: "03",
    title: "Probalo local",
    body: "Diagnóstico, endpoint A2A y una prueba del producto que entrega. Siempre frena antes de desplegar.",
  },
];
