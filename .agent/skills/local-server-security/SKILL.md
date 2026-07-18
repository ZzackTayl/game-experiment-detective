---
name: local-server-security
description: Change or debug local HTTP serving, ports, paths, MIME types, CSP, headers, and deployment boundaries.
---

# Local Server and Security

Use for local HTTP, port conflicts, 404/405, MIME errors, CSP, headers, file
exposure, or hosting questions.

## Read first

1. `server.mjs`
2. CSP meta tag in `index.html`
3. `package.json`
4. The exact browser Network/Console error
5. `docs/asset-bible.md` for media file types

## Current server behavior

- Root is the repository directory.
- Default port is 8080 or numeric `process.env.PORT`.
- `/` maps to `index.html`.
- GET and HEAD are supported.
- Other methods receive 405.
- Missing/non-file paths receive 404.
- Basic normalized traversal/NUL input is rejected.
- Known MIME types: `.html`, `.css`, `.js`, `.json`.
- Unknown extensions receive `application/octet-stream`.
- Responses include CSP and `X-Content-Type-Options: nosniff`.

The server is local development infrastructure, not a production hosting plan.
Because its file root is the whole repository and it does not explicitly bind to
loopback, do not expose it publicly as-is.

## CSP synchronization

The policy is duplicated:

- meta policy in `index.html`;
- response header in `server.mjs`.

Keep them synchronized. Prefer self-hosted assets. Do not add broad `*`,
`unsafe-inline`, or remote domains merely to bypass an integration problem.

## MIME workflow

When adding a file extension:

1. Verify its registered MIME type.
2. Add only the used extension mapping to `types` in `server.mjs`.
3. Serve the exact file.
4. Inspect response `Content-Type` in Network.
5. Confirm `nosniff` causes no rejection.
6. Confirm browser codec/format support separately.

An `.ogg` MIME mapping does not prove the contained codec works in every target
browser.

## Associated files

| Path | Inspect | Change |
| --- | --- | --- |
| `server.mjs` | Always | Primary server behavior |
| `index.html` | CSP copy and module/static URLs | Synchronized CSP or shell URLs |
| `package.json` | `npm start` command | Start/check scripts |
| `docs/asset-bible.md` | Expected media mappings/workflow | Policy/workflow change |
| `js/main.js` | Requested runtime URLs | Only if URL construction/integration is wrong |
| `styles.css` | CSS asset URLs | Only if stylesheet URL is wrong |

## Normally ignore

- `js/engine.js`, case solutions, and scoring.
- `test/engine.test.js` unless data rules also change.
- CSP weakening for remote asset hotlinks.
- Production-specific configuration without a selected hosting target.

## Production decision checklist

Before calling deployment safe, decide and test:

- allowlisted public file root;
- dotfile, source, docs, tests, and source-map exposure;
- symlink/path behavior;
- explicit bind host and TLS termination;
- cache and compression policy;
- security headers;
- SPA/fallback behavior if introduced;
- error logging and monitoring;
- target platform/browser support;
- immutable asset naming/versioning;
- server and integration tests.

Do not imply the current local server supplies those features.

## Verification

Run `npm test`, then start the server and inspect:

- GET `/`;
- HEAD on a known file;
- content type for each new extension;
- CSP and `nosniff`;
- missing file behavior;
- malformed/path traversal input for path-related changes;
- browser Console and Network;
- actual player route consuming the file.