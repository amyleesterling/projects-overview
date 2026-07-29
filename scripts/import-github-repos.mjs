#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const owner = args.find((arg) => !arg.startsWith("--"));
const valueFor = (name) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
const year = Number(valueFor("--year") || new Date().getUTCFullYear());
const output = valueFor("--output") || `imports/${owner || "github"}-${year}.json`;
const includeForks = args.includes("--include-forks");
const includeArchived = args.includes("--include-archived");
const includeAllYears = args.includes("--all-years");

if (!owner) {
  console.error("Usage: npm run import:github -- <user-or-org> [--year=2026] [--output=imports/name.json]");
  process.exit(1);
}

if (!Number.isInteger(year) || year < 2008 || year > 9999) {
  console.error(`Invalid year: ${year}`);
  process.exit(1);
}

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "projects-overview-importer",
};

if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const repositories = [];
for (let page = 1; ; page += 1) {
  const url = new URL(`https://api.github.com/users/${encodeURIComponent(owner)}/repos`);
  url.searchParams.set("type", "owner");
  url.searchParams.set("sort", "pushed");
  url.searchParams.set("direction", "desc");
  url.searchParams.set("per_page", "100");
  url.searchParams.set("page", String(page));

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub API ${response.status}: ${detail.slice(0, 300)}`);
  }

  const batch = await response.json();
  repositories.push(...batch);
  if (batch.length < 100) break;
}

const start = `${year}-01-01T00:00:00Z`;
const imported = repositories
  .filter((repo) => includeForks || !repo.fork)
  .filter((repo) => includeArchived || !repo.archived)
  .filter((repo) => includeAllYears || repo.pushed_at >= start)
  .map((repo) => ({
    n: repo.name,
    d: repo.description || `A public GitHub repository from ${owner}.`,
    l: repo.language || "Other",
    u: repo.html_url,
    ...(repo.homepage ? { h: repo.homepage } : {}),
    t: repo.pushed_at.slice(0, 10),
    ...(repo.fork ? { f: true } : {}),
    topics: repo.topics || [],
    stars: repo.stargazers_count,
  }));

const result = {
  owner,
  year: includeAllYears ? null : year,
  generatedAt: new Date().toISOString(),
  source: `https://github.com/${owner}`,
  repositories: imported,
};

const destination = resolve(output);
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, `${JSON.stringify(result, null, 2)}\n`, "utf8");

console.log(`Imported ${imported.length} repositories from ${owner}.`);
console.log(destination);
