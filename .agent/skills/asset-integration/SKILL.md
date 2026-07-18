---
name: asset-integration
description: Plan, source, license, prepare, organize, import, render, and test visual, audio, font, video, or future 3D assets.
---

# Asset Integration

Use for every media request, including source-library comparisons, ElevenLabs or
other AI tools, portraits, icons, sound, music, voice, fonts, and models.

## Read first

1. `docs/asset-bible.md` — canonical detailed workflow
2. Relevant content IDs in `js/cases.js`
3. Relevant renderer in `js/main.js`
4. Relevant CSS in `styles.css`
5. `server.mjs` MIME types and CSP response
6. CSP in `index.html`
7. `docs/contradiction-system.md` for clue/accessibility truth

## Current state

There are no runtime media assets or `assets/` directory yet. The CSS-only game
is a valid placeholder. There is no Godot import process.

"Import" currently means:

1. clear rights and record provenance;
2. prepare and optimize a web file;
3. place it under a deliberate `assets/` subdirectory;
4. reference it from HTML/CSS/JavaScript data/rendering;
5. add the file's MIME type to `server.mjs` if needed;
6. test loading, fallback, performance, narrative accuracy, and accessibility.

Create only categories used by the contribution. Do not add empty speculative
video/model directories.

## Asset decision gate

Before code changes, answer:

- Which exact scene/content ID uses it?
- Is it decorative or informative?
- What text/no-media fallback remains?
- Who created it and where did it come from?
- What exact license/plan/consent allows this shipped game use?
- Where is proof recorded?
- What editable master is retained?
- What optimized runtime format/size is appropriate?
- Does it require controls, captions, transcripts, alt text, or reduced motion?
- Which browsers/devices must support it?

Stop if rights, real-person likeness/voice consent, or intended use is unclear.

## Associated files

| Asset type | Inspect | Change only when |
| --- | --- | --- |
| Brand/favicon | `index.html`, `.brand` in `styles.css`, `server.mjs` | Add/replace shell markup, styles, file URL, or needed MIME type |
| Suspect portrait | `suspects` in `js/cases.js`, all suspect renderers in `js/main.js`, `styles.css`, `server.mjs` | Add portrait metadata, one reusable renderer, styles, fallback, or needed MIME type |
| Location art | `locations`, `renderActionCard()` and investigation rendering, CSS, server | Add location metadata/rendering/styles/fallback or needed MIME type |
| Evidence art | case evidence data, `renderTimeline()`, `renderAccusation()`, CSS, validator/tests | Add optional media; change validator/tests only if metadata becomes required |
| UI icon | Relevant DOM helper/control, forced-colors CSS, server | Add a reusable icon treatment and needed style/MIME support |
| Music/SFX/voice | `js/main.js`, visible controls, storage, CSS, server, optional clip metadata | Add a centralized controller, preferences, controls, cue metadata, styles, and needed MIME types |
| Font | `styles.css`, `server.mjs`, both CSP copies | Add local `@font-face`, actual font MIME support, or deliberate CSP directive |
| Video | Named renderer, controls/captions/poster, CSS, server MIME/CSP | An approved named scene uses video and has fallback/accessibility behavior |
| Future 3D | Architecture proposal, future renderer/loader, assets/server/tests | Rendering architecture and budgets are approved; never as a normal asset drop |

For the full path map, budgets, formats, and source choices, use
`docs/asset-bible.md`.

## Normally ignore

- `js/engine.js` for a visual/audio replacement.
- `test/engine.test.js` unless media metadata becomes required case data.
- `package.json` unless a deliberately approved optimizer/checker is adopted.
- unrelated renderers and case variants.
- raw paid asset packs, credentials, private invoices, API keys, or consent
  documents in runtime folders.

## Implementation rules

- Self-host approved runtime files; do not hotlink.
- Keep stable content IDs in filenames/metadata where useful.
- Render through one reusable helper/controller.
- Specify intrinsic image dimensions.
- Lazy-load scene-specific media.
- Do not autoplay audible content.
- Add visible mute/volume before shipping sound.
- Keep canonical clue text, time, status, and source.
- Transcribe meaningful voice/sound and caption video.
- Use `alt=""` for decorative repetition and concise alt text for added meaning.
- Handle missing, blocked, slow, or unsupported media.
- Keep CSP copies synchronized.
- Add only MIME types actually used.
- Never expose an ElevenLabs or other service API key in browser code.

## Source/tool comparison

Do not endorse a source without item-level review. Present choices:

- first-party work: most control, most labor;
- commission: custom quality, contract/budget/schedule work;
- public domain/CC0: low cost, provenance/style verification still needed;
- other free libraries: attribution/noncommercial/share-alike may conflict;
- paid stock/packs: convenience and receipts, redistribution/project limits;
- icon/component libraries: consistency, license/dependency/accessibility review;
- AI generation: fast exploration, provider terms/provenance/consistency risks;
- modified licensed work: faster, but original restrictions remain.

The Asset Bible names possibilities for 2D, audio, 3D, ElevenLabs, Gemini,
ChatGPT, Kittl, Canva, GIMP, and other editors/libraries, with tradeoffs.

## Verification

1. Run `npm test`.
2. Run `npm start`.
3. Check Network status, MIME, transfer size, and eager loading.
4. Check Console CSP/codec/decode errors.
5. Test every consuming scene and all relevant variants.
6. Test missing-file and denied-playback behavior.
7. Check keyboard, screen reader semantics, 320-pixel width, zoom, forced colors,
   and reduced motion.
8. Review narrative consistency.
9. Review provenance, attribution, consent, and source records.
10. Confirm no secret, tracker, executable, unsafe SVG behavior, or unneeded raw
    pack entered the repository.