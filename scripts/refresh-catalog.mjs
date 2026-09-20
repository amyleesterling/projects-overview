import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const exec = promisify(execFile);
const catalogUrl = new URL("../app/data/catalog.json", import.meta.url);
const previous = JSON.parse(await readFile(catalogUrl, "utf8"));
const { owner, year } = previous;
const now = new Date();
if (now.getUTCFullYear() !== year) throw new Error("Review the exhibition year before refreshing.");

async function github(...args) {
  const { stdout } = await exec("gh", ["api", ...args], { maxBuffer: 16 * 1024 * 1024 });
  const result = JSON.parse(stdout);
  if (result.errors) throw new Error(JSON.stringify(result.errors));
  return result;
}

// Public endpoint only. Never discover or publish new private repositories.
const pages = await github(`users/${owner}/repos?per_page=100&sort=pushed`, "--paginate", "--slurp");
const publicRepos = pages.flat();
if (!publicRepos.length || publicRepos.some(repo => repo.private)) throw new Error("Invalid public repository response.");
const existing = new Map(previous.repositories.map(repo => [repo.n, repo]));
const live = new Map(publicRepos.map(repo => [repo.name, repo]));
// Refresh only private listings already explicitly present in the exhibition.
// If a listing disappears, stop for review instead of silently deleting it.
for (const repo of previous.repositories) {
  if (!live.has(repo.n)) live.set(repo.n, await github(`repos/${owner}/${repo.n}`));
}
const repositories = [...live.values()].map(repo => {
  const curated = existing.get(repo.name);
  return {
    ...curated,
    n: repo.name,
    d: curated?.d || repo.description?.trim() || "Project repository.",
    l: repo.language || "Other",
    u: repo.html_url,
    ...(curated?.h || repo.homepage ? { h: curated?.h || repo.homepage } : {}),
    t: repo.pushed_at.slice(0, 10),
    f: repo.fork,
    private: repo.private,
  };
}).sort((a, b) => b.t.localeCompare(a.t) || a.n.localeCompare(b.n));

// GitHub's profile contribution definition: commits attributed to this account,
// not every commit in a repository. Monthly windows fit the daily connection.
const monthCount = now.getUTCMonth() + 1;
const activity = new Map(repositories.filter(repo => !repo.private).map(repo => [repo.n, { n: repo.n, c: 0, m: Array(monthCount).fill(0) }]));
for (let month = 0; month < monthCount; month++) {
  const from = new Date(Date.UTC(year, month, 1)).toISOString();
  const to = new Date(Math.min(now.getTime(), Date.UTC(year, month + 1, 1) - 1)).toISOString();
  const response = await github("graphql", "-f", `query=query($owner: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $owner) { contributionsCollection(from: $from, to: $to) {
      commitContributionsByRepository(maxRepositories: 100) {
        repository { name isPrivate owner { login } }
        contributions(first: 100) { nodes { commitCount } pageInfo { hasNextPage } }
      }
    } }
  }`, "-f", `owner=${owner}`, "-f", `from=${from}`, "-f", `to=${to}`);
  const contributions = response.data.user.contributionsCollection.commitContributionsByRepository;
  if (contributions.length >= 100) throw new Error("Monthly repository limit reached; review coverage before saving.");
  for (const entry of contributions) {
    if (entry.repository.isPrivate || entry.repository.owner.login.toLowerCase() !== owner.toLowerCase()) continue;
    const item = activity.get(entry.repository.name);
    if (!item) continue;
    if (entry.contributions.pageInfo.hasNextPage) throw new Error("Incomplete contribution history.");
    item.m[month] = entry.contributions.nodes.reduce((sum, day) => sum + day.commitCount, 0);
    item.c += item.m[month];
  }
  console.log(`Read ${year}-${String(month + 1).padStart(2, "0")} public contributions.`);
}
// Write only after all requests succeed. Private contribution data is never saved.
const snapshot = {
  owner, year, updatedAt: now.toISOString(),
  activitySource: "GitHub profile commit contributions attributed to amyleesterling in listed public repositories; includes any automation GitHub attributes to that account.",
  repositories,
  activity: [...activity.values()].sort((a, b) => b.c - a.c || a.n.localeCompare(b.n)),
};
await writeFile(catalogUrl, JSON.stringify(snapshot, null, 2) + "\n");
console.log(`Saved ${repositories.length} projects (${activity.size} public), ${snapshot.activity.reduce((sum, repo) => sum + repo.c, 0)} attributed public commits.`);
