---
name: game-project-router
description: Route work on The Vanishing Variable to the smallest relevant project skill, guide, and source-file set.
---

# Game Project Skill Router

Use this skill first for any task in this repository. Its job is to classify the
request before reading or editing broad parts of the project.

## Non-negotiable project fact

This is a dependency-free HTML/CSS/JavaScript browser game. It is not a Godot,
GODAP, Unity, or Unreal project. There is no scene editor or engine importer.
`js/engine.js` is the rules module, not the Godot engine.

Do not invent `.gd`, `.tscn`, `.tres`, `project.godot`, editor-node, or import
instructions. A request to migrate to Godot is an architecture migration, not a
normal edit.

## Route by request

Choose one primary skill. Add a second skill only when the change truly crosses
boundaries.

| User intent or symptom | Primary skill | Add when needed |
| --- | --- | --- |
| First setup, run, command, editor, "how do I start?" | `.agent/skills/project-setup/SKILL.md` | Testing if setup fails after the server starts |
| New case, clue, suspect, motive, location, contradiction, timeline, story | `.agent/skills/case-authoring/SKILL.md` | Gameplay rules if the schema or win conditions change |
| Actions, phases, hints, confrontation gate, accusation, scoring, rank | `.agent/skills/gameplay-rules/SKILL.md` | UI/accessibility if controls or screens also change |
| Screen, button, form, focus, announcement, layout, theme, responsive behavior | `.agent/skills/browser-ui-accessibility/SKILL.md` | Gameplay rules when legality changes |
| Image, logo, icon, portrait, audio, ElevenLabs, font, video, model, asset library | `.agent/skills/asset-integration/SKILL.md` | UI for rendering/controls; server for MIME/CSP |
| Test failure, broken flow, regression, unexplained behavior, validation | `.agent/skills/testing-debugging/SKILL.md` | The feature skill identified by the failing layer |
| Local server, port, 404, MIME, CSP, headers, hosting, public exposure | `.agent/skills/local-server-security/SKILL.md` | Assets for a media file; UI for CSP-connected page changes |
| Saved wins, score storage, reset, reload, resume, localStorage | `.agent/skills/persistence/SKILL.md` | Gameplay rules for active-session save semantics |

## Multi-feature precedence

When a request contains several ideas:

1. Identify the player-visible outcome.
2. Identify the authoritative layer for that outcome.
3. Use that layer's skill as primary.
4. Load only the secondary skill that owns a necessary integration boundary.
5. Do not edit every file merely because the feature can be described in every
   layer.

Examples:

- "Add Mina's portrait" → asset integration primary, browser UI secondary.
  Gameplay rules stay untouched.
- "Make hints free and change their button label" → gameplay rules primary,
  browser UI secondary.
- "Add a fifth case with the same rules" → case authoring only, plus tests.
- "Save a half-finished investigation" → persistence primary, gameplay rules
  secondary because recovery semantics affect phases and evidence.
- "The Ogg file is rejected" → local server/security primary, asset integration
  secondary.

## Universal reading order

Read only what the routed task needs:

1. `README.md` for public commands.
2. `docs/first-run-guide.md` for beginner workflow, when relevant.
3. `docs/development-bible.md` for the architecture/concept section involved.
4. The selected feature skill.
5. The exact source-of-truth files listed by that skill.
6. `docs/contradiction-system.md` for deduction behavior.
7. `docs/asset-bible.md` for any media work.

Do not duplicate constants or contracts from memory. Verify them in source.

## Whole-project ownership map

| Existing path | Read when | Change when | Normally ignore when |
| --- | --- | --- | --- |
| `index.html` | Shell, metadata, focus mount, live region, CSP, brand | Changing permanent shell, metadata, favicon, or synchronized CSP | Pure content/rule changes |
| `styles.css` | Any visual, responsive, focus, forced-color, or motion effect | Changing presentation | Pure content/rule/server changes |
| `js/main.js` | Any visible screen, event, browser storage, announcement | Changing browser behavior or rendering | Pure case-data change that generic UI already supports |
| `js/cases.js` | Story, stable IDs, every authored case relationship | Changing authored content/schema metadata | Pure CSS/server changes |
| `js/engine.js` | Legal action, phase, hint, contradiction, accusation, score, validation | Changing game rules/data validation | Visual/audio-only replacement |
| `server.mjs` | Port, static response, MIME, CSP, server error | Changing local serving/security/file support | Narrative, scoring, or style changes |
| `test/engine.test.js` | Any data/rule behavior and existing regression pattern | Adding/updating content/rule validation | Pure visual polish unless schema changes |
| `docs/contradiction-system.md` | Timeline/lie/confrontation/accusation contract | Contract changes | Implementation refactors with unchanged behavior |
| `docs/asset-bible.md` | Any media/source/rights/import question | Asset workflow or policy changes | Non-asset feature implementation |
| `package.json` | Command or dependency question | Intentionally changing scripts/dependencies | Most product/content changes |

## Files and directories outside product scope

- Do not edit `.git/`.
- Do not edit tooling-owned internal skill directories for product work.
- Do not add `node_modules/`, build output, coverage output, editor caches, raw
  download bundles, credentials, API keys, or machine-local configuration.
- Do not create speculative `assets/` categories that the game does not consume.
- Do not modify `js/engine.js` for a visual replacement.
- Do not weaken CSP to make a hotlink work.

## Universal execution rules

1. Reproduce or describe the current behavior.
2. State the primary owner layer.
3. Inspect the minimum source set.
4. Preserve stable IDs and cross-layer contracts.
5. Make the smallest coherent change.
6. Run `npm test`.
7. Serve with `npm start` and test affected browser routes when behavior is
   visible.
8. Check Console and Network for errors.
9. Check keyboard focus and a 320-CSS-pixel viewport for UI changes.
10. Update the owning guide/contract only if behavior or workflow changed.

## Stop and clarify

Ask for a product decision instead of guessing when:

- "GODAP" refers to a separate application or migration not present here;
- a new framework, game engine, backend, database, or build system is proposed;
- an asset's license, consent, source, or commercial rights are unknown;
- a rule change contradicts the current one-contradiction/confrontation design;
- production hosting requirements are requested but target platform/browser
  support is unspecified;
- active-session persistence needs recovery/version semantics;
- a feature would make a required clue available only through media.