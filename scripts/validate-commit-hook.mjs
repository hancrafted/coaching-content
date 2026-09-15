#!/usr/bin/env node
// RULE-001-style commit gate for coaching-content.
// Enforces Conventional Commits + a Keep-a-Changelog body + atomic single-scope commits.
import * as fs from "node:fs";
import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const REF = "See: governance/rules/RULE-001-git-commits.md";

const TYPES = ["feat", "fix", "docs", "chore", "refactor", "ci", "perf", "test", "build", "style"];
const SUBJECT_RE = new RegExp(`^(${TYPES.join("|")})(?:\\(([a-z0-9._-]+)\\))?!?: .+$`);
const ALLOWED_HEADERS = new Set([
  "### Added",
  "### Changed",
  "### Deprecated",
  "### Removed",
  "### Fixed",
  "### Security",
]);

/**
 * Validate a commit message's subject + body grammar.
 * @returns {{ok: true, scope: string} | {ok: false, error: string}}
 */
export function validateMessage(rawMessage) {
  const message = rawMessage.replace(/\r\n?/g, "\n").trim();
  if (!message) return { ok: true, scope: null }; // empty/aborted — let git handle it

  const subject = message.split("\n")[0];

  // Git-generated merge/revert commits bypass the contract.
  if (/^(Merge|Revert)\b/.test(subject)) return { ok: true, scope: null };

  const match = subject.match(SUBJECT_RE);
  if (!match) {
    return {
      ok: false,
      error: `Invalid commit subject. Got: ${subject}\nExpected: type(scope): summary — type ∈ ${TYPES.join("|")}, scope matches [a-z0-9._-]+`,
    };
  }
  const scope = match[2];
  if (!scope) return { ok: false, error: "Missing commit scope, e.g. feat(src): ..." };

  // Body: blank second line, then a Keep-a-Changelog section must be present.
  const bodyLines = message.split("\n").slice(1);
  if (bodyLines.length > 0 && bodyLines[0].trim() !== "") {
    return { ok: false, error: "The second line of the commit message must be empty." };
  }
  const lines = bodyLines
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l !== "");
  if (lines.length === 0) {
    return {
      ok: false,
      error: "Commit body required in Keep a Changelog format (e.g. ### Added).",
    };
  }

  // Require >=1 known header with >=1 bullet. Header typos are rejected; any
  // other non-empty line (prose, wrapped bullet continuation, trailer) is fine.
  let hasHeaderWithBullet = false;
  let currentHeader = null;
  let bulletsForCurrent = 0;
  for (const line of lines) {
    if (line.startsWith("### ")) {
      if (currentHeader && bulletsForCurrent > 0) hasHeaderWithBullet = true;
      if (!ALLOWED_HEADERS.has(line)) {
        return {
          ok: false,
          error: `Invalid Keep a Changelog header '${line}'. Allowed: ${[...ALLOWED_HEADERS].join(", ")}`,
        };
      }
      currentHeader = line;
      bulletsForCurrent = 0;
    } else if (line.startsWith("- ")) {
      if (currentHeader) bulletsForCurrent++;
    }
    // else: prose / continuation / trailer — allowed, ignored for the bullet count.
  }
  if (currentHeader && bulletsForCurrent > 0) hasHeaderWithBullet = true;
  if (!hasHeaderWithBullet) {
    return {
      ok: false,
      error:
        'Body must contain a Keep a Changelog header (### Added, ### Changed, ...) with at least one "- " bullet.',
    };
  }
  return { ok: true, scope };
}

/**
 * Map a repo-relative file path to its commit scope.
 * Repo-root files -> 'root'; dot-dirs (.archgate/.github/.husky/.claude) -> dir name;
 * workshop subdirectories under src/ -> workshop folder name (ai-token-economy, etc.);
 * otherwise the top-level directory (src, docs, scripts, etc.).
 */
export function getScopeForFile(file) {
  const parts = file.split("/");
  if (parts.length === 1) return "root";
  if (parts[0] === "src" && parts.length > 2) {
    if (parts[1] === "ai-token-economy" || parts[1] === "maintaining-markdown-for-ai") {
      return parts[1];
    }
  }
  return parts[0];
}

function main() {
  const msgPath = process.argv[2];
  const raw = fs.readFileSync(msgPath, "utf8");

  const result = validateMessage(raw);
  if (!result.ok) {
    console.error(`ERROR: ${result.error}`);
    console.error(REF);
    process.exit(1);
  }
  const declaredScope = result.scope;
  if (declaredScope === null) process.exit(0); // empty or merge/revert — nothing to check

  let stagedFiles = [];
  try {
    stagedFiles = execSync("git diff --cached --name-only", { encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch (e) {
    console.error("ERROR: failed to read staged files.", e);
    process.exit(1);
  }
  if (stagedFiles.length === 0) process.exit(0);

  const scopes = new Set(stagedFiles.map(getScopeForFile));
  if (scopes.size > 1) {
    console.error(`ERROR: Mixed scopes in one commit: ${[...scopes].join(", ")}`);
    console.error("One commit = one scope. Stage and commit each scope separately.");
    console.error(REF);
    process.exit(1);
  }
  const actualScope = [...scopes][0];
  if (actualScope !== declaredScope) {
    console.error(`ERROR: Declared scope '${declaredScope}' != staged scope '${actualScope}'.`);
    console.error(REF);
    process.exit(1);
  }
  process.exit(0);
}

// CLI entry guard: only run main() when executed directly, not when imported.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
