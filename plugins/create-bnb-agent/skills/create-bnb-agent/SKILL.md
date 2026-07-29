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

## Intake

Ask one question at a time:

1. What is the agent name?
2. What does it do, and what exact deliverable does it return?

Do not ask for price, network, wallet, model, protocol, storage, runtime, or
destination. State the sanitized AgentCore name if it differs from the answer.

## Safety invariants

- Never deploy or register ERC-8004 until the participant has explicitly chosen
  to publish at the phase-8 fork. Never change to mainnet at all.
- Before any deploy, state plainly that the wallet's key is transmitted to the
  operator, and that this is why the workshop wallet is disposable.
- Never print a private key or `WALLET_PASSWORD`.
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

- Show the public address and the BNB Testnet faucet.
- Explain that gas only matters for on-chain actions: escrow, delivery, and
  publishing.
- Continue to phase 8 regardless.

Mention that the escrow itself is paid in the payment token (`U`), not in BNB —
BNB is only gas. A buyer needs `U` before any job can be funded.

### 8. The fork: keep it local, or publish

The agent is built and tested. Ask ONE question, then stop and wait:

> **Do you want to keep this local, or publish it?**
>
> **Local** — you can run it, get signed quotes, and see the deliverable it
> produces. Nobody else can reach it or buy from it. Nothing more to set up.
>
> **Publish** — it goes live for 48 hours and anyone can hire it. You'll need
> three things: a Pinata API key (free, ~5 minutes), testnet gas, and a
> platform account.

Do not deploy on your own initiative. Do not ask this question earlier — storage
is two config values and is trivially changed after the fact, so there is no
reason to make them decide before they have something that works.

**If they choose local**, finish here. State what they can already do, and that
publishing later is this same fork plus a Pinata key.

**If they choose publish**, walk them through it. Do not make them research IPFS
— only the key is theirs to fetch; write the rest yourself:

1. Explain Pinata in one sentence: deliverables live off-chain and only their
   hash goes on-chain, so a published agent needs somewhere the buyer can
   actually read them from. `local` writes to a disk only this container sees.
2. Ask them for a Pinata JWT (pinata.cloud → API Keys). Wait for it.
3. Write to `.studio/.env.local` — never echo the key back:
   - `STORAGE_API_KEY=<their JWT>`
   - `STORAGE_API_URL=https://api.pinata.cloud/pinning/pinJSONToIPFS`
   - `STORAGE_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/`
4. Set `[storage].kind = "ipfs"` in `app/agent/studio.toml`.
5. Have them sign in to the platform, then run `bag deploy prepare` and fix what
   it reports.
6. Deploy, then verify the endpoint answers.

Registering ERC-8004 is optional and makes the agent discoverable on-chain.
Offer it, note that it costs gas, and only run it if they say yes.

After deploying, tell them plainly: the trial is reclaimed at 48 hours, and a
buyer still needs `U` to fund a job — being live is not the same as being paid.

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

If they published, also report the live endpoint, that the trial expires in 48
hours, and whether ERC-8004 was registered. If they kept it local, state in one
line what publishing later would take.

Then add only these informational mainnet bullets:

- Create a new production wallet; never reuse the workshop wallet.
- Switch to `bsc-mainnet` and configure durable storage.
- Fund real BNB for gas and paid LLM credits if needed.
- Review price bounds, signing policy, OAuth, and production infrastructure.
- Run `bag deploy prepare`, then deploy and verify only after an explicit
  production decision.

