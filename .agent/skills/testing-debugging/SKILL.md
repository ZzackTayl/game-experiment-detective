---
name: testing-debugging
description: Reproduce, classify, test, and debug game, data, browser, storage, server, and asset failures.
---

# Testing and Debugging

Use for failures, regressions, unclear symptoms, and verification planning.

## Read first

1. `package.json` for exact commands
2. `test/engine.test.js` for existing coverage/patterns
3. The routed feature skill
4. The smallest source file owning the symptom

## Baseline command

```sh
npm test
```

This syntax-checks `js/main.js` and `js/engine.js`, then runs Node tests. It does
not currently run a browser, render CSS, test the local server, or inspect assets.

Use:

```sh
npm start
```

for targeted browser validation at `http://localhost:8080`.

## Debugging workflow

1. Record exact case code, starting state, clicks, expected result, and actual
   result.
2. Reproduce on the supported HTTP workflow.
3. Capture the first terminal/Console error exactly.
4. Classify the owner:
   - wrong words/IDs/times → content;
   - wrong legal transition/cost/result → engine;
   - wrong screen/control/focus → UI;
   - wrong appearance/overflow → CSS;
   - lost saved win/reset → persistence;
   - 404/MIME/CSP → server/asset.
5. Inspect only the owner and integration boundary.
6. Write a failing regression test where automation can express the bug.
7. Make the smallest fix.
8. Run all tests.
9. Retest successful, invalid, duplicate, final-action, and failure routes.

## State checklist

For rule bugs, inspect:

- `session.caseId`;
- `session.phase`;
- `session.actionsLeft`;
- `session.completedActions`;
- collected evidence IDs;
- `session.resolvedContradictionIds`;
- `session.hintUsed`;
- `session.result`;
- active `caseData` IDs and contradiction references.

Compare the engine return by identity. A no-op should often be
`next === session`.

## Current automated coverage

`test/engine.test.js` covers current case validation, action cost/no-op behavior,
contradiction order, confrontation, final-action edges, timeline sorting, hints,
accusation gates, wins for every case, bypass prevention, wrong theories, and
selected malformed data.

## Current gaps

Do not claim `npm test` proves:

- DOM/event rendering;
- random selection;
- localStorage behavior/migration;
- all score boundaries;
- server path/header/method behavior;
- browser Console cleanliness;
- keyboard/screen-reader behavior;
- responsive/zoom/forced-color/reduced-motion appearance;
- image/audio/video/font/model loading and fallback.

Use targeted manual checks or add deliberate browser/server tests when scope
justifies them.

## Associated files

| Path | Inspect for | Change when |
| --- | --- | --- |
| `test/engine.test.js` | Existing assertions and helpers | Rule/data regression tests |
| `js/engine.js` | Rule state and validator | Root cause is rule logic |
| `js/cases.js` | IDs/content/timelines | Root cause is authored data |
| `js/main.js` | Browser state/render/events/storage | Root cause is UI/persistence |
| `styles.css` | Responsive/state appearance | Root cause is visual |
| `server.mjs` | HTTP/MIME/CSP/path response | Root cause is server |
| `index.html` | Module shell/CSP/live region | Root cause is permanent shell |
| `package.json` | Exact check sequence | Intentionally changing checks |

## Normally ignore

- Do not rewrite all layers before classifying the symptom.
- Do not fix unrelated formatting or pre-existing issues.
- Do not add a test framework when built-in Node assertions express the case.
- Do not change content to hide an engine bug or CSS to hide invalid state.

## Browser verification

For visible changes:

1. Reload with Console and Network open.
2. Play all affected entry/exit routes.
3. Test empty, normal, locked, completed, error, success, and zero-action states.
4. Use keyboard only.
5. Test 320-pixel and wide layouts, zoom, reduced motion, and forced colors.
6. Test missing optional media and storage denial where relevant.
7. Confirm no horizontal page overflow or new Console/Network errors.

## Good bug report

Return:

- case code and URL;
- exact reproduction steps;
- expected and actual behavior;
- first error and file/line;
- owner layer and root cause;
- changed files;
- automated tests added/run;
- manual routes and display modes checked;
- any known untested area.