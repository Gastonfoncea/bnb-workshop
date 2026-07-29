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

/**
 * Ideas para quien no sabe qué pedir. Cada una es la frase que se copia tal
 * cual: elegir una card y pegarla es todo el trabajo de arranque.
 *
 * La proporción es deliberada — una sola usa la cadena. El resto son dominios
 * cualquiera, porque lo que BNB Chain aporta acá es el cobro y la identidad,
 * no el tema del trabajo. Cuatro variantes de análisis on-chain contarían la
 * historia más chica.
 */
export const agentExamples = [
  {
    id: "tx",
    name: "TxExplainer",
    tag: "Lee la cadena",
    useCase:
      "Alguien ve un movimiento raro en su wallet y no entiende qué firmó. Le pasa el hash y el agente le devuelve, en castellano, qué contrato intervino, qué se movió y qué permisos quedaron abiertos.",
    prompt:
      'Usá la skill create-bnb-agent para crear un agente vendedor llamado "TxExplainer" que reciba el hash de una transacción de BNB Chain y explique en lenguaje simple qué hizo.',
  },
  {
    id: "stack",
    name: "StackTraceExplainer",
    tag: "Sólo texto",
    useCase:
      "Un dev se come un error que no dice nada útil. Pega el stack trace y el agente le devuelve la causa probable, la línea sospechosa y qué conviene chequear primero. Sirve para cualquier lenguaje.",
    prompt:
      'Usá la skill create-bnb-agent para crear un agente vendedor llamado "StackTraceExplainer" que reciba un stack trace de cualquier lenguaje y devuelva la causa probable y qué chequear primero.',
  },
  {
    id: "reviews",
    name: "ReviewMiner",
    tag: "Devuelve JSON",
    useCase:
      "Un e-commerce junta 400 reseñas y nadie las lee. El agente las procesa y devuelve JSON con los temas que se repiten y cuántas veces aparece cada uno — pensado para que lo consuma otro programa, no una persona.",
    prompt:
      'Usá la skill create-bnb-agent para crear un agente vendedor llamado "ReviewMiner" que reciba un montón de reseñas en crudo y devuelva JSON con los temas recurrentes y su frecuencia.',
  },
  {
    id: "clause",
    name: "ClauseReviewer",
    tag: "Sólo texto",
    useCase:
      "Te pasan un contrato de alquiler o un acuerdo de servicio y lo ibas a firmar sin leerlo entero. El agente marca las cláusulas que conviene mirar dos veces y explica por qué cada una.",
    prompt:
      'Usá la skill create-bnb-agent para crear un agente vendedor llamado "ClauseReviewer" que reciba el texto de un contrato y señale las cláusulas que conviene revisar antes de firmar, explicando por qué.',
  },
];

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
