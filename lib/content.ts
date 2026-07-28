export const SITE_URL = "https://bnb-workshop-red.vercel.app";

export const workshop = {
  eyebrow: "BNB Chain · Workshop",
  title: "AI Agents on Chain",
  lede: "Build and deploy autonomous, self-funding AI agents that live on BNB Smart Chain — from a single prompt.",
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
  label: "2 · Tell your agent what to build",
  hint: "Restart your assistant first. Edit the name and the job — the skill asks for anything it still needs.",
  value:
    'Use the create-bnb-agent skill to create a workshop seller agent named "TxExplainer" that explains what a BNB Chain transaction did in plain English.',
};

export const claudeCodeAlt = {
  marketplace: `/plugin marketplace add ${"https://github.com/Gastonfoncea/bnb-workshop.git"}`,
  install: "/plugin install create-bnb-agent@bnb-workshop",
};

export const steps = [
  {
    n: "01",
    title: "Describe it",
    body: "One prompt is the whole spec. Say what your agent does and what it returns — the skill picks safe workshop defaults.",
  },
  {
    n: "02",
    title: "Scaffold it",
    body: "A seller agent on BSC Testnet with a disposable wallet, Pieverse LLM and a signed quote path, wired up for you.",
  },
  {
    n: "03",
    title: "Run it locally",
    body: "Diagnostics, a local A2A endpoint and a signed-quote smoke test. It always stops before deployment.",
  },
];
