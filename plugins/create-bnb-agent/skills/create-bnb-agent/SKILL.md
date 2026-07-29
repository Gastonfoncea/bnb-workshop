---
name: create-bnb-agent
description: Create and locally validate a BNB Agent Studio workshop seller agent from a name and function. Use when a participant asks to create, scaffold, or build an on-chain BNB agent for the workshop. Installs missing prerequisites when safely possible, creates a disposable testnet wallet, activates Pieverse, implements the work hook, smoke-tests both the protocol and the product, then offers a keep-it-local or publish-it choice and never deploys without one.
---

# Create BNB Workshop Agent

Create a re-entrant BSC Testnet seller agent. Ask only for missing intake data,
then proceed autonomously to a working local agent. Deploy only when the
participant picks it at the phase-8 fork.

## Fixed workshop choices

- Price: `0.1 U` (`100000000000000000` wei).
- Price bounds: min `0`, max `100000000000000000`.
- Network: `bsc-testnet`. Never mainnet.
- Protocol: `A2A`.
- Framework/runtime: Google ADK on AWS AgentCore.
- LLM: Pieverse `auto/free`, zero initial allocation.
- Wallet: disposable `evm-local`.
- Storage: `local` while building — `ipfs` only if they choose to publish.
- Destination: managed `platform` 48-hour testnet trial.

Gas rule for this path: scaffolding, quoting, signing, the product smoke test,
and the platform deploy all cost nothing. The only command here that spends gas
is `bag erc8004 register` (~0.002 tBNB). Say this once rather than hedging about
funding at every step.

## Intake

Ask one question at a time:

1. What is the agent name?
2. What does it do, and what exact deliverable does it return?

Do not ask for price, network, wallet, model, protocol, storage, runtime, or
destination. State the sanitized AgentCore name if it differs from the answer.

## Teaching mode

This runs in a workshop. The participant should be able to repeat every step
alone a week later, so a command they never saw is a command they cannot rerun.
Show the `bag` command you are about to run, say in one line what it is for, and
after it returns say what the output means — not that it succeeded.

Which commands you run, and which they run, follows from what the command does:

- **Read-only** (`bag deploy info`, `bag platform agents`, `bag platform credit`,
  `bag erc8004 show`, `bag wallet balance`, `bag doctor`): run them yourself and
  narrate. Never just report "OK" — read the relevant field out loud.
- **Interactive** (`bag platform login`): you cannot run it for them. It needs
  their browser and their GitHub account. Give the command, explain what they
  are authorizing, and wait.
- **Spends gas, or is irreversible** (`bag deploy agent`, `bag erc8004 register`,
  `bag platform invoke-client new`): explain the cost or consequence first, ask,
  and only then run it.

Explain a concept the first time its command appears, not before. A participant
who has not deployed yet has no use for what an invoke client is.

## Safety invariants

- Never deploy or register ERC-8004 until the participant has explicitly chosen
  to publish at the phase-8 fork. Never change to mainnet at all.
- Before any deploy, state plainly that the wallet's key is transmitted to the
  operator, and that this is why the workshop wallet is disposable.
- Never print a private key or `WALLET_PASSWORD`. Never echo back the Pinata JWT.
  The buyer `client_secret` is shown once by the CLI that mints it — tell them to
  save it at that moment, and never repeat it afterwards.
- Never say a published agent is reachable by anyone. Publishing makes it
  discoverable, not callable: reaching it requires credentials the participant
  hands out themselves.
- Keep `.studio/wallets/` at the workspace root and outside `app/agent/`.
- Store the generated testnet password only in `.studio/.env.local`; ensure
  `.studio/` is gitignored and never package it.
- Never regenerate a password for an existing keystore.
- Never reuse this disposable wallet for mainnet.
- Signing stays in fixed `app/agent/signing.py`; never expose signing, transfer,
  or chain writes to the LLM.
- Pricing remains deterministic fixed code. The LLM never chooses money.
- Do not widen signing domains, primary types, or x402 allowed hosts.
- Preserve an existing user-owned `run_work` implementation. If the function is
  already customized, report it and do not overwrite it.

## Deterministic helper

Resolve `scripts/workshop_setup.py` relative to this `SKILL.md`. Use the same
Python 3.10+ interpreter throughout.

Run:

```text
python <skill>/scripts/workshop_setup.py preflight
```

Read its JSON. Install missing prerequisites automatically when no administrator
password is needed:

- `bnbagent-studio`: use an isolated/user-level Python installation.
- AgentCore: `npm install -g @aws/agentcore`.
- Node/Python: use the detected package manager.

On Windows invoke `agentcore.cmd`, not the unsigned PowerShell wrapper. After an
install, rerun preflight. If an OS installation needs administrator approval,
stop with one exact command and say to rerun this skill afterward.

## Phase machine

Inspect before every mutation. Re-running must resume, not start over.

### 1. Scaffold

From the intended parent directory, obtain the helper's command list:

```text
python <skill>/scripts/workshop_setup.py commands --name "<agent name>"
```

If the sanitized project directory does not exist, run its `bag init` argument
array. It must include:

```text
--network bsc-testnet
--llm-provider pieverse-llm
--storage-provider local
--wallet-kind evm-local
--destination platform
--no-onboard
```

Never use shell interpolation for the participant's name.

### 2. Password and wallet

From the generated workspace root:

```text
python <skill>/scripts/workshop_setup.py ensure-secret --project-root .
python <skill>/scripts/workshop_setup.py state --project-root .
```

Load `WALLET_PASSWORD` into only the current child-process environment without
printing it. If there is no keystore, run `bag wallet new`. Never pass passwords
or private keys on argv. Obtain and report only the public address.

If a keystore exists but its password is unavailable, stop. Never replace it.

### 3. Pieverse

If `app/agent/studio.toml` lacks `[llm.pieverse].key_hash`, run:

```text
bag llm activate
```

Use zero initial allocation. If a browser/device action is unavoidable, report
that single checkpoint and the exact resume instruction.

### 4. Configure the seller

Set in `app/agent/studio.toml`:

```toml
[payments.erc8183]
price = "100000000000000000"
min_price = "0"
max_price = "100000000000000000"
```

Implement the participant's function only in the developer `run_work` hook in
`app/agent/seller_core.py`:

- Text tasks: a focused LLM prompt returning the requested deliverable.
- Chain analysis: use only existing read-only chain tools.
- External API: add at most one read-only tool and checkpoint for its API key.

Update A2A skill descriptions in `app/agent/agent_card.py`. Do not modify
`signing.py` or add paid public skills.

### 5. Diagnose and run

Load the password into the child environment, then run:

```text
bag doctor
bag dev
```

Fix deterministic local failures. Do not bypass security or storage checks.
Wait for `GET http://127.0.0.1:9000/ping`.

If port 9000 is already taken, another agent from an earlier session owns it —
verify with the agent card whose it is, leave it running, and start this one on
another port (`bag dev --port 9010`). Use that port for the rest of the checks
so a passing smoke test can never be another agent answering.

### 6. Smoke-test A2A

Send `message/send` with a DataPart:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "messageId": "workshop-negotiate-1",
      "parts": [{
        "kind": "data",
        "data": {
          "skill": "negotiate",
          "task_description": "Workshop readiness test",
          "terms": {
            "deliverables": "A short test response",
            "quality_standards": "Valid non-empty text"
          }
        }
      }]
    }
  }
}
```

Require a successful response containing the configured price and a non-empty
provider signature. This quote path needs no LLM funds.

### 6b. Smoke-test the product

The A2A test above proves the protocol. It proves nothing about whether the
agent does its job. Run the work hook too, so the participant sees their own
deliverable before any funding exists:

```text
python <skill>/scripts/product_smoke_test.py --project-root . \
  --task "<a concrete request for this agent, in its own domain>"
```

Choose a `--task` that exercises the participant's actual function, with real
input where the function needs one. Report the deliverable.

Exit codes: `0` deliverable produced, `1` setup problem, `2` the free model's
daily request cap is spent. On `2`, say plainly that the hook is built correctly
and the cap resets — it is not a defect in their agent.

Judge the deliverable, do not just confirm it is non-empty. Verify every number
it prints against the chain data it came from. A language model routinely
misscales integer arithmetic (wei to whole tokens is the common failure), so any
figure the model computed itself is suspect. If the work hook lets the LLM do
arithmetic on money or token amounts, move that computation into fixed code in
`seller_core.py` and pass the resolved values into the prompt.

### 7. Funding check — report, do not block

Check the public wallet's BSC Testnet balance and report it. Gas is NOT required
to finish this skill: everything up to here — quoting, signing, and the product
smoke test — works with an empty wallet.

If there is no gas, say what it unlocks rather than stopping:

- Name the thing they need — testnet BNB for gas — and be exact about where it
  bites on this path: **only `bag erc8004 register`**, which needs about
  0.002 tBNB. Deploying to the platform trial costs no gas at all.
- Explain that gas otherwise only matters for on-chain commerce: escrow,
  delivery, and settlement.
- Continue to phase 8 regardless.

Be honest about the faucet, because it is the step most likely to strand them:

- The official tap is <https://testnet.bnbchain.org/faucet-smart>, but it only
  releases tBNB to an address whose owner holds **0.002 BNB on BSC mainnet**.
  Someone with no real BNB cannot use it. Say this up front instead of sending
  them to a form that will reject them.
- If they are at a live workshop, the organizer may be distributing tBNB — tell
  them to ask before fighting the faucet.
- Testnet `U` is a different token with a different tap:
  <https://united-coin-u.github.io/u-faucet/>. That one matters for the BUYER,
  not for this agent.

Be precise about who pays what, because the `U` balance warning in `bag doctor`
reads as if the seller needs `U` to trade. It does not:

- This agent is the SELLER. It only ever spends gas (submit, and settle if the
  operator runs it). It never needs `U` to earn — it RECEIVES `U` when a job
  completes.
- The escrow is funded by the BUYER, in `U`. `create_job` / `set_budget` /
  `fund` are all client-side calls.
- So testing the full economic loop alone needs a SECOND wallet holding `U` to
  act as the buyer. The seller's own wallet needs nothing but gas.

The `U` figure `bag doctor` warns about is for optional paid LLM credits, not
for selling — and on `auto/free` with auto-topup disabled it is not needed.

### 8. The fork: keep it local, or publish

The agent is built and tested. Ask ONE question, then stop and wait:

> **Do you want to keep this local, or publish it?**
>
> **Local** — you can run it, get signed quotes, and see the deliverable it
> produces. Nobody else can reach it or buy from it. Nothing more to set up.
>
> **Publish** — it goes live for 48 hours at a public URL, and you decide who
> gets to call it. You'll need three things: a Pinata API key (free, ~5
> minutes), a GitHub account for the platform, and — only if you also want it
> listed on-chain — a little testnet gas.

Do not deploy on your own initiative. Do not ask this question earlier — storage
is two config values and is trivially changed after the fact, so there is no
reason to make them decide before they have something that works.

**If they choose local**, finish here. State what they can already do, and that
publishing later is this same fork plus a Pinata key and a GitHub login.

**If they choose publish**, walk them through 8a–8f below. Do not make them
research IPFS or OAuth — only the Pinata key and the GitHub login are theirs to
fetch; write and run the rest yourself, narrating as described in Teaching mode.

### 8a. Storage — Pinata

Explain it in one sentence before touching anything: deliverables live off-chain
and only their hash goes on-chain, so a published agent needs somewhere the
buyer can actually read them from. `local` writes to a disk only this container
sees, which is why publishing on `local` is blocked rather than merely
discouraged.

Then ask them for a Pinata JWT and wait. Give the exact path, including the
permissions, because the default new-key dialog does not grant what is needed:

> pinata.cloud → API Keys → New Key → enable **`pinJSONToIPFS`** under the
> Pinata API / Pinning scopes → name it → Create. Copy the **JWT** (not the
> API Key or the API Secret). It is shown once.

`pinJSONToIPFS` is the only scope this agent uses — it posts a JSON pin envelope
to the legacy pinning endpoint. `pinFileToIPFS` is not needed on this path.

When they paste it, have them put it in `.studio/.env.local` at the workspace
root — the same file that already holds `WALLET_PASSWORD`. Showing them the file
is the point: they should leave knowing where their secrets live. Three lines,
of which only the first is theirs:

```text
STORAGE_API_KEY=<their JWT>
STORAGE_API_URL=https://api.pinata.cloud/pinning/pinJSONToIPFS
STORAGE_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
```

Never echo the JWT back. Then set `[storage].kind = "ipfs"` in
`app/agent/studio.toml`.

### 8b. Platform login

They must run this one themselves — it opens a GitHub device flow that needs
their browser:

```text
bag platform login
```

Explain what it is for before they run it: the managed platform is what hosts
the agent for the trial, and the login is how it knows whose account the agent
belongs to. It prints a code and a URL; they open the URL, paste the code, and
approve. Then confirm it took:

```text
bag platform whoami
```

Tell them the part that is not obvious: **the 48-hour trial is per GitHub
account.** If they burn this one, logging in with a different account starts a
fresh trial.

### 8c. Deploy

```text
bag deploy prepare
```

Read its output with them and fix what it reports. It is a readiness sweep, not
a deploy — nothing has happened yet. Then, after saying plainly that this is the
step that ships their agent and starts the 48-hour clock, deploy.

### 8d. Confirm it is actually deployed

Do not stop at "the deploy command exited 0". Run these and narrate each:

```text
bag deploy info        # the buyer-facing surface: URL, agent id, token endpoint, scope
bag platform agents    # it now shows up on their account
bag platform credit    # how much of the 48 hours is left
```

`bag deploy info` is the one that matters — it prints the A2A card URL under
`/v1/rt/<agentId>/.well-known/agent-card.json`, the invoke endpoint at
`/v1/rt/<agentId>/a2a`, the token endpoint, and the scope `invoke:<agentId>`.
That is what a buyer needs. If something looks wrong, `bag deploy logs`.

Do NOT run `bag deploy status` here. It inspects AWS AgentCore runtimes for
self-deployed agents and reports nothing useful for a `platform` destination —
running it would teach them a command that will mislead them later.

### 8e. Who can call it

This is the step participants most often assume away, so state it before
offering the command: the platform publishes the agent behind OAuth2
client-credentials. Being deployed does not make it callable by strangers. A
buyer needs a `client_id` and `client_secret` that the participant mints and
hands over deliberately.

Offer to mint one. Warn first that the secret is printed exactly once, so they
must copy it the moment it appears:

```text
bag platform invoke-client new
```

Then tell them the four things a buyer needs, which they can re-read any time
with `bag deploy info`: the card URL, the A2A invoke URL, the token endpoint
(`/v1/oauth/token`, client-credentials), and the scope `invoke:<agentId>`. They
can list and revoke with `bag platform invoke-client list` / `revoke`.

### 8f. ERC-8004 — optional, and only after deploying

Offer it, explain it, and only run it if they say yes. It costs about
0.002 tBNB, so skip it without ceremony if the wallet is empty — the deployed
agent works either way.

What it does: writes their agent's name, description, protocol and endpoint into
the ERC-8004 registry at `0x8004A818BFB912233c491871b3d84c89A494BD9e` on BSC
Testnet, and assigns them an `agent_id`. It has to run **after** the deploy,
because what gets registered is the live endpoint.

Be precise about what registering buys them, since the word "discoverable" does
a lot of hidden work: someone reading the registry can now find their agent and
its card. They still cannot call it without credentials from 8e. Registration is
the listing; the invoke client is the key.

Then show them how to verify it landed on-chain — this answers "is my agent
really on-chain?" better than any explanation:

```text
bag erc8004 show          # their record, including the agent_id they were assigned
bag audit tail            # the transaction that wrote it
```

`bag erc8004 resolve <agent_id>` goes from an id back to the agent URI, which is
how a buyer walks the same path in reverse. The registry contract is also
viewable on BscScan if they want to see it outside the CLI.

### After publishing

Tell them plainly: at 48 hours the agent and its data are deleted and are not
recoverable; the clock started at the deploy, not at the login. And being live
is not the same as being paid — a buyer still has to fund a job in `U`.

## Final report

End with compact bullets:

- Agent name and sanitized runtime name.
- Function and deliverable.
- Price/bounds.
- Network, protocol, framework, runtime.
- Wallet kind and public address.
- LLM provider/model and activation state.
- Storage kind, and what it implies: `local` means only this machine can read
  the deliverables, so it is fine to build on and impossible to publish with.
- Dependency status.
- Local endpoint and health/quote smoke-test results.
- Product smoke-test result: the deliverable the agent actually produced, and
  any figure in it that failed verification against chain data.
- Gas balance, and that escrow is paid in `U` rather than BNB.
- Current readiness and exact next action.
- Change later: price/model/storage/network/destination file or command.

If they published, also report:

- The buyer-facing card and invoke URLs, and the `agent_id` from `bag deploy
  info`.
- When the trial expires, and that the agent and its data go with it.
- Whether a buyer invoke client was minted, and that without one nobody outside
  can call the agent.
- Whether ERC-8004 was registered and, if so, the on-chain `agent_id`.

If they kept it local, state in one line what publishing later would take.

Then add only these informational mainnet bullets:

- Create a new production wallet; never reuse the workshop wallet.
- Switch to `bsc-mainnet`. It is a different registry and different commerce
  contracts, so the testnet `agent_id` does not carry over — registering again
  is a new listing.
- There is no 48-hour trial on mainnet. Hosting becomes a self-deploy to their
  own AWS, which means AWS costs and a Cognito authorizer to let buyers in.
- `U` stops being play money. Note that trusted x402 merchants settle in
  **mainnet** `U` even from a testnet project.
- Fund real BNB for gas, pay for durable storage, and budget paid LLM credits if
  the free model is not enough.
- Review price bounds and signing policy before anything can quote for real
  money.
- Run `bag deploy prepare`, then deploy and verify only after an explicit
  production decision.

