---
name: project-setup
description: Run, inspect, and explain the current browser game for a first-time owner without inventing engine or build steps.
---

# Project Setup

Use for first run, local tooling, editor questions, command explanations, and
basic owner onboarding.

## Read first

1. `docs/first-run-guide.md`
2. `README.md`
3. `package.json`
4. `server.mjs` only if serving fails

## Current setup truth

- Runtime: modern web browser.
- Local tooling: Node.js and npm.
- Dependencies: none.
- Build step: none.
- Install command: none required.
- Start command: `npm start`.
- Test command: `npm test`.
- Default URL: `http://localhost:8080`.
- Default port override: `PORT=<number> npm start` on macOS/Linux.
- Godot/GODAP: not present and not required.

Do not tell a beginner to run `npm install` as ritual. It adds no value to the
current dependency-free package.

`npm start` is for trusted local development only. The server currently exposes
the repository directory and does not explicitly bind to loopback. Do not expose
the port publicly, share it on an untrusted network, or describe it as
production hosting.

## Setup workflow

1. Confirm repository root contains `package.json`, `index.html`, and `js/`.
2. Check `node --version` and `npm --version`.
3. Run `npm test` before edits.
4. Run `npm start` and keep its terminal open.
5. Open the printed HTTP URL.
6. Play home → briefing → investigation → confrontation → accusation → result.
7. Open browser Console, Network, and Storage panels.
8. Stop with `Ctrl+C`.

Do not recommend opening `index.html` through `file://`; browser module security
may leave the app blank.

## Associated files

| Path | Inspect for | Change only for |
| --- | --- | --- |
| `README.md` | Public quick start | Public command/workflow changes |
| `docs/first-run-guide.md` | Full beginner route and troubleshooting | Verified setup or owner-workflow changes |
| `package.json` | Exact saved commands | Intentional command/dependency changes |
| `server.mjs` | Port and serving errors | Local server behavior |
| `index.html` | Module entry and page shell | Permanent shell/module loading changes |
| `js/main.js` | Initial render if page loads but app fails | Actual interface bug, not setup prose |

## Normally ignore

- `js/cases.js` and `js/engine.js` for Node/port/editor setup.
- `styles.css` unless the page runs but presentation is the reported problem.
- `test/engine.test.js` unless tests fail.
- Proposed asset directories when no asset is being added.

## Failure routing

| Symptom | Next check |
| --- | --- |
| `node`/`npm` not found | Install/reopen terminal; do not edit repository |
| `EADDRINUSE` or port busy | Stop competing process or use another port |
| Browser cannot connect | Confirm server terminal is still running and URL/port matches |
| Blank `file://` page | Use `npm start` and HTTP URL |
| Served page blank | Console first error, Network failed modules, then `npm test` |
| Game works but reload loses active case | Expected; route to persistence skill |
| Image/audio rejected | Route to asset and local-server skills |

## Verification

At minimum:

```sh
npm test
npm start
```

Then verify the page loads over HTTP with no Console or Network errors. Setup
work is not verified merely because the server printed its URL.