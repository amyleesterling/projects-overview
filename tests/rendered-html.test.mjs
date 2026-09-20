import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const catalog = JSON.parse(await readFile(new URL("../app/data/catalog.json", import.meta.url), "utf8"));

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}


test("server-renders the current exhibition, catalog and snapshot date", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  const date = new Intl.DateTimeFormat("en-US", {month:"long",day:"numeric",year:"numeric",timeZone:"UTC"}).format(new Date(catalog.updatedAt));
  assert.ok(html.includes("Amy Sterling — 2026 Project Index"));
  assert.ok(html.includes(date), "snapshot date appears in rendered page");
  assert.ok(html.includes(catalog.repositories.length + " projects across the collection"));
  for (const repo of catalog.repositories) assert.ok(html.includes(repo.u), repo.n + " is rendered");
  assert.ok(!html.includes("Your site is taking shape"));
  assert.ok(!html.includes("January–August 2026"));
  assert.ok(html.includes('max="' + (new Date(catalog.updatedAt).getUTCMonth() + 1) + '"'), "timeline ends at snapshot month");
});

test("public activity covers the catalog without leaking private histories", () => {
  const names = new Set(catalog.repositories.map(repo => repo.n));
  assert.equal(names.size, catalog.repositories.length);
  const publicNames = catalog.repositories.filter(repo => !repo.private).map(repo => repo.n).sort();
  assert.deepEqual(catalog.activity.map(repo => repo.n).sort(), publicNames);
  for (const repo of catalog.activity) {
    assert.equal(repo.m.length, new Date(catalog.updatedAt).getUTCMonth() + 1);
    assert.ok(repo.m.every(count => Number.isInteger(count) && count >= 0));
    assert.equal(repo.c, repo.m.reduce((sum, count) => sum + count, 0));
  }
});
