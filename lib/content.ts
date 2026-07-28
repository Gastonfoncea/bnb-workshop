export const workshop = {
  eyebrow: "BNB Chain · Workshop",
  title: "AI Agents on Chain",
  lede: "Build and deploy autonomous, self-funding AI agents that live on BNB Smart Chain — from a single prompt.",
};

/**
 * The two links attendees copy during the workshop.
 * TODO: replace `value` with the real URLs.
 */
export const copyLinks = [
  {
    id: "repo",
    label: "Workshop repo",
    hint: "Clone this to follow along.",
    value: "https://github.com/Gastonfoncea/bnb-workshop",
  },
  {
    id: "slides",
    label: "Slides & resources",
    hint: "Deck, links and reference material.",
    value: "https://example.com/replace-me",
  },
];

export const steps = [
  {
    n: "01",
    title: "Describe it",
    body: "One prompt is the whole spec. Say what the agent should do and what it charges per job.",
  },
  {
    n: "02",
    title: "Scaffold it",
    body: "Get a working seller agent with its identity, tools and pricing wired up out of the box.",
  },
  {
    n: "03",
    title: "Ship it on chain",
    body: "Register on BNB Smart Chain, take payments per job, and let it fund itself.",
  },
];
