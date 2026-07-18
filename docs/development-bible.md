# Development Bible

This document is the plain-language source map for developing **The Vanishing
Variable**. It explains the ideas a new game developer is likely to meet, how
the current game implements them, what files are connected, and what can break.

For a short setup path, start with the
[First-Run Owner Guide](first-run-guide.md). For media planning, use the
[Asset Bible](asset-bible.md). For the formal deduction contract, use
[Timeline, Contradiction, and Confrontation System](contradiction-system.md).

## 1. The one-minute mental model

The game is an interactive web page:

```text
Browser
  loads index.html
    loads styles.css
    loads js/main.js
      imports authored content from js/cases.js
      imports game rules from js/engine.js
```

During development, `server.mjs` sends those files to the browser. It is a small
local file server, not a game backend. Nothing is compiled.

Think of the project as four layers:

| Layer | Plain meaning | Current file |
| --- | --- | --- |
| Content | The people, places, clues, lies, motives, and solutions | `js/cases.js` |
| Rules | What actions are legal and how a case is won | `js/engine.js` |
| Interface | What the player sees and which controls they use | `js/main.js` |
| Presentation | Color, spacing, type, cards, and responsive layout | `styles.css` |

`index.html` is the permanent page frame. `server.mjs` is local infrastructure.
`test/engine.test.js` checks the content/rule contract.

Keeping those jobs separate is the main architecture rule.

## 2. What this project is not

There is no Godot/GODAP, Unity, Unreal, canvas, WebGL, scene editor, node graph,
physics simulation, animation timeline, database, account system, cloud save,
multiplayer service, dependency framework, or build pipeline.

`js/engine.js` is simply the name of the rules module. It is not a packaged game
engine.

Adding any of those systems later is possible, but it would be a designed
feature or migration. Do not write instructions that imply it already exists.

## 3. Repository map

| Path | Owns | Does not own |
| --- | --- | --- |
| `README.md` | Public project summary and command entry points | Detailed game behavior |
| `index.html` | Page metadata, header, app mount, skip link, live region, base CSP | Individual game screens |
| `styles.css` | All current visual styling and responsive/accessibility media rules | Game truth or scoring |
| `js/main.js` | Browser state, screen rendering, event handling, progress storage | Authored case definitions or pure rule decisions |
| `js/cases.js` | Global suspects/motives/locations and four complete case variants | DOM controls or action algorithms |
| `js/engine.js` | Session shape, action transitions, contradiction, hints, accusation, score, validation | Browser APIs or visual presentation |
| `server.mjs` | Local HTTP file serving, headers, CSP, and known MIME types | Gameplay or production hosting |
| `test/engine.test.js` | Executable rule and case-data expectations | Browser layout and visual quality |
| `docs/contradiction-system.md` | Formal deduction and accessibility contract | General setup or asset sourcing |
| `docs/asset-bible.md` | Media categories, sources, rights, formats, budgets, and import workflow | Current gameplay rules |
| `.agent/skills/` | Project-local task instructions for AI assistants | Runtime game code |

## 4. Player experience and guarded screen flow

The current routed UI flow, plus one guarded engine edge, is:

```text
Home
  → Briefing
    → Investigation
      → Accusation
        → Result

Engine-only guarded edge: no actions and no confrontation
  → Exhausted result (not reachable through the current legal UI action set)
```

These are logical screens, not separate HTML files. `render()` in `js/main.js`
chooses a render function from the current `screen` string and replaces the
contents of `<main id="app">`.

| Screen | Renderer | Purpose |
| --- | --- | --- |
| Home | `renderHome()` | Premise, solved count, start, and reset |
| Briefing | `renderBriefing()` | Incident rules and four suspect profiles |
| Investigation | `renderInvestigation()` | Searches, interviews, casebook, contradiction, confrontation, hint, accusation gate |
| Accusation | `renderAccusation()` | Suspect, motive, and exactly two evidence choices |
| Exhausted | `renderExhausted()` | Dormant failure UI for zero actions without confrontation |
| Result | `renderResult()` | Win/loss, score, rank, resolution, and deduction breakdown |

The engine and renderer support `exhausted`, and tests create that state
synthetically. It is not reachable through the current legal player action
inventory: five searches, four interviews, and the one two-action hint spend at
most 11 actions without confrontation. Treat it as a guarded edge/future state,
not a normal manual route, unless the action economy changes.

One delegated click listener and one delegated submit listener near the bottom of
`js/main.js` handle controls created by all renderers.

### Why the UI is rebuilt

Every transition calls `render()`, which creates a fresh set of DOM elements.
This keeps a small app simple. It also means:

- do not keep important state only on an element;
- do not attach a separate listener to every temporary card unless there is a
  strong reason;
- put durable session truth in `session`;
- restore focus deliberately after rerendering;
- optional media components must be recreated safely and cheaply.

## 5. Content model

### Global lists

At the top of `js/cases.js`:

- `suspects` defines four reusable people;
- `motives` defines four accusation choices;
- `locations` defines five searchable places;
- `shared` holds repeated clue copy used by more than one case.

Each item has a stable lowercase ID. For example:

```js
{
  id: "mina",
  name: "Mina Park",
  role: "Lead data scientist",
  profile: "..."
}
```

An ID is an internal connection point. A display name can change without
rewiring the game; an ID change can affect case references, action keys, tests,
assets, and saved progress.

### Case variants

The exported `cases` array currently contains `echo-a`, `echo-b`, `echo-c`, and
`echo-d`. A case object includes:

| Field | Meaning |
| --- | --- |
| `id` | Stable storage and lookup key |
| `code` | Player-facing short case label |
| `culpritId` | Correct suspect ID |
| `motiveId` | Correct motive ID |
| `keyEvidenceIds` | Exactly three decisive clue IDs |
| `resolution` | Final explanation |
| `locationEvidence` | One clue for every global location |
| `interviews` | One clue for every global suspect |
| `timeline` | Time/status metadata for every base clue |
| `contradiction` | The lie, its two prerequisites, and confrontation |

`casesById` is generated from `cases`. Do not maintain a second manual index.

### Evidence

A base evidence object has:

```js
{
  id: "mina-alibi",
  title: "Staged Break-Room Alibi",
  body: "..."
}
```

Its timeline metadata lives in the case's `timeline` map:

```js
"mina-alibi": {
  start: "22:12",
  end: "22:26",
  status: "verified"
}
```

`end` is optional. Current statuses are:

- `verified`: supported directly by a record or observation;
- `claimed`: somebody says it happened;
- `inferred`: evidence implies it;
- `admitted`: a person acknowledges it.

Times must be 24-hour `HH:mm` values within the current incident window from
`22:05` to `22:26`. The interface displays friendlier 12-hour narrative times.

### Contradiction and confrontation

Each current case has exactly one contradiction:

```js
contradiction: {
  id: "mina-breakroom-alibi",
  suspectId: "mina",
  prerequisiteIds: ["mina-statement", "mina-alibi"],
  title: "...",
  body: "...",
  prompt: "...",
  confrontation: {
    id: "mina-confrontation",
    title: "...",
    body: "...",
    timeline: { start: "22:16", end: "22:19", status: "admitted" }
  }
}
```

The two prerequisite IDs must be different base clues. Collecting both exposes
the contradiction in either order. The confrontation then costs one action and
adds its own decisive evidence.

### Decisive evidence

Every current case must list exactly three different `keyEvidenceIds`, including
the confrontation evidence. A winning accusation submits exactly two decisive
clues, and one must be the confrontation evidence.

This design makes the lie and the player's active challenge essential. Two
ordinary clues cannot bypass confrontation.

## 6. Session state and state machines

A **state** is the information needed to describe the game right now. A **state
machine** is a set of allowed states and transitions between them.

`createSession(caseId)` in `js/engine.js` returns:

| Field | Meaning |
| --- | --- |
| `caseId` | Active variant |
| `phase` | Current rule phase |
| `actionsLeft` | Remaining budget, initially 12 |
| `completedActions` | Search/interview/confrontation keys already used |
| `evidence` | Collected evidence with source and timeline metadata |
| `resolvedContradictionIds` | Contradictions whose prerequisites were collected |
| `hintUsed` | Whether the one hint was spent |
| `result` | Final evaluation, or `null` |

Current phases are:

```text
investigating → accusing → resolved
       └───────────────→ exhausted
```

The interface's `screen` string normally follows the session phase, but briefing
and home are interface-only screens outside an active rule session.

### Immutability

Valid engine operations return a new session object. Invalid, repeated, locked,
or out-of-phase operations return the exact original object.

The interface checks:

```js
if (next !== session) {
  session = next;
  // Announce and render the successful transition.
}
```

Do not mutate arrays inside `session` in place. Do not return a new object for an
invalid no-op unless all callers and tests are intentionally redesigned.

## 7. Action economy

`MAX_ACTIONS` in `js/engine.js` is 12.

| Action | Cost | Repeatable? |
| --- | --- | --- |
| Search one location | 1 | No |
| Interview one suspect | 1 | No |
| Confront unlocked suspect | 1 | No |
| Request the one hint | 2 | No |
| Enter/leave accusation | 0 | As phase/actions allow |
| Submit accusation | 0 | Incomplete form can be corrected; a structurally valid theory resolves |

When an action reaches zero:

- completed confrontation means phase becomes `accusing`;
- no completed confrontation means phase becomes `exhausted`.

Finding the second contradiction clue on the final action does not grant a free
confrontation.

### Duplicated visible numbers

`MAX_ACTIONS` is the rule source, but visible "12" text also exists in
`renderHome()`, `renderBriefing()`, the start announcement, and `renderResult()`.
Changing the budget requires synchronizing those strings or refactoring the UI
to import the constant.

## 8. Hints

`requestHint()`:

1. works only while investigating;
2. works only once;
3. requires at least two actions;
4. points to a missing contradiction prerequisite first;
5. points to the unlocked confrontation next;
6. otherwise points to another uncollected decisive clue;
7. spends two actions and can therefore end the investigation.

Hints currently reveal a productive action in text. They do not collect evidence.

## 9. Accusation, win, score, and rank

The accusation form requires:

1. one suspect;
2. one motive;
3. exactly two different clues already in the player's casebook.

`evaluateAccusation()` independently verifies the phase and confrontation. Do not
trust only a disabled UI button for rule enforcement.

A win requires:

- correct suspect;
- correct motive;
- two decisive evidence IDs;
- confrontation evidence among those two.

The score is:

```text
1000
- 50 for every action used
- 150 if a hint was used
+ 100 if all three decisive clues were collected
```

The score cannot be below zero. Ranks are:

| Score | Rank |
| --- | --- |
| 900 or more | Master Detective |
| 700–899 | Sharp Investigator |
| 500–699 | Case Closed |
| Below 500 | Messy but Proven |

The game computes a score for any resolved accusation, even a loss. Only winning
best scores are saved.

## 10. Browser interface concepts

### DOM

The Document Object Model, or DOM, is the browser's tree of page elements.
`element()` and `button()` in `js/main.js` create native elements. Text uses
`textContent` or text nodes, not HTML string injection.

### Event delegation

Controls receive a `data-action` value, such as:

```text
start
search:archive
interview:mina
confront:mina
accuse
```

One listener on `#app` finds the nearest control, splits the action at `:`, calls
the relevant rule function, and rerenders.

When adding an action:

1. choose a clear `data-action`;
2. add one handler branch;
3. keep rule decisions in `js/engine.js` when they affect game legality;
4. announce important results;
5. restore useful focus;
6. add tests.

### Focus

Focus is the element currently receiving keyboard input. The game:

- makes `<main>` focusable;
- focuses it on explicit starts, returns, and selected phase changes;
- focuses newly collected evidence headings while the investigation screen
  remains active;
- focuses accusation errors;
- shows a visible `:focus-visible` outline.

If a confrontation spends the final action, the interface moves directly to
accusation and focuses `<main>` instead of a timeline heading that is no longer
rendered. Do not remove focus without replacing it with an intentional
destination.

One current exception needs care: after confrontation is already complete, an
ordinary search/interview that spends the final action moves directly to
accusation through `render()` without explicitly focusing `<main>`. Keyboard
navigation can continue by tabbing, but focus restoration is less deliberate
than the other transitions. Treat this as a known accessibility gap when
changing screen routing.

### Live region

`#announcer` in `index.html` is visually hidden and uses `aria-live="polite"`.
`announce()` updates it after meaningful changes. Do not announce every cosmetic
update, and do not make visual text the only way an important unlock is conveyed.

## 11. CSS and responsive design

`styles.css` starts with custom properties such as `--ink`, `--paper`, and
`--accent`. Reusing those variables keeps the visual language consistent.

Important layout behavior:

- fluid type and padding use `clamp()`;
- suspect cards auto-fit;
- the investigation is one column by default;
- at 62rem it becomes a two-column layout with a sticky casebook;
- below 38rem, action cards and stats stack;
- the formal contract requires usability at 320 CSS pixels.

Accessibility media rules:

- `prefers-reduced-motion` minimizes animation and transitions;
- `forced-colors` restores system colors and clear borders.

A visual change is not done because it looks good on one laptop. Check narrow
width, wide width, zoom, keyboard focus, long text, reduced motion, and forced
colors.

## 12. Accessibility is game functionality

Accessibility means the game remains understandable and operable for players
using keyboards, zoom, screen readers, high contrast, reduced motion, or narrow
screens.

Current rules to preserve:

- use native buttons, links, radios, checkboxes, fieldsets, legends, headings,
  ordered lists, and `<time>`;
- keep visible labels;
- do not use only color, sound, portrait expression, or an image to prove a clue;
- preserve clue title, body, time, status, and source as text;
- keep minimum practical control size and visible focus;
- announce contradiction and transition changes;
- use concise alt text for meaningful images and `alt=""` for decorative images;
- caption or transcribe meaningful audio/video;
- keep all routes free of horizontal page overflow at 320 CSS pixels.

The automated tests do not prove these browser behaviors. Manual or future
browser automation is required.

## 13. Persistence and save data

`loadProgress()` and `saveProgress()` in `js/main.js` use browser `localStorage`
with this key:

```text
game-experiment-detective:v1
```

Saved shape:

```js
{
  solved: ["echo-a"],
  bestScores: {
    "echo-a": 900
  }
}
```

Current behavior:

- a win saves the case ID and highest winning score;
- reset clears both fields;
- invalid/old case IDs are filtered from `solved`;
- storage parse/read/write errors do not stop play;
- active session, current screen, clues, actions, losses, and form selections are
  not saved;
- best scores are stored but not displayed;
- storage is local to one browser origin.

Changing the storage shape requires a version/migration decision. Do not reuse
`:v1` for incompatible data while assuming old users will load correctly.

## 14. Local server, URLs, CSP, and MIME types

`server.mjs` serves files from the repository on port 8080.

It currently:

- accepts GET and HEAD;
- returns 405 for other methods;
- maps `/` to `index.html`;
- returns 404 for missing/non-file paths;
- rejects basic path traversal and NUL input;
- sets a Content Security Policy;
- sets `X-Content-Type-Options: nosniff`;
- recognizes MIME types for HTML, CSS, JavaScript, and JSON.

### URL

A URL is the address the browser requests, such as:

```text
http://localhost:8080/js/main.js
```

Runtime asset paths should be relative repository paths, not paths from one
developer's computer.

### MIME type

A MIME type tells the browser what kind of file it received. New image, audio,
video, font, or model extensions may need mappings in `server.mjs`. With
`nosniff`, a wrong type can cause a valid file to be rejected.

### Content Security Policy

CSP limits where scripts, styles, and media may come from. The policy exists in
both `index.html` and `server.mjs`; keep both copies synchronized.

The current policy favors self-hosted files. Do not weaken it merely to hotlink
an asset or call a generation service from the shipped browser.

### Development server warning

The current server uses the whole repository as its file root and is not a
production deployment design. Treat it as local development infrastructure. A
public deployment should define an allowlisted public directory, production
headers/caching/compression, host/TLS behavior, and tests rather than exposing
the repository.

## 15. Assets

The current game has no runtime image, audio, video, custom font, or model files.
Its CSS-only presentation is a valid, complete placeholder.

Before adding assets:

1. choose a named scene and content ID;
2. verify rights and record provenance;
3. preserve an appropriate editable source;
4. export an optimized web runtime file;
5. self-host it under a deliberate `assets/` structure;
6. add MIME support if required;
7. connect it through reusable UI/data code;
8. retain text and missing-media fallbacks;
9. test network, console, performance, accessibility, and every affected route.

The [Asset Bible](asset-bible.md) provides category lists, directory proposals,
formats, practical starting budgets, ElevenLabs and other AI-tool workflows,
library comparisons, rights checks, and step-by-step import instructions.

## 16. Testing and what "passing" means

Run:

```sh
npm test
```

The current suite verifies:

- authored cases pass implemented validation;
- investigation actions cost one and cannot repeat;
- contradictions unlock in either clue order;
- confrontation locks, cost, evidence, and repeat behavior;
- final-action confrontation and exhaustion edge cases;
- chronological non-mutating timeline sorting;
- hint priority and two-action cost;
- accusation gating and exactly-two-evidence requirement;
- winning flow across all variants;
- confrontation evidence cannot be bypassed;
- wrong theories resolve safely;
- selected malformed data produces validation errors.

It does **not** currently verify:

- DOM rendering or click/submit wiring;
- browser storage migration/failure/reset;
- random case selection;
- all score/rank boundaries;
- browser loading or console errors;
- server behavior;
- keyboard/screen-reader behavior;
- visual appearance, zoom, 320-pixel overflow, forced colors, or reduced motion;
- asset loading, codec support, performance, or missing-media fallbacks.

A complete change uses automated tests plus targeted browser checks.

## 17. Debugging method

Debugging means finding the first incorrect assumption, not guessing at random.

Use this order:

1. **Reproduce:** write exact clicks, case code, expected result, and actual
   result.
2. **Classify:** content, rule, interface, style, storage, server, or asset?
3. **Read the first error:** Console or terminal, including file and line.
4. **Inspect state:** case ID, phase, actions, evidence IDs, completed actions,
   and contradiction IDs.
5. **Compare source of truth:** case data versus engine gate versus UI display.
6. **Make the smallest fix:** do not redesign three layers for one bad clue ID.
7. **Add a regression test:** especially for rules/data.
8. **Retest both success and failure paths.**

### Symptom routing

| Symptom | Inspect first |
| --- | --- |
| Wrong clue text/person/time | `js/cases.js` |
| Legal action blocked or illegal action allowed | `js/engine.js` and session phase |
| Rule is correct but button/screen is wrong | `js/main.js` |
| Layout/color/focus appearance is wrong | `styles.css` and rendered DOM |
| Reload loses solved progress | `loadProgress()`, `saveProgress()`, browser origin/storage |
| File is 404 or rejected | Network panel, path casing, `server.mjs` |
| CSP error | Both policy copies in `index.html` and `server.mjs` |
| New media is blank/silent | Asset path, MIME, codec, CSP, fallback, user playback permission |

## 18. Common change recipes

### Change story wording without changing rules

Inspect `js/cases.js` and edit `name`, `profile`, `detail`, `title`, `body`,
`prompt`, or `resolution`. Keep IDs, timeline facts, contradiction logic, and
solution references consistent. Run tests and play the affected case.

### Add a fifth case

1. Copy the shape of one complete case object.
2. Give it a new stable case ID and player code.
3. Provide all five location clues and all four interviews.
4. Give every base clue a timeline entry.
5. Define one contradiction with two distinct base prerequisites.
6. Define one confrontation with inline timeline metadata.
7. Define exactly three distinct decisive IDs including the confrontation.
8. Set a valid culprit and motive.
9. Run `validateCaseData()` through `npm test`.
10. Add tests for its winning path and special logic.
11. Play the full variant and verify narrative consistency.

The current validator does not check every cross-reference or global-list
completeness, so tests and review remain necessary.

### Change action budget

Change `MAX_ACTIONS` in `js/engine.js`, replace duplicated visible "12" text in
`js/main.js`, update tests that assume the budget, and retest hint/exhaustion/
final-action/score behavior. Prefer a later refactor that imports the constant
into the UI.

### Add a new screen

Define who owns its state, create a render function in `js/main.js`, route it in
`render()`, add semantic controls/events, update focus/live announcements, style
it in `styles.css`, and test every way into and out of it. Put new legality in
the engine rather than only in the renderer.

### Add audio

Do not begin by playing one file directly from every button. Follow the Asset
Bible. Add one audio manager, user-initiated playback, visible mute/volume,
persistence, scene/cue rules, text equivalents, loading failure behavior, MIME
types, and browser tests.

### Add a portrait or location image

Add optional metadata close to the matching suspect/location object in
`js/cases.js`, render through one reusable helper in `js/main.js`, style in
`styles.css`, preserve names/details as text, handle a missing file, add MIME
support, and test all scenes using that item.

### Add active-session saving

This crosses UI, state, schema, migration, security/privacy, and testing. Decide:

- when to save;
- what case/content version means;
- how invalid or changed evidence IDs recover;
- whether accusation form choices save;
- whether "new case" discards a save;
- how reset and storage failure behave.

Do not serialize blindly and call it complete.

## 19. Files to ignore for focused work

Ignoring unrelated files prevents accidental scope growth:

- narrative-only changes normally do not need `server.mjs`;
- pure style changes normally do not need `js/engine.js`;
- asset replacements normally do not need game-rule edits;
- rule changes normally do not need `index.html` unless shell/security behavior
  changes;
- do not edit `.git/` or tooling-owned internal skill directories;
- do not add generated dependency, build, coverage, or editor-cache directories.

The feature skills under `.agent/skills/` give more exact read/change/ignore
maps.

## 20. Definition of done

A change is done when:

- its owner layer is clear;
- content and rule IDs remain consistent;
- `npm test` passes;
- the game starts with `npm start`;
- Console and Network have no new errors;
- every affected route works;
- invalid, duplicate, missing, or exhausted behavior is safe;
- keyboard focus and announcements still make sense;
- the 320-pixel layout and wide layout work;
- assets have rights/provenance, optimization, MIME, fallback, and accessibility;
- documentation changed when the public workflow or feature contract changed;
- unrelated experiments and files are removed.

## 21. Glossary

| Term | Simple meaning in this project |
| --- | --- |
| Asset | An image, icon, font, sound, video, or possible model used by the game |
| Browser | The current runtime/game engine that displays and executes the app |
| Build | A generated production output; this project does not currently have one |
| Case variant | One authored culprit/motive/contradiction solution using the shared setting |
| CSP | A browser security rule limiting where content can load from |
| DOM | The browser's tree of HTML elements |
| Evidence ID | A stable internal name connecting clue data, timelines, rules, tests, and assets |
| Event | A click, submit, key activation, or browser occurrence handled by code |
| Immutable update | Creating a new state object instead of changing the old object in place |
| localStorage | Small browser storage used for solved cases and best winning scores |
| MIME type | A response label telling the browser which kind of file it received |
| Module | A JavaScript file that imports or exports values |
| Phase | The rule state: investigating, accusing, exhausted, or resolved |
| Renderer | A function that creates one visible logical screen |
| Responsive | Able to adapt to narrow and wide screens |
| Runtime | Where the game executes; currently the web browser |
| Schema | The expected fields and relationships in a data object |
| Server | The local Node program that sends repository files over HTTP |
| Source of truth | The one authoritative location for a fact or rule |
| State | Data describing the current session and progress |
| Test | Code that checks a behavior and reports failure automatically |

## 22. AI routing

An AI assistant should begin with
`.agent/skills/game-project-router/SKILL.md`. The router chooses the smallest
feature skill, names required source files, and separates files to inspect from
files to change or ignore. This prevents a styling request from drifting into
game rules or an asset request from inventing a nonexistent Godot workflow.