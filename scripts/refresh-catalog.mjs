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

// Amy authorized publishing owned private repository metadata and aggregate stats.
// Verify the account so refreshing can never import another signed-in user's repos.
const account = await github("user", "--jq", "{login}");
if (account.login.toLowerCase() !== owner.toLowerCase()) throw new Error(`Authenticate gh as ${owner} before refreshing.`);
const pages = await github("user/repos?affiliation=owner&visibility=all&per_page=100&sort=pushed", "--paginate", "--slurp");
const ownedRepos = pages.flat().filter(repo => repo.owner.login.toLowerCase() === owner.toLowerCase());
if (!ownedRepos.length) throw new Error("No owned repositories returned.");
const existing = new Map(previous.repositories.map(repo => [repo.n, repo]));
const live = new Map(ownedRepos.map(repo => [repo.name, repo]));
// If a listing disappears, stop for review instead of silently deleting it.
for (const repo of previous.repositories) {
  if (!live.has(repo.n)) throw new Error(`Repository missing from authenticated inventory: ${repo.n}. Review access or removal before saving.`);
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

// Use the same authenticated metric for public and private repositories.
// GitHub's profile contribution feed hides per-repository private counts.
// Only retrieve commit IDs and UTC committer dates; never save commit contents.
const monthCount = now.getUTCMonth() + 1;
const from = new Date(Date.UTC(year, 0, 1)).toISOString();
const activity = [];
async function collectActivity(repo) {
  const item = { n: repo.n, c: 0, m: Array(monthCount).fill(0) };
  const seen = new Set();
  const params = new URLSearchParams({ author: owner, sha: live.get(repo.n).default_branch, since: from, until: now.toISOString(), per_page: "100" });
  for (let page = 1; ; page++) {
    let commits;
    try {
      commits = await github(`repos/${owner}/${encodeURIComponent(repo.n)}/commits?${params}&page=${page}`, "--jq", "map({sha, date: .commit.committer.date})");
    } catch (error) {
      // GitHub's explicitly empty-repository response is a verified zero.
      // Permissions, rate limits and all other failures must abort the snapshot.
      if (/Git Repository is empty/i.test(error.stderr || "")) break;
      throw error;
    }
    for (const commit of commits) {
      const date = new Date(commit.date);
      if (!Number.isFinite(date.getTime())) throw new Error(`Invalid commit date in ${repo.n}`);
      if (seen.has(commit.sha) || date < new Date(from) || date > now) continue;
      seen.add(commit.sha);
      item.m[date.getUTCMonth()]++;
      item.c++;
    }
    if (commits.length < 100) break;
  }
  return item;
}
// A small batch keeps the refresh practical without flooding GitHub.
for (let offset = 0; offset < repositories.length; offset += 4) {
  activity.push(...await Promise.all(repositories.slice(offset, offset + 4).map(collectActivity)));
  console.log(`Read activity for ${activity.length}/${repositories.length} repositories.`);
}
// Write only after all requests succeed. Save monthly totals, never commit details.
const snapshot = {
  owner, year, updatedAt: now.toISOString(),
  visibilityScope: "all-owned",
  activitySource: `Commits authored by ${owner} on each owned repository's default branch, grouped by UTC committer month; includes public and private repositories and automation authored by this account.`,
  repositories,
  activity: activity.sort((a, b) => b.c - a.c || a.n.localeCompare(b.n)),
};
await writeFile(catalogUrl, JSON.stringify(snapshot, null, 2) + "\n");
console.log(`Saved ${repositories.length} projects (${repositories.filter(repo => repo.private).length} private), ${snapshot.activity.reduce((sum, repo) => sum + repo.c, 0)} authored commits.`);
