// Packs the skill into public/ so the hosted installers can fetch it.
// Runs on every build, so the tarball can never drift from plugins/.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = "create-bnb-agent";

// Single source of truth: the same directory the Claude Code plugin serves.
const skillParent = join(root, "plugins", SKILL, "skills");
const archive = join(root, "public", `${SKILL}.tar.gz`);

if (!statSync(join(skillParent, SKILL)).isDirectory()) {
  throw new Error(`Skill directory not found: ${join(skillParent, SKILL)}`);
}

mkdirSync(dirname(archive), { recursive: true });
rmSync(archive, { force: true });

execFileSync(
  "tar",
  [
    "--exclude",
    "__pycache__",
    "--exclude",
    "*.pyc",
    "--exclude",
    ".DS_Store",
    "-czf",
    archive,
    "-C",
    skillParent,
    SKILL,
  ],
  {
    stdio: "inherit",
    // Stops macOS bsdtar from writing ._AppleDouble resource-fork entries.
    env: { ...process.env, COPYFILE_DISABLE: "1" },
  },
);

const kb = (statSync(archive).size / 1024).toFixed(1);
console.log(`packed ${SKILL} -> public/${SKILL}.tar.gz (${kb} KB)`);
