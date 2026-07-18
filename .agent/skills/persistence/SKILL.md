---
name: persistence
description: Change or debug browser progress, solved cases, best scores, reset, reload, storage errors, or future active-session resume.
---

# Persistence

Use for localStorage, solved progress, best scores, reset, reload, and resume.

## Read first

1. `STORAGE_KEY`, `loadProgress()`, and `saveProgress()` in `js/main.js`
2. Win and reset event branches in `js/main.js`
3. `createSession()` and phase rules in `js/engine.js`
4. Case IDs in `js/cases.js`
5. Persistence section in `docs/development-bible.md`

## Current saved contract

Key:

```text
game-experiment-detective:v1
```

Value:

```js
{
  solved: ["echo-a"],
  bestScores: {
    "echo-a": 900
  }
}
```

Only winning progress is saved. Active screen/session, current case, actions,
evidence, hint, losses, and accusation selections are not saved. Reload returns
to home.

Storage errors are caught. The game remains playable and announces write failure.
Saved `solved` IDs are filtered against current `casesById`. Best-score keys are
not similarly filtered and scores are not currently displayed.

## Persistence workflow

1. Define exactly what survives reload.
2. Define save triggers and discard/reset behavior.
3. Define schema version and old-data migration.
4. Define validation/recovery for renamed or removed IDs.
5. Define behavior when storage is unavailable, full, malformed, or denied.
6. Keep the game playable without persistence.
7. Add automated tests by separating storage logic where appropriate.
8. Test different origins, refresh, reset, and interrupted writes.
9. Update owner documentation.

## Active-session resume is a feature

Before saving `session`, decide:

- whether old case content versions remain compatible;
- how missing evidence/action IDs recover;
- whether briefing/accusation/result screens resume;
- whether accusation form selections save;
- whether a new case discards or archives the old one;
- whether expired/invalid sessions restart safely;
- when every action saves;
- how reset clears both progress and active session.

Do not serialize the current object without those decisions.

## Associated files

| Path | Inspect | Change |
| --- | --- | --- |
| `js/main.js` | Always | Primary browser load/save/reset and UI feedback |
| `js/engine.js` | Session schema and valid phases | Session normalization/recovery rules if needed |
| `js/cases.js` | Stable IDs and current case index | Only for intentional content ID/migration changes |
| `test/engine.test.js` | Current test style | Rule tests; browser storage may need separate testable module/tests |
| `docs/development-bible.md` | Current save contract | Public behavior changes |
| `README.md` | High-level progress claim | Meaningful public persistence changes |

## Normally ignore

- `server.mjs`: current saves are browser-only.
- `styles.css`: unless adding visible save/resume controls.
- `index.html`: unless permanent status/metadata is introduced.
- asset files.

## ID and origin warnings

- Renaming a case ID can make a prior solved case disappear.
- `localhost`, `127.0.0.1`, a different port, and a deployed domain have separate
  browser storage.
- Private browsing, clearing site data, browser policy, or storage denial can
  remove/prevent progress.
- localStorage is not secure storage and should not hold secrets or sensitive
  personal data.

## Verification

Test:

- first load with no key;
- valid old progress;
- malformed JSON;
- unknown case IDs;
- a win and best-score replacement/non-replacement;
- a loss that should not save solved progress;
- reset cancel and reset confirm;
- storage read/write denial;
- reload behavior;
- different origin behavior;
- any version migration and fallback.

Run `npm test` and manually inspect browser Application/Storage. The current test
suite does not automate localStorage behavior.