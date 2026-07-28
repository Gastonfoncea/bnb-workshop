#!/usr/bin/env python3
"""Deterministic setup helpers for the portable BNB workshop skill."""

from __future__ import annotations

import json
import argparse
import hashlib
import os
import secrets
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path
from typing import Any


DEFAULTS = {
    "price_u": "0.1",
    "network": "bsc-testnet",
    "destination": "platform",
    "storage": "local",
    "protocol": "A2A",
    "framework": "adk",
    "runtime": "agentcore",
    "llm_provider": "pieverse-llm",
    "model": "auto/free",
    "wallet_kind": "evm-local",
}


def sanitize_name(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_name = normalized.encode("ascii", "ignore").decode("ascii")
    cleaned = "".join(ch for ch in ascii_name.lower() if ch.isalnum())
    if not cleaned or not cleaned[0].isalpha():
        cleaned = f"agent{cleaned}"
    return cleaned[:23]


def json_result(value: dict[str, Any]) -> str:
    return json.dumps(value, sort_keys=True)


def evaluate_preflight(
    python_version: tuple[int, int, int],
    node_version: tuple[int, int, int] | None,
    bag_version: str,
    agentcore_help: str,
) -> dict[str, Any]:
    missing = []
    if python_version < (3, 10, 0):
        missing.append("python")
    if node_version is None or node_version < (20, 0, 0):
        missing.append("node")
    if not bag_version.startswith("bag "):
        missing.append("bnbagent-studio")
    if "--no-agent" not in agentcore_help:
        missing.append("agentcore")
    return {"ready": not missing, "missing": missing}


def agentcore_command(platform: str, candidates: dict[str, str]) -> str | None:
    if platform.startswith("win") and candidates.get("agentcore.cmd"):
        return candidates["agentcore.cmd"]
    return candidates.get("agentcore")


def _run(command: list[str]) -> tuple[int, str]:
    try:
        result = subprocess.run(
            command,
            check=False,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=20,
        )
        return result.returncode, (result.stdout + result.stderr).strip()
    except (OSError, subprocess.TimeoutExpired) as exc:
        return 127, str(exc)


def _parse_version(value: str) -> tuple[int, int, int] | None:
    cleaned = value.strip().lstrip("v")
    parts = cleaned.split(".")
    try:
        return tuple(int(part.split("-")[0]) for part in parts[:3])  # type: ignore[return-value]
    except (TypeError, ValueError):
        return None


def live_preflight() -> dict[str, Any]:
    node_path = shutil.which("node")
    bag_path = shutil.which("bag")
    candidates = {
        name: path
        for name in ("agentcore.cmd", "agentcore")
        if (path := shutil.which(name))
    }
    agentcore_path = agentcore_command(sys.platform, candidates)
    _, node_output = _run([node_path, "--version"]) if node_path else (127, "")
    _, bag_output = _run([bag_path, "--version"]) if bag_path else (127, "")
    _, agentcore_output = (
        _run([agentcore_path, "create", "--help"]) if agentcore_path else (127, "")
    )
    evaluated = evaluate_preflight(
        sys.version_info[:3],
        _parse_version(node_output),
        bag_output,
        agentcore_output,
    )
    install_commands = {
        "node": "Install Node.js 20+ with winget, Homebrew, or your OS package manager.",
        "bnbagent-studio": "python -m pip install --user bnbagent-studio",
        "agentcore": "npm install -g @aws/agentcore",
        "python": "Install Python 3.10+ with your OS package manager.",
    }
    evaluated["tools"] = {
        "python": sys.executable,
        "node": node_path,
        "bag": bag_path,
        "agentcore": agentcore_path,
    }
    evaluated["install"] = [
        {"tool": name, "command": install_commands[name]}
        for name in evaluated["missing"]
    ]
    return evaluated


def _env_values(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    values: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            key, value = line.split("=", 1)
            values[key.strip()] = value
    return values


def _ensure_gitignore(root: Path) -> None:
    path = root / ".gitignore"
    lines = path.read_text(encoding="utf-8").splitlines() if path.exists() else []
    if ".studio/" not in lines:
        lines.append(".studio/")
        path.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")


def ensure_wallet_password(root: Path) -> dict[str, Any]:
    root = root.resolve()
    env_path = root / ".studio" / ".env.local"
    env_path.parent.mkdir(parents=True, exist_ok=True)
    values = _env_values(env_path)
    created = "WALLET_PASSWORD" not in values or not values["WALLET_PASSWORD"]
    if created:
        values["WALLET_PASSWORD"] = secrets.token_urlsafe(32)
        content = "\n".join(f"{key}={value}" for key, value in values.items()) + "\n"
        env_path.write_text(content, encoding="utf-8")
    _ensure_gitignore(root)
    fingerprint = hashlib.sha256(values["WALLET_PASSWORD"].encode()).hexdigest()[:12]
    return {
        "created": created,
        "path": str(env_path),
        "fingerprint": fingerprint,
    }


def inspect_state(root: Path) -> dict[str, Any]:
    root = root.resolve()
    env_path = root / ".studio" / ".env.local"
    wallet_files = list((root / ".studio" / "wallets").glob("*.json"))
    password_present = bool(_env_values(env_path).get("WALLET_PASSWORD"))
    checkpoint = "ready"
    if wallet_files and not password_present:
        checkpoint = "missing_existing_wallet_password"
    elif not (root / "app" / "agent" / "studio.toml").exists():
        checkpoint = "scaffold"
    elif not wallet_files:
        checkpoint = "wallet"
    return {
        "checkpoint": checkpoint,
        "scaffolded": (root / "app" / "agent" / "studio.toml").exists(),
        "wallet_created": bool(wallet_files),
        "password_present": password_present,
    }


def project_commands(name: str) -> dict[str, Any]:
    clean_name = sanitize_name(name)
    return {
        "execute": [
            [
                "bag",
                "init",
                clean_name,
                "--network",
                DEFAULTS["network"],
                "--llm-provider",
                DEFAULTS["llm_provider"],
                "--storage-provider",
                DEFAULTS["storage"],
                "--wallet-kind",
                DEFAULTS["wallet_kind"],
                "--destination",
                DEFAULTS["destination"],
                "--no-onboard",
            ],
            ["bag", "wallet", "new"],
            ["bag", "llm", "activate"],
            ["bag", "doctor"],
            ["bag", "dev"],
        ],
        "informational_next_steps": "bag deploy agent",
    }


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("preflight")
    secret = subparsers.add_parser("ensure-secret")
    secret.add_argument("--project-root", required=True, type=Path)
    state = subparsers.add_parser("state")
    state.add_argument("--project-root", required=True, type=Path)
    commands = subparsers.add_parser("commands")
    commands.add_argument("--name", required=True)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    if args.command == "preflight":
        result = live_preflight()
    elif args.command == "ensure-secret":
        result = ensure_wallet_password(args.project_root)
    elif args.command == "state":
        result = inspect_state(args.project_root)
    else:
        result = project_commands(args.name)
    print(json_result(result))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
