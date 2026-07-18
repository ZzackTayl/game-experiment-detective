---
name: case-authoring
description: Add or revise suspects, motives, locations, evidence, timelines, contradictions, confrontations, and case variants safely.
---

# Case Authoring

Use for narrative content and case data when the existing rules remain the same.

## Read first

1. `docs/contradiction-system.md`
2. `docs/development-bible.md`, especially Content Model
3. `js/cases.js`
4. `validateCaseData()` in `js/engine.js`
5. Existing content tests in `test/engine.test.js`

For illustrated or voiced clues, also use
`.agent/skills/asset-integration/SKILL.md`.

## Current authored contract

Each case needs:

- one stable `id` and player-facing `code`;
- one valid global `culpritId`;
- one valid global `motiveId`;
- one `resolution`;
- one evidence object for every ID in global `locations`;
- one interview object for every ID in global `suspects`;
- one timeline entry for every base evidence ID;
- exactly one contradiction;
- exactly two different base-evidence prerequisite IDs;
- one confrontation tied to the contradiction suspect;
- inline timeline metadata for confrontation evidence;
- exactly three distinct `keyEvidenceIds`;
- confrontation evidence included in those three.

Current timeline times are `HH:mm` strings from `22:05` through `22:26`.
Statuses are `verified`, `claimed`, `inferred`, or `admitted`.

## Design a coherent contradiction

Use this simple test:

1. **Claim:** what exactly did the suspect say?
2. **Fact:** what separately collected evidence makes the claim impossible?
3. **Conflict:** can the player explain the contradiction in one sentence?
4. **Challenge:** what specific question should the player ask?
5. **Reveal:** what new evidence does the confrontation produce?
6. **Proof:** does confrontation evidence plus another decisive clue prove the
   correct culprit and motive?

Do not make the two prerequisites restatements of the same clue. Do not require
an image, color, or sound to understand the conflict.

## Authoring workflow

1. Choose stable lowercase kebab-case IDs.
2. Draft culprit, motive, and resolution first.
3. Draft the suspect's false statement.
4. Draft independent contradicting evidence.
5. Draft confrontation and decisive reveal.
6. Fill all other location and interview leads with useful alibis, context, or
   red herrings.
7. Assign timeline metadata to every base clue.
8. List exactly three decisive IDs including confrontation.
9. Run `npm test`.
10. Add/extend tests for the new case and any new edge.
11. Play the variant in both prerequisite orders.
12. Verify win, wrong theory, hint, keyboard, and 320-pixel layout. Keep the
    synthetic exhausted-state engine tests passing; do not call it a manual
    player route unless a changed action economy makes it reachable.

## Associated files

| Path | Role | Change guidance |
| --- | --- | --- |
| `js/cases.js` | Authoritative content and IDs | Primary file for normal case work |
| `js/engine.js` | Validator and generic content consumption | Change only if schema/rules intentionally expand |
| `test/engine.test.js` | Case validation and all-variant behavior | Add regression/content checks |
| `docs/contradiction-system.md` | Formal current authoring contract | Update only when contract changes |
| `js/main.js` | Generic display of all current case data | Change only for a new field/display behavior |
| `styles.css` | Generic content layout | Change only when new content shape needs responsive styling |
| `docs/asset-bible.md` | Media representation and narrative safeguards | Inspect for illustrated/voiced evidence |

## Normally ignore

- `server.mjs` for text-only case content.
- `index.html` for case data.
- `package.json` unless adopting an intentional authoring tool.
- `js/engine.js` when the new case fits the existing schema and rules.

## Validator limits

`validateCaseData()` is useful but not complete. It currently checks evidence ID
uniqueness, contradiction prerequisites, three decisive IDs, confrontation
inclusion, and timeline shape/range/status.

It does not fully prove:

- `culpritId` exists in global suspects;
- `motiveId` exists in global motives;
- every global location has evidence;
- every global suspect has an interview;
- contradiction `suspectId` is valid or matches intended culprit;
- narrative claims are logically coherent;
- a clue does not accidentally reveal the wrong solution.

Add tests or improve validation when relying on a new invariant.

## ID safety

- Case IDs are persistence keys. Renaming one hides prior solved progress.
- Evidence IDs connect timeline entries, prerequisites, decisive evidence,
  accusation choices, tests, and possible assets.
- Suspect IDs connect interviews, confrontations, action keys, and UI choices.
- Duplicate evidence IDs within one case are invalid.

Change display copy freely when meaning remains correct. Change an ID only with a
complete reference search and an explicit persistence decision.

## Verification

Run:

```sh
npm test
```

Then test:

- both prerequisite collection orders;
- zero/one/two prerequisite lock states;
- confrontation once and duplicate confrontation;
- confrontation on the final action;
- contradiction found on the final action;
- hint before and after contradiction;
- correct accusation with confrontation evidence;
- correct suspect/motive without confrontation evidence;
- wrong suspect/motive and red-herring evidence;
- every screen containing the new text at narrow and wide widths.