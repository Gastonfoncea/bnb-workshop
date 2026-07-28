export const workshop = {
  eyebrow: "BNB Chain · Workshop",
  title: "AI Agents on Chain",
  lede: "Build and deploy autonomous, self-funding AI agents that live on BNB Smart Chain — from a single prompt.",
};

/**
 * The two commands attendees paste into Claude Code to install the workshop
 * skill. Both are plain text, so the copy button works the same as for a URL.
 */
export const copyLinks = [
  {
    id: "marketplace",
    label: "1 · Add the workshop marketplace",
    hint: "Paste into Claude Code.",
    value: "/plugin marketplace add Gastonfoncea/bnb-workshop",
  },
  {
    id: "install",
    label: "2 · Install the skill",
    hint: "Then run /reload-plugins to activate it.",
    value: "/plugin install create-bnb-agent@bnb-workshop",
  },
];

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
