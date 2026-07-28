---
name: create-bnb-agent
description: Create and locally validate a BNB Agent Studio workshop seller agent from a name and function. Use when a participant asks to create, scaffold, or build an on-chain BNB agent for the workshop. Installs missing prerequisites when safely possible, creates a disposable testnet wallet, activates Pieverse, implements the work hook, smoke-tests A2A, pauses for faucet funding, and always stops before deployment.
---

# Create BNB Workshop Agent

Create a re-entrant BSC Testnet seller agent. Ask only for missing intake data,
then proceed autonomously. Never deploy.

## Fixed workshop choices

- Price: `0.1 U` (`100000000000000000` wei).
- Price bounds: min `0`, max `100000000000000000`.
- Network: `bsc-testnet`.
- Protocol: `A2A`.
- Framework/runtime: Google ADK on AWS AgentCore.
- LLM: Pieverse `auto/free`, zero initial allocation.
- Wallet: disposable `evm-local`.
- Storage: `local` (not durable across runtime restarts).
- Future destination: managed `platform` 48-hour testnet trial.

## Intake

Ask one question at a time:

1. What is the agent name?
2. What does it do, and what exact deliverable does it return?

Do not ask for price, network, wallet, model, protocol, storage, runtime, or
destination. State the sanitized AgentCore name if it differs from the answer.

## Safety invariants

- Never run `bag deploy`, register ERC-8004, or change to mainnet.
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

### 7. Faucet checkpoint

Check the public wallet's BSC Testnet balance. If it lacks gas:

- Keep the local agent and wallet unchanged.
- Show the public address and BNB Testnet faucet action.
- Stop and tell the participant to rerun this skill after funding.

On rerun, detect the existing wallet, verify funding, rerun diagnostics and the
smoke test, then report readiness.

### 8. Stop before deployment

Always stop before deployment, even when every check passes. Explain that local
storage is workshop-only and not durable. A later explicit user request is
required to authenticate and deploy to the managed 48-hour trial.

## Final report

End with compact bullets:

- Agent name and sanitized runtime name.
- Function and deliverable.
- Price/bounds.
- Network, protocol, framework, runtime.
- Wallet kind and public address.
- LLM provider/model and activation state.
- Storage and its non-durability.
- Intended 48-hour platform destination.
- Dependency status.
- Local endpoint and health/quote smoke-test results.
- Product smoke-test result: the deliverable the agent actually produced, and
  any figure in it that failed verification against chain data.
- Faucet/funding state.
- Current readiness and exact next action.
- Change later: price/model/storage/network/destination file or command.

Then add only these informational mainnet bullets:

- Create a new production wallet; never reuse the workshop wallet.
- Switch to `bsc-mainnet` and configure durable storage.
- Fund real BNB for gas and paid LLM credits if needed.
- Review price bounds, signing policy, OAuth, and production infrastructure.
- Run `bag deploy prepare`, then deploy and verify only after an explicit
  production decision.

