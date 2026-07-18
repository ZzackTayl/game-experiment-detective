# The Bell That Drowned

**The Bell That Drowned** is a compact, browser-based narrative investigation
set at Saltmere's midnight records desk. Review a single case file, compare the
evidence, and decide what happened. The experience is built as a zero-dependency
vanilla JavaScript app: no account, installation, build step, or backend is
required.

## Core loop

Serve the game locally:
1. Open the case and work through each phase of the investigation.
2. Inspect evidence and witness statements as they become available.
3. Compare the evidence, interviews, and timeline to form a theory.
4. Name a suspect, support the accusation with evidence, and see how it fits the
   facts.

The vertical slice emphasizes a focused investigation, atmospheric presentation,
and a complete discover-reason-conclude loop. It is one self-contained case, not
a collection of cases or a persistent campaign.

## Features

- A phased case file with evidence, interviews, and timeline views
- Optional hints and a deduction-driven final accusation
- Atmospheric, responsive presentation without a build pipeline
- A complete single-case outcome with a route back to unresolved evidence

## Accessibility

- Pointer and keyboard-friendly investigation controls
- A readable, text-first evidence trail that does not depend on audio
- Clear focus states and semantic controls for assistive technology
- Responsive layouts for desktop and smaller browser windows
- Reduced-motion support for players who request it in their system settings

## Run locally

Opening `index.html` directly is not the supported workflow because browsers may
block its JavaScript modules when they are loaded from a `file://` URL.

> `npm start` is for trusted local development only. The current server exposes
> files from the whole repository and does not explicitly bind to loopback. Do
> not expose its port publicly, share the URL on an untrusted network, or treat
> it as a production server.

## How it works
Node.js 20 or newer is the only prerequisite. There are no packages to install.

```sh
npm run dev
```

Open `http://127.0.0.1:4173` in a browser.

Run the automated checks with:

```sh
npm test
```

The feature and content contract for timeline-based deduction is documented in
`docs/contradiction-system.md`.

## Guides

- Start with `docs/first-run-guide.md` if this is your first time running or
  changing a game project.
- Use `docs/development-bible.md` for the complete plain-language map of the
  project, its concepts, and common changes.
- Use `docs/asset-bible.md` to plan, source, license, prepare, import, and test
  visual, audio, font, video, or possible future 3D assets.
- Use `.agent/skills/game-project-router/SKILL.md` to route an AI assistant to
  the smallest relevant feature skill and source-file set.
## Project structure

```text
public/index.html          Semantic browser shell
public/styles.css          Responsive, accessible visual system
public/app/case-data.js    Authored mystery content
public/app/game-engine.js  Pure game state and deduction rules
public/app/main.js         Browser rendering and interactions
public/app/persistence.js  Validated local autosave adapter
tools/serve.mjs            Dependency-free local static server
test/                      Engine, persistence, and server tests
package.json               Node version and project commands
```

## Current scope

This repository contains the playable vertical slice and its local development
tooling. The scope is deliberately client-side and limited to the single core
investigation; backend services, user accounts, cloud saves, and additional cases
are outside this slice.
