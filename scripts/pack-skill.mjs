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

// Anything a tool might drop into the skill directory while developing. A
// pytest run once shipped .pytest_cache/ to every attendee's machine.
const EXCLUDES = [
  "__pycache__",
  "*.pyc",
  ".pytest_cache",
  ".ruff_cache",
  ".mypy_cache",
  ".venv",
  ".DS_Store",
];

execFileSync(
  "tar",
  [
    ...EXCLUDES.flatMap((pattern) => ["--exclude", pattern]),
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

// Belt and braces: the exclude list only catches what we thought to name, so
// reject any dotfile or dot-directory that made it in regardless.
const entries = execFileSync("tar", ["-tzf", archive], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const unexpected = entries.filter((entry) =>
  entry
    .split("/")
    .some((segment) => segment.startsWith(".") && segment !== ""),
);

if (unexpected.length > 0) {
  rmSync(archive, { force: true });
  throw new Error(
    `Refusing to ship hidden files in the skill archive:\n  ${unexpected.join("\n  ")}`,
  );
}

const kb = (statSync(archive).size / 1024).toFixed(1);
console.log(
  `packed ${SKILL} -> public/${SKILL}.tar.gz (${kb} KB, ${entries.length} entries)`,
);
