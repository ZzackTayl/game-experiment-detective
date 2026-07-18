---
name: browser-ui-accessibility
description: Change screens, DOM controls, browser events, styling, responsiveness, focus, and accessible feedback.
---

# Browser UI and Accessibility

Use for player-visible screens and interaction that do not primarily redefine
game legality.

## Read first

1. `index.html`
2. Relevant renderer and event branch in `js/main.js`
3. Relevant selectors/media rules in `styles.css`
4. Engine function called by the control
5. `docs/contradiction-system.md` for deduction UI
6. `docs/asset-bible.md` when media is involved

## Current UI architecture

- `index.html` holds the permanent header, `<main id="app">`, skip link, and live
  region.
- `js/main.js` creates all logical screens with DOM APIs.
- `render()` replaces app contents based on `screen`.
- `element()`, `button()`, and `labeledChoice()` are reusable helpers.
- One click listener handles `data-action` controls.
- One submit listener handles the accusation form.
- `styles.css` owns all visual layout.

Do not create separate HTML pages for an ordinary screen. Do not use `innerHTML`
for authored or dynamic text.

## Screen and nested-region map

`render()` routes Home, Briefing, Investigation, Accusation, Exhausted, and
Result. Timeline and Contradiction are nested regions inside Investigation.

| Screen or region | Function | Rule/data dependencies |
| --- | --- | --- |
| Home | `renderHome()` | `progress`, `chooseCase()` |
| Briefing | `renderBriefing()` | `suspects` |
| Investigation | `renderInvestigation()` | session, locations, suspects, engine gates |
| Timeline | `renderTimeline()` | `getEvidenceTimeline()` |
| Contradiction | `renderContradiction()` | case contradiction and session IDs |
| Accusation | `renderAccusation()` | suspects, motives, collected evidence |
| Dormant Exhausted | `renderExhausted()` | guarded exhausted phase; not reachable through the current legal action inventory |
| Result | `renderResult()` | case solution and session result |

## Accessibility contract

Preserve:

- native controls rather than clickable generic containers;
- semantic headings and regions;
- fieldsets, legends, labels, radios, and checkboxes;
- ordered timeline and `<time>`;
- visible focus;
- skip link and focusable main;
- polite announcements for important changes;
- focused error message after invalid accusation;
- focused new evidence after collection while Investigation remains active;
- focused main region when a final-action confrontation transitions directly to
  Accusation;
- textual locked/completed/status labels;
- text equivalents for every required media fact;
- keyboard activation and logical focus order;
- 320-CSS-pixel no-overflow behavior;
- reduced-motion and forced-colors support.

Do not make color, icon, sound, animation, or portrait expression the only way to
identify a state or clue.

### Known current focus gap

After confrontation is complete, a search/interview that spends the final action
routes to Accusation through `render()` without `focusMain`. This can leave focus
without an intentional restored destination after the activated control is
removed. Do not copy this behavior into new transitions; fix or regression-test
it when changing that event path.

## UI change workflow

1. Name the current and desired player behavior.
2. Confirm whether rule legality changes. If yes, load gameplay-rules skill.
3. Find the smallest renderer/helper/event branch.
4. Use native DOM creation and safe text assignment.
5. Use or add one reusable component rather than duplicate markup.
6. Decide post-render focus.
7. Decide whether the live region should announce the change.
8. Add/adjust CSS using existing variables and class conventions.
9. Verify narrow/wide, zoom, long text, keyboard, focus, reduced motion, and
   forced colors.
10. Check Console and test success/error/empty/disabled states.

## Associated files

| Path | Inspect | Change |
| --- | --- | --- |
| `js/main.js` | Always | Primary screen/events/browser-state implementation |
| `styles.css` | Always for visual work | Primary presentation/responsive rules |
| `index.html` | Permanent shell, semantics, CSP | Only permanent shell/meta/live-region changes |
| `js/engine.js` | Rule function contracts | Only when legality/state transitions change |
| `js/cases.js` | Data rendered by the component | Only when UI needs intentional metadata |
| `docs/contradiction-system.md` | Deduction accessibility requirements | Contract changes |
| `docs/asset-bible.md` | Media alt/fallback/loading rules | Media workflow changes |
| `test/engine.test.js` | Rule regression coverage | Only for rule/schema changes |

## Normally ignore

- `server.mjs` unless the UI adds a file type or changes CSP.
- `package.json` for native DOM/CSS work.
- `js/engine.js` for purely visual layout.
- Case solution data for generic styling.

## Manual validation matrix

Check each affected state:

- empty;
- normal;
- completed;
- disabled/locked;
- error;
- success;
- zero actions;
- long content;
- missing optional media.

Check input/display modes:

- mouse/pointer;
- keyboard only;
- 320-pixel width;
- wide desktop;
- browser zoom;
- reduced motion;
- forced colors/high contrast;
- screen-reader-oriented semantic inspection.

Run `npm test`, but state clearly that the current tests do not render the DOM or
judge CSS.