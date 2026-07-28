#!/usr/bin/env sh
# Installs the create-bnb-agent workshop skill for Claude Code, Codex and Cursor.
#
#   curl -fsSL https://bnb-workshop.vercel.app/install.sh | sh
#
# Designed to be piped: it downloads the skill rather than reading files next to
# itself, because a piped script has no directory of its own.
#
# Options (note the `-s --`):
#   curl -fsSL .../install.sh | sh -s -- --target claude
#   curl -fsSL .../install.sh | sh -s -- --dry-run
set -eu

SKILL="create-bnb-agent"
BASE_URL="${BNB_SKILL_BASE_URL:-https://bnb-workshop.vercel.app}"
ARCHIVE_URL="$BASE_URL/$SKILL.tar.gz"

target="auto"
home_path="${HOME:-}"
dry_run="false"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --target) target="${2:?--target needs a value}"; shift 2 ;;
    --home) home_path="${2:?--home needs a value}"; shift 2 ;;
    --dry-run) dry_run="true"; shift ;;
    -h|--help)
      echo "Usage: install.sh [--target auto|all|claude|codex|cursor] [--dry-run]"
      exit 0
      ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

case "$target" in
  auto|all|claude|codex|cursor) ;;
  *) echo "Target must be auto, all, claude, codex, or cursor." >&2; exit 2 ;;
esac

[ -n "$home_path" ] || { echo "HOME is not set; pass --home <path>." >&2; exit 2; }

# --- pick the clients to install for -----------------------------------------

if [ "$target" = "all" ]; then
  clients="claude codex cursor"
elif [ "$target" = "auto" ]; then
  clients=""
  [ -d "$home_path/.claude" ] && clients="$clients claude"
  [ -d "$home_path/.codex" ] && clients="$clients codex"
  [ -d "$home_path/.cursor" ] && clients="$clients cursor"
  if [ -z "$clients" ]; then
    echo "No Claude Code, Codex or Cursor installation found in $home_path." >&2
    echo "Install one first, or re-run with --target <client>." >&2
    exit 2
  fi
else
  clients="$target"
fi

# --- fetch the skill ----------------------------------------------------------

if command -v curl >/dev/null 2>&1; then
  fetch() { curl -fsSL "$1" -o "$2"; }
elif command -v wget >/dev/null 2>&1; then
  fetch() { wget -qO "$2" "$1"; }
else
  echo "Need curl or wget to download the skill." >&2
  exit 1
fi

command -v tar >/dev/null 2>&1 || { echo "Need tar to unpack the skill." >&2; exit 1; }

if [ "$dry_run" = "true" ]; then
  for client in $clients; do
    echo "DRY RUN: would install $SKILL for $client at $home_path/.$client/skills/$SKILL"
  done
  exit 0
fi

tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT INT TERM

# Braces are load-bearing: "$SKILL..." would be read as a variable named SKILL...
echo "Downloading ${SKILL}..."
fetch "$ARCHIVE_URL" "$tmp_dir/$SKILL.tar.gz"
tar -xzf "$tmp_dir/$SKILL.tar.gz" -C "$tmp_dir"

source_dir="$tmp_dir/$SKILL"
[ -f "$source_dir/SKILL.md" ] || { echo "Downloaded archive is missing SKILL.md." >&2; exit 1; }

# --- install ------------------------------------------------------------------

for client in $clients; do
  skills_root="$home_path/.$client/skills"
  destination="$skills_root/$SKILL"

  # Refuse to write anywhere but a client's own skills directory.
  case "$destination" in
    "$home_path"/.claude/skills/"$SKILL"|"$home_path"/.codex/skills/"$SKILL"|"$home_path"/.cursor/skills/"$SKILL") ;;
    *) echo "Unsafe destination for $client: $destination" >&2; exit 2 ;;
  esac

  mkdir -p "$skills_root"
  [ -e "$destination" ] && rm -rf -- "$destination"
  cp -R "$source_dir" "$destination"
  echo "  OK  $client -> $destination"
done

echo ""
echo "Installed. Restart your assistant, then ask it to create a BNB workshop agent."
