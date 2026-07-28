"""Product smoke test — run a workshop agent's WORK hook with no chain, no payment.

The A2A smoke test in SKILL.md proves the *protocol* works: a signed quote comes
back. It says nothing about whether the agent actually does its job. That gap is
why a participant can finish the workshop without ever seeing their own agent
produce anything.

This script closes it. It builds the same prompt the paid delivery path builds
and runs it through the same ADK runner, then prints the deliverable — skipping
only the parts that cost money (escrow, on-chain submit). No testnet funds, no
buyer, no faucet.

    python product_smoke_test.py --project-root . --task "Explain 0xabc..."

Exit codes: 0 deliverable produced · 1 setup/config problem · 2 LLM quota
exhausted (the free model's daily cap — not a bug in the agent).
"""
from __future__ import annotations

import argparse
import asyncio
import inspect
import json
import os
import re
import sys
from pathlib import Path


def _agent_dir(project_root: Path) -> Path:
    """Locate app/agent under the workspace root."""
    candidate = project_root / "app" / "agent"
    if (candidate / "main.py").is_file():
        return candidate
    if (project_root / "main.py").is_file():  # already inside app/agent
        return project_root
    raise SystemExit(
        f"error: no agent entrypoint found under {project_root}. "
        "Run this from the workspace root (the directory holding app/agent/)."
    )


def _load_env_local(project_root: Path) -> None:
    """Load .studio/.env.local into this process only. Never prints a secret."""
    env_path = project_root / ".studio" / ".env.local"
    if not env_path.is_file():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def _find_prompt_builder(seller_core) -> object | None:
    """Find the agent's specialised prompt builder, if the participant wrote one.

    Convention: the work hook is a module-level ``_build_<something>_prompt``.
    Absent one, the agent still runs on the scaffold's generic prompt.
    """
    for name in dir(seller_core):
        if name.startswith("_build_") and name.endswith("_prompt"):
            fn = getattr(seller_core, name)
            if callable(fn):
                return fn
    return None


def _build_prompt(seller_core, task_json: str, network: str) -> tuple[str, str]:
    """Return (prompt, source_label) for the given job text."""
    builder = _find_prompt_builder(seller_core)
    if builder is None:
        generic = (
            "You accepted and were paid for the following job. Produce the "
            "deliverable now. Be complete and self-contained.\n\n"
            f"JOB CONTEXT:\n{task_json}"
        )
        return generic, "scaffold default (no custom hook found)"

    kwargs = {}
    try:
        if "network" in inspect.signature(builder).parameters:
            kwargs["network"] = network
    except (TypeError, ValueError):
        pass
    return builder(task_json, **kwargs), f"{builder.__name__}()"


def _default_network(project_root: Path) -> str:
    try:
        from bnbagent_studio_core import config

        cfg = config.load_studio_toml() or {}
        return str((cfg.get("network") or {}).get("default") or "bsc-testnet")
    except Exception:  # noqa: BLE001
        return "bsc-testnet"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Run the agent's work hook locally — no chain, no payment."
    )
    parser.add_argument("--project-root", default=".", help="workspace root")
    parser.add_argument(
        "--task", required=True, help="what to ask the agent to do (the job text)"
    )
    parser.add_argument(
        "--deliverables", default="", help="optional terms.deliverables text"
    )
    parser.add_argument("--out", default="", help="also write the deliverable here")
    parser.add_argument(
        "--show-prompt", action="store_true", help="print the built prompt first"
    )
    args = parser.parse_args(argv)

    project_root = Path(args.project_root).resolve()
    agent_dir = _agent_dir(project_root)
    _load_env_local(project_root)

    # Import the agent exactly as it imports itself at runtime.
    sys.path.insert(0, str(agent_dir))
    os.chdir(agent_dir)

    try:
        import seller_core
    except Exception as e:  # noqa: BLE001
        print(f"error: could not import seller_core: {e}", file=sys.stderr)
        return 1

    network = _default_network(project_root)
    terms = {"deliverables": args.deliverables} if args.deliverables else {}
    task_json = json.dumps({"task": args.task, "terms": terms}, ensure_ascii=False)

    print(f"→ network        {network}")
    print(f"→ prompt built by {_build_prompt(seller_core, task_json, network)[1]}")

    prompt, _ = _build_prompt(seller_core, task_json, network)
    if args.show_prompt:
        print("\n--- PROMPT ---\n" + prompt + "\n--- END PROMPT ---\n")

    print("→ running the work hook (this calls the LLM)…\n")
    try:
        import main as agent_main

        deliverable = asyncio.run(
            agent_main._run_llm(prompt, session_id="product-smoke-test")
        )
    except Exception as e:  # noqa: BLE001
        text = str(e)
        if "RateLimitError" in type(e).__name__ or "limit exceeded" in text.lower():
            wait = ""
            match = re.search(r"retryAfterSeconds'?\s*:\s*(\d+)", text)
            if match:
                minutes = round(int(match.group(1)) / 60)
                wait = f" Retry in about {minutes} minutes."
            print(
                "LLM quota exhausted — the free model has a DAILY request cap and "
                "it is spent.\nThis is not a bug in your agent: the work hook was "
                f"built fine and the call was made.{wait}\n"
                "Or switch to a paid model (`bag llm topup`).",
                file=sys.stderr,
            )
            return 2
        print(f"error: the work hook failed: {e}", file=sys.stderr)
        return 1

    if not deliverable.strip():
        print("error: the agent produced an EMPTY deliverable.", file=sys.stderr)
        return 1

    print("=" * 62)
    print(deliverable)
    print("=" * 62)
    print(f"\n✓ deliverable produced — {len(deliverable)} characters")
    print("  (no payment, no chain write — this is the work hook only)")

    if args.out:
        Path(args.out).write_text(deliverable, encoding="utf-8")
        print(f"  written to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
