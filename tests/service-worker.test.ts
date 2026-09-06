import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

function loadWorker() {
  const handlers = new Map<string, (event: unknown) => void>();
  runInNewContext(readFileSync("public/sw.js", "utf8"), {
    URL,
    self: {
      location: { origin: "https://app.test" },
      addEventListener: (name: string, handler: (event: unknown) => void) => handlers.set(name, handler),
    },
    fetch: async () => new Response("asset"),
    caches: { open: async () => ({ put: async () => undefined }) },
  });
  return handlers.get("fetch")!;
}

test("service worker never caches API responses or substitutes offline HTML for health", () => {
  const handleFetch = loadWorker();
  for (const path of ["/api/health", "/api/health?check=1", "/api/chat"]) {
    handleFetch({
      request: new Request(`https://app.test${path}`),
      respondWith: () => assert.fail("API requests must bypass the service worker"),
    });
  }
});

test("service worker still ignores POST and cross-origin requests", () => {
  const handleFetch = loadWorker();
  for (const request of [
    new Request("https://app.test/api/chat", { method: "POST" }),
    new Request("https://external.test/file"),
  ]) {
    handleFetch({ request, respondWith: () => assert.fail("Request must bypass the service worker") });
  }
});

test("service worker retains caching for non-API assets", async () => {
  const handleFetch = loadWorker();
  let response: Promise<Response> | undefined;
  handleFetch({
    request: new Request("https://app.test/icon.svg"),
    respondWith: (value: Promise<Response>) => { response = value; },
  });
  assert.ok(response);
  assert.equal(await (await response).text(), "asset");
});
