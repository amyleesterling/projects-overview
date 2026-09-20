import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const catalog = JSON.parse(await readFile(new URL("../app/data/catalog.json", import.meta.url), "utf8"));

test("static export contains the current exhibition, catalog and snapshot date", async () => {
  const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
  const date = new Intl.DateTimeFormat("en-US", {month:"long",day:"numeric",year:"numeric",timeZone:"UTC"}).format(new Date(catalog.updatedAt));
  assert.ok(html.includes("Amy Sterling — 2026 Project Index"));
  assert.ok(html.includes(date), "snapshot date appears in rendered page");
  assert.ok(html.includes(catalog.repositories.length + " projects across the collection"));
  for (const repo of catalog.repositories) assert.ok(html.includes(repo.u), repo.n + " is rendered");
  assert.ok(!html.includes("Your site is taking shape"));
  assert.equal((html.match(/Private repository\. Open repository\./g) || []).length, catalog.repositories.filter(repo => repo.private).length, "private repositories appear in the activity chart");
  assert.ok(!html.includes("Private activity is excluded"));
  assert.ok(!html.includes("January–August 2026"));
  assert.ok(html.includes('max="' + (new Date(catalog.updatedAt).getUTCMonth() + 1) + '"'), "timeline ends at snapshot month");
});

test("all three exported routes use existing assets and links below the GitHub Pages base path", async () => {
  const basePath = "/projects-overview";
  for (const route of ["", "anthropics/", "openai/"]) {
    const html = await readFile(new URL(`../out/${route}index.html`, import.meta.url), "utf8");
    assert.ok(html.includes(`${basePath}/_next/`), `${route}: framework assets are prefixed`);
    for (const [, path] of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      assert.ok(path.startsWith(`${basePath}/`), `${route}: unexpected root-relative path ${path}`);
      const target = new URL(`../out${path.slice(basePath.length)}`, import.meta.url);
      assert.ok(await stat(target).then(() => true, () => false), `${route}: missing ${path}`);
    }
  }
  await stat(new URL("../out/meshes/human-brain.glb", import.meta.url));
  await stat(new URL("../out/featured/pyramidal-neuron.png", import.meta.url));
});

for (const owner of ["anthropics", "openai"]) {
  test(`${owner} demo exports current repository counts, stars and snapshot date`, async () => {
    const snapshot = JSON.parse(await readFile(new URL(`../examples/${owner}-2026.json`, import.meta.url), "utf8"));
    const html = await readFile(new URL(`../out/${owner}/index.html`, import.meta.url), "utf8");
    const capture = new Date(snapshot.generatedAt);
    assert.equal(new Set(snapshot.repositories.map(repo => repo.n)).size, snapshot.repositories.length);
    assert.ok(html.includes(snapshot.generatedAt));
    assert.ok(html.includes(`${snapshot.repositories.length} PUBLIC REPOSITORIES`));
    assert.ok(html.includes(`max="${capture.getUTCMonth() + 1}"`));
    const stars = snapshot.repositories.reduce((sum, repo) => sum + repo.stars, 0);
    assert.ok(html.includes(stars.toLocaleString("en-US")));
    for (const repo of snapshot.repositories) {
      assert.ok(html.includes(repo.u), `${repo.n} is available in the demo`);
      assert.ok(repo.t >= `${snapshot.year}-01-01`);
      assert.ok(Number.isInteger(repo.stars) && repo.stars >= 0);
    }
  });
}

test("activity covers every public and private repository with consistent monthly totals", () => {
  const names = new Set(catalog.repositories.map(repo => repo.n));
  assert.equal(names.size, catalog.repositories.length);
  assert.equal(catalog.visibilityScope, "all-owned");
  assert.deepEqual(catalog.activity.map(repo => repo.n).sort(), [...names].sort());
  const privateNames = new Set(catalog.repositories.filter(repo => repo.private).map(repo => repo.n));
  assert.ok(catalog.activity.some(repo => privateNames.has(repo.n) && repo.c > 0), "private commit counts are included");
  for (const repo of catalog.activity) {
    assert.equal(repo.m.length, new Date(catalog.updatedAt).getUTCMonth() + 1);
    assert.ok(repo.m.every(count => Number.isInteger(count) && count >= 0));
    assert.equal(repo.c, repo.m.reduce((sum, count) => sum + count, 0));
  }
});
