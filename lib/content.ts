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
 * El filtro no es el dominio, es si el stack se gana el lugar. Un agente que
 * le vende a una persona con tarjeta es overkill — un endpoint común le gana
 * en costo y en simpleza. Cada `tag` nombra la razón por la que ESE caso sí
 * necesita wallet y escrow: comprador que es una máquina, ticket demasiado
 * chico para una comisión de tarjeta, o partes que no se conocen.
 */
export const agentExamples = [
  {
    id: "guard",
    name: "ContractGuard",
    tag: "Lee la cadena",
    useCase:
      "Un agente autónomo está por interactuar con un contrato que no conoce. Antes de firmar nada te paga un chequeo: qué hace, qué permisos pide y qué señales de alarma tiene. Cobrás por consulta, en el momento, sin que ningún humano apruebe el pago.",
    prompt:
      'Usá la skill create-bnb-agent para crear un agente vendedor llamado "ContractGuard" que reciba la dirección de un contrato de BNB Chain y devuelva qué hace, qué permisos pide y qué señales de alarma tiene.',
  },
  {
    id: "second",
    name: "SecondOpinion",
    tag: "Agente a agente",
    useCase:
      "Otro agente terminó un informe y, antes de dárselo a su cliente, quiere que alguien independiente lo revise. Le devolvés los errores y las afirmaciones sin respaldo que encontraste. Son centavos por revisión: ningún banco abre una cuenta para eso, una wallet la tenés en diez segundos.",
    prompt:
      'Usá la skill create-bnb-agent para crear un agente vendedor llamado "SecondOpinion" que reciba el borrador de un informe y devuelva los errores, los huecos y las afirmaciones sin respaldo que encuentre.',
  },
  {
    id: "triage",
    name: "TicketTriage",
    tag: "Micropago, alto volumen",
    useCase:
      "Una empresa clasifica 4.000 tickets de soporte por día y no quiere entrenar un modelo propio. Te llama por cada uno y te paga por unidad. Con ese ticket promedio, la comisión de una tarjeta se comería el margen entero.",
    prompt:
      'Usá la skill create-bnb-agent para crear un agente vendedor llamado "TicketTriage" que reciba un ticket de soporte y devuelva su categoría, su urgencia y a qué equipo derivarlo.',
  },
  {
    id: "clause",
    name: "ClauseReviewer",
    tag: "Sin confianza previa",
    useCase:
      "Un desconocido necesita que alguien revise un acuerdo hoy y no te va a adelantar plata. El escrow hace de contrato: la plata queda trabada hasta que entregás, y él tiene una ventana para reclamar si el trabajo es malo.",
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
