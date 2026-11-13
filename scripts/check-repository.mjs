#!/usr/bin/env node
/**
 * Fast, dependency-free checks for the public-facing repository structure.
 * This intentionally does not scan historical archives: archived links and
 * outdated patch descriptions are preserved as historical records.
 * Gameplay validity belongs to TypeScript, Vitest and the production build.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve, relative, isAbsolute, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "docs/README.md",
  "docs/ARCHITECTURE.md",
  "docs/BACKLOG.md",
  "docs/IDEAS.md",
  "docs/MOBILE.md",
  "docs/SEASONS.md",
  "docs/DEVELOPMENT_HISTORY.md",
  "docs/BACKLOG_ARCHIVE.md",
  "docs/DESIGN_ARCHIVE.md",
  ".editorconfig",
  ".gitattributes",
  ".github/CODEOWNERS",
  ".github/workflows/ci.yml",
  ".github/workflows/pages.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/pull_request_template.md",
  "src/game/worldGeneration.ts",
  "src/game/runHydration.ts",
];
const activeMarkdown = [
  "README.md", "CHANGELOG.md", "CONTRIBUTING.md",
  "docs/README.md", "docs/ARCHITECTURE.md", "docs/BACKLOG.md",
  "docs/IDEAS.md", "docs/MOBILE.md", "docs/SEASONS.md",
];

let checked = 0;
const problems = [];
for (const path of required) {
  const full = resolve(root, path);
  if (!existsSync(full) || !statSync(full).isFile()) {
    problems.push("Missing required repository file: " + path);
  }
}
for (const source of activeMarkdown) {
  const full = resolve(root, source);
  if (!existsSync(full)) continue;
  const markdown = readFileSync(full, "utf8");
  // Only relative links are checked. The repository test never requests
  // the network and cannot certify external websites or GitHub Pages.
  for (const match of markdown.matchAll(/\]\(([^)]+)\)/g)) {
    const raw = match[1].trim().replace(/^<|>$/g, "");
    if (!raw || raw.startsWith("#") || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(raw)) continue;
    const path = decodeURIComponent(raw.split("#")[0].split("?")[0]);
    if (!path) continue;
    const target = resolve(dirname(full), path);
    const local = relative(root, target);
    checked += 1;
    if (isAbsolute(local) || local === ".." || local.startsWith(".." + sep)) {
      problems.push(source + ": link escapes repository: " + raw);
    } else if (!existsSync(target)) {
      problems.push(source + ": broken local link: " + raw);
    }
  }
}
if (problems.length) {
  for (const message of problems) console.error("ERROR " + message);
  process.exitCode = 1;
} else {
  console.log("Repository structure OK; " + checked + " local documentation links checked.");
}
