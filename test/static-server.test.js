import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rmdir, unlink, writeFile } from "node:fs/promises";
import { request } from "node:http";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { createStaticServer } from "../tools/serve.mjs";

const repositoryDirectory = fileURLToPath(new URL("../", import.meta.url));
const publicDirectory = join(repositoryDirectory, "public");
const indexPath = join(publicDirectory, "index.html");
const indexFixture = `<!doctype html><title>Static server test ${randomUUID()}</title>`;
const scriptName = `static-server-test-${randomUUID()}.js`;
const scriptPath = join(publicDirectory, scriptName);
const scriptFixture = "export const staticServerFixture = true;\n";

let baseUrl;
let createdIndex = false;
let createdPublicDirectory = false;
let server;

before(async () => {
  try {
    await mkdir(publicDirectory);
    createdPublicDirectory = true;
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }

  try {
    await writeFile(indexPath, indexFixture, { flag: "wx" });
    createdIndex = true;
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }

  await writeFile(scriptPath, scriptFixture, { flag: "wx" });

  server = createStaticServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  await unlink(scriptPath).catch((error) => {
    if (error.code !== "ENOENT") {
      throw error;
    }
  });

  if (createdIndex) {
    const currentIndex = await readFile(indexPath, "utf8").catch(() => null);
    if (currentIndex === indexFixture) {
      await unlink(indexPath);
    }
  }

  if (createdPublicDirectory) {
    await rmdir(publicDirectory).catch((error) => {
      if (error.code !== "ENOENT" && error.code !== "ENOTEMPTY") {
        throw error;
      }
    });
  }
});

test("maps the root route to index.html", async () => {
  const response = await fetch(`${baseUrl}/`);

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^text\/html\b/);
});

test("serves JavaScript with the correct content type", async () => {
  const response = await fetch(`${baseUrl}/${scriptName}`);

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("content-type"),
    "text/javascript; charset=utf-8",
  );
  assert.equal(await response.text(), scriptFixture);
});

test("returns a real 404 for a missing route", async () => {
  const response = await fetch(`${baseUrl}/missing-${randomUUID()}.html`);

  assert.equal(response.status, 404);
  assert.equal(await response.text(), "Not Found\n");
});

test("handles HEAD without sending a response body", async () => {
  const response = await fetch(`${baseUrl}/${scriptName}`, { method: "HEAD" });

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("content-length"),
    `${scriptFixture.length}`,
  );
  assert.equal(await response.text(), "");
});

test("rejects unsupported methods", async () => {
  const response = await fetch(`${baseUrl}/`, { method: "POST" });

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
  assert.equal(await response.text(), "Method Not Allowed\n");
});

test("sets browser security and no-cache headers", async () => {
  const response = await fetch(`${baseUrl}/`);

  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(
    response.headers.get("content-security-policy"),
    /default-src 'self'/,
  );
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
});

function requestRawPath(path) {
  const address = server.address();

  return new Promise((resolve, reject) => {
    const outgoingRequest = request(
      {
        host: "127.0.0.1",
        method: "GET",
        path,
        port: address.port,
      },
      (response) => {
        response.resume();
        response.on("end", () => resolve(response));
      },
    );
    outgoingRequest.on("error", reject);
    outgoingRequest.end();
  });
}

test("rejects traversal and dotfile requests", async () => {
  const traversalResponse = await requestRawPath("/%2e%2e/README.md");
  const dotfileResponse = await requestRawPath("/%2eenv");

  assert.equal(traversalResponse.statusCode, 404);
  assert.equal(dotfileResponse.statusCode, 404);
});
