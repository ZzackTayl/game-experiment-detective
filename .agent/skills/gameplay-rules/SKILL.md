---
name: gameplay-rules
description: Change or debug sessions, actions, phases, contradictions, hints, accusations, scoring, ranks, and case validation.
---

# Gameplay Rules

Use when the question is what the player may do, what it costs, how state
changes, or how a result is judged.

## Read first

1. `docs/contradiction-system.md`
2. `js/engine.js`
3. `test/engine.test.js`
4. Relevant event/render paths in `js/main.js`
5. Relevant case data in `js/cases.js`

## Rule ownership

| Rule area | Source |
| --- | --- |
| Initial action budget/session fields | `MAX_ACTIONS`, `createSession()` |
| Evidence collection and duplicate prevention | `performInvestigation()`, `addEvidence()` |
| Contradiction detection | `findResolvedContradictionIds()` |
| Confrontation lock/completion | `getConfrontationAvailability()`, `performConfrontation()` |
| Zero-action phase | `phaseAfterAction()` |
| Timeline ordering | `getEvidenceTimeline()` |
| Hint priority/cost | `requestHint()` |
| Accusation gate/phase | `canAccuse()`, `enterAccusation()`, `leaveAccusation()` |
| Win/score/rank | `evaluateAccusation()` |
| Authored-data validation | `validateCaseData()` |

Keep legal decisions here instead of only hiding/disabling a browser control.

## Invariants

- Valid transitions return a new session.
- Invalid, duplicate, locked, unknown, or wrong-phase transitions return the
  exact original session.
- Never mutate session arrays in place.
- Actions never drop below zero.
- Search/interview/confrontation each cost exactly one under current rules.
- Hint costs two once.
- Contradiction detection itself is free and order-independent.
- Confrontation requires both prerequisites and an available action.
- Accusation requires completed confrontation.
- Accusation uses exactly two distinct collected evidence IDs.
- Winning proof includes confrontation evidence.
- Timeline sorting does not mutate evidence.

## Change workflow

1. Write the old and desired behavior as examples.
2. Identify the single authoritative function.
3. List boundary cases before implementation.
4. Update engine logic without browser APIs.
5. Add tests for success, no-op, duplicate, wrong phase, and final-action edges.
6. Update `js/main.js` labels, disabled states, screen routing, focus, and
   announcements only as needed.
7. Update duplicated visible constants.
8. Update the contradiction contract if player rules changed.
9. Run all tests and play affected routes.

## Associated files

| Path | Inspect | Change |
| --- | --- | --- |
| `js/engine.js` | Always | Primary rule implementation |
| `test/engine.test.js` | Always | Required regression coverage |
| `js/main.js` | UI assumptions and calls | Labels, gates, screen/announcement integration |
| `js/cases.js` | Data relationships consumed by rule | Only if schema/content contract changes |
| `docs/contradiction-system.md` | Current formal behavior | Player-facing contract changes |
| `docs/development-bible.md` | Plain explanation | Major concept/workflow changes |
| `styles.css` | Only if UI state presentation changes | New/changed state styles |

## Normally ignore

- `server.mjs` for rule changes.
- `index.html` unless permanent accessibility shell behavior changes.
- Asset directories for rule-only work.
- `package.json` unless a deliberately approved test tool is introduced.

## High-risk changes

Treat these as cross-layer tasks:

- changing `MAX_ACTIONS` because "12" is duplicated in `js/main.js`;
- adding a phase because engine and renderer routing must agree;
- multiple contradictions because current data/engine/UI assume one;
- repeatable actions because `completedActions` and identity no-op tests assume
  one use;
- variable evidence counts because accusation UI and evaluator require exactly
  two;
- active-session resume because old IDs and phases need recovery semantics;
- changing score because ranks, result copy, and boundary tests need review.

## Verification matrix

For every transition test:

- correct phase and enough actions;
- wrong phase;
- zero actions;
- unknown target;
- duplicate target;
- exact last-action behavior;
- old state remains unchanged;
- correct evidence/action/phase fields in new state;
- UI button state and event path agree;
- live announcement and focus make sense.

Run:

```sh
npm test
```

Then use `npm start` and manually verify affected screen transitions, error
messages, keyboard controls, narrow layout, and browser Console.