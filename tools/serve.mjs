import { readFile, realpath, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const DEFAULT_PORT = 4173;
const PUBLIC_DIRECTORY = fileURLToPath(new URL("../public/", import.meta.url));

const CONTENT_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".wav", "audio/wav"],
  [".mp3", "audio/mpeg"],
  [".ogg", "audio/ogg"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

const SECURITY_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'none'",
    "connect-src 'self'",
    "font-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "media-src 'self'",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
  ].join("; "),
  Expires: "0",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  Pragma: "no-cache",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

function requestPath(requestUrl) {
  const pathEnd = requestUrl.search(/[?#]/);
  const rawPath = pathEnd === -1 ? requestUrl : requestUrl.slice(0, pathEnd);

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch {
    return null;
  }

  if (
    !decodedPath.startsWith("/") ||
    decodedPath.includes("\0") ||
    decodedPath.includes("\\")
  ) {
    return null;
  }

  const segments = decodedPath.split("/").filter(Boolean);
  if (segments.some((segment) => segment.startsWith("."))) {
    return null;
  }

  return segments.length === 0 ? "index.html" : segments.join("/");
}

function isWithinDirectory(directory, candidate) {
  const pathFromDirectory = relative(directory, candidate);
  return (
    pathFromDirectory === "" ||
    (!pathFromDirectory.startsWith("..") && !isAbsolute(pathFromDirectory))
  );
}

async function loadPublicFile(relativePath) {
  let publicDirectory;
  let filePath;

  try {
    publicDirectory = await realpath(PUBLIC_DIRECTORY);
    const candidate = resolve(publicDirectory, relativePath);
    if (!isWithinDirectory(publicDirectory, candidate)) {
      return null;
    }

    filePath = await realpath(candidate);
    if (!isWithinDirectory(publicDirectory, filePath)) {
      return null;
    }

    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) {
      return null;
    }

    return {
      body: await readFile(filePath),
      contentType:
        CONTENT_TYPES.get(extname(filePath).toLowerCase()) ??
        "application/octet-stream",
    };
  } catch (error) {
    if (
      error.code === "ENOENT" ||
      error.code === "ENOTDIR" ||
      error.code === "EACCES"
    ) {
      return null;
    }
    throw error;
  }
}

function send(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    ...SECURITY_HEADERS,
    "Content-Length": Buffer.byteLength(body),
    ...headers,
  });
  response.end(body);
}

async function handleRequest(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    send(response, 405, "Method Not Allowed\n", {
      Allow: "GET, HEAD",
      "Content-Type": "text/plain; charset=utf-8",
    });
    return;
  }

  const relativePath = requestPath(request.url ?? "/");
  if (relativePath === null) {
    send(response, 404, "Not Found\n", {
      "Content-Type": "text/plain; charset=utf-8",
    });
    return;
  }

  const file = await loadPublicFile(relativePath);
  if (file === null) {
    send(response, 404, "Not Found\n", {
      "Content-Type": "text/plain; charset=utf-8",
    });
    return;
  }

  response.writeHead(200, {
    ...SECURITY_HEADERS,
    "Content-Length": file.body.byteLength,
    "Content-Type": file.contentType,
  });
  response.end(request.method === "HEAD" ? undefined : file.body);
}

export function createStaticServer(options = {}) {
  return createServer(options, (request, response) => {
    void handleRequest(request, response).catch(() => {
      if (!response.headersSent) {
        send(response, 500, "Internal Server Error\n", {
          "Content-Type": "text/plain; charset=utf-8",
        });
      } else {
        response.destroy();
      }
    });
  });
}

function portFromEnvironment(value) {
  if (value === undefined || value === "") {
    return DEFAULT_PORT;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new RangeError(`PORT must be an integer between 0 and 65535: ${value}`);
  }
  return port;
}

const isDirectRun =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const port = portFromEnvironment(process.env.PORT);
  const server = createStaticServer();

  server.on("error", (error) => {
    console.error(`Static server failed: ${error.message}`);
    process.exitCode = 1;
  });

  server.listen(port, HOST, () => {
    const address = server.address();
    const listeningPort =
      typeof address === "object" && address !== null ? address.port : port;
    console.log(`The Bell That Drowned is available at http://${HOST}:${listeningPort}`);
  });
}