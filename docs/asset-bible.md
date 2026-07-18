# Asset Bible

This is the working guide for visual, audio, font, motion, and possible future 3D
assets in **The Vanishing Variable**. It is written for someone adding game assets
for the first time.

Read the [project overview](../README.md) for the play and development commands.
Read the [timeline and contradiction specification](contradiction-system.md) before
illustrating clues: a picture or sound must never disagree with the authored times,
evidence, or accessibility rules.

## 1. What this repository actually is

This project does **not** use Godot, Unity, Unreal, or another packaged game engine.
It is a small browser game made from:

- `index.html`, which provides the document shell, security policy, header, and app
  mount point.
- `styles.css`, which provides all current art direction and layout.
- `js/main.js`, which builds every visible screen with browser DOM APIs.
- `js/cases.js`, which contains the four case variants, four suspects, five
  locations, and all clue text.
- `js/engine.js`, which contains the game-state and deduction rules.
- `server.mjs`, which is the dependency-free local static server.
- `test/engine.test.js`, which checks the authored cases and game rules.

`package.json` declares JavaScript modules and no runtime dependencies or build
step. It does not pin a Node or browser-engine version. The practical "engine" is
therefore the player's web browser; the local Node server is development
infrastructure, not a scene renderer.

There are no engine scene files, resource files, asset manifest, image files,
audio files, video files, custom fonts, or 3D models in the repository today.
There is not yet an `assets/` directory. The current game deliberately works as a
text-first experience using CSS color, borders, typography, and one decorative
diamond character.

### The current UI regions and logical screens

These are not separate engine scene files. Most are render functions or nested
UI regions in `js/main.js`; the persistent header is static markup in
`index.html`:

| Player-facing region | Current renderer | Current content source | Likely asset opportunities |
| --- | --- | --- | --- |
| Persistent header | Static markup in `index.html` | Brand text in `index.html` | Logo, compact brand mark, favicon |
| Home/title | `renderHome()` | Copy in `js/main.js` | Key art, restrained background, title treatment, music start control |
| Case briefing | `renderBriefing()` | `suspects` from `js/cases.js` | Four suspect portraits, role icons, briefing ambience |
| Investigation leads | `renderInvestigation()` and `renderActionCard()` | `locations` and `suspects` from `js/cases.js` | Five location images, suspect thumbnails, search/interview icons |
| Casebook timeline | `renderTimeline()` and `renderContradiction()` | Collected evidence from `js/cases.js` | Evidence thumbnails, status icons, clue-reveal sound |
| Confrontation | Part of `renderInvestigation()` | `contradiction` data in `js/cases.js` | Culprit portrait state, sting, optional voiced line |
| Accusation | `renderAccusation()` | Suspects, motives, and collected evidence | Small portraits and clue thumbnails; no image-only choices |
| Dormant exhausted result | `renderExhausted()` | Copy in `js/main.js`; not reachable through the current legal action inventory | Failure sting or simple illustration if the action economy makes this route reachable |
| Final result | `renderResult()` | Resolution data in `js/cases.js` | Culprit reveal art, success/failure music, case stamp |

The current text is the canonical gameplay information. Assets should support it,
not replace it.

## 2. Asset directories to use

The following is the proposed layout for the first asset contribution. These
directories do not exist yet; create only the directories needed by that
contribution. Runtime files belong under `assets/` so every URL is predictable and
same-origin.

```text
assets/
  SOURCES.md
  brand/
  ui/
  characters/
  locations/
  evidence/
  audio/
    music/
    sfx/
    voice/
  fonts/
  video/
  models/
asset-sources/
  brand/
  characters/
  locations/
  evidence/
  audio/
  models/
```

- `assets/` is for optimized files that the game downloads.
- `assets/SOURCES.md` is the proposed rights and provenance register. Create it
  with the first runtime asset.
- `asset-sources/` is for editable originals that are reasonably small and useful
  to future contributors: layered image files, lossless audio masters, SVG source,
  and Blender source, for example. Do not reference these files from the game.
- Very large source projects, raw recordings, stock-library archives, and paid
  download bundles are better kept in controlled project storage. Record their
  location and exported derivative in `assets/SOURCES.md`; do not put credentials,
  personal consent records, private invoices, or an entire redistributable asset
  pack in this public runtime tree.

Do not create a directory for an asset category the game does not use. In
particular, `assets/video/` and `assets/models/` should remain absent until the
design actually calls for video or 3D.

### Naming rules

Use lowercase kebab-case ASCII names, a useful category prefix, and a normal file
extension. Avoid spaces, punctuation, creator names, unexplained numbers, and
names such as `final-final-2`.

Examples:

```text
assets/brand/vanishing-variable-mark.svg
assets/brand/favicon-32.png
assets/characters/suspect-mina-portrait.webp
assets/locations/location-control-room.webp
assets/evidence/echo-a-mina-alibi.webp
assets/ui/icon-contradiction.svg
assets/audio/sfx/sfx-evidence-added.ogg
assets/audio/voice/echo-a-mina-confrontation-01.ogg
```

Use the stable IDs in `js/cases.js` when a file represents authored game content:
`mina`, `control`, `mina-alibi`, and `echo-a` are examples. Scope case-specific
assets with the case ID because the same location can yield different evidence in
each variant. Shared art should have a deliberately shared name.

Do not encode a version number in a normal runtime name merely because an artist
made another edit. Replace the file after review or use a meaningful variant such
as `suspect-mina-neutral.webp` and `suspect-mina-confronted.webp`. Keep revision
history in source control and the provenance record.

## 3. What assets are needed

### Needed now

The game is fully playable without media. The highest-value additions at this
stage are small assets that clarify identity and place without changing the game
rules:

1. **Brand basics:** one scalable mark and real favicon.
2. **Suspect portraits:** one consistent portrait for each of Mina, Jon, Rhea, and
   Owen.
3. **Location art:** one image for each of the Control Room, Cold Archive, Test
   Booth, Break Room, and Producer's Office.
4. **A tiny UI icon set:** search, interview, evidence, contradiction, locked, and
   confrontation. Keep the existing words beside every icon.
5. **A small sound set, only after a mute/volume control exists:** button activate,
   evidence added, contradiction found, confrontation, success, and failure.

Evidence art is useful but is a larger content commitment. There are four authored
case variants, each with location evidence, interview evidence, and confrontation
evidence. A generic evidence-type icon is safer than producing a few detailed
clue images that make the remaining clues feel unfinished.

### Useful later

- Multiple portrait expressions for neutral, challenged, confronted, and revealed
  states.
- Case-specific evidence documents, camera stills, diagrams, console captures,
  badge records, contracts, and recordings.
- A quiet looping score and separate home, investigation, contradiction, and
  result cues.
- Optional voice performances for briefing, confrontation, and resolution copy.
- Ambient room loops for the studio locations.
- Custom typefaces, if they remain readable and are properly licensed for web
  embedding.
- Responsive key art for social previews or a store page. Those marketing assets
  do not need to ship in the game unless the game displays them.
- Short motion pieces or video only when they add information worth the download
  and accessibility work.
- Localization-ready voice and image variants after the text/content architecture
  supports localization.

### Not justified by the current architecture

The game has no canvas, WebGL renderer, camera, lighting, physics, skeletal
animation, or 3D scene. Models, materials, rigs, particle systems, and texture
atlases would not be consumed by any current file. Adding them now would create
storage and licensing work without a player-facing result.

If a future design chooses 3D, first choose and document the web renderer and its
browser targets. Only then create `assets/models/`, add loading/failure behavior,
and set budgets based on measured scenes. Do not choose a model library merely
because attractive downloads are available.

## 4. Repository-specific asset wiring

The paths in this table under `assets/` are proposed destinations. The consumer
files and functions already exist.

| Asset kind | Put optimized files in | Existing consumer or integration point | Expected code work |
| --- | --- | --- | --- |
| Logo and brand mark | `assets/brand/` | `.brand` in `index.html`; `.brand` rules in `styles.css` | Add an `<img>` with intrinsic dimensions and useful or empty alternative text, then size it in CSS |
| Favicon | `assets/brand/` | Current empty data favicon in `index.html` | Replace the `data:,` link with a relative file URL; add other icon sizes only if supplied |
| Suspect portraits | `assets/characters/` | `suspects` in `js/cases.js`; `renderBriefing()`, interview cards, `renderAccusation()`, and `renderResult()` in `js/main.js` | Add portrait metadata to each suspect and render it through one reusable helper |
| Location art | `assets/locations/` | `locations` in `js/cases.js`; location branch in `renderInvestigation()` | Add an image path and alt text or caption metadata to each location; extend `renderActionCard()` without making cards image-only |
| Evidence art | `assets/evidence/` | `locationEvidence`, `interviews`, and `contradiction.confrontation` in `js/cases.js`; `renderTimeline()` and `renderAccusation()` | Add optional media metadata to evidence; render the same optional thumbnail component in both scenes |
| UI icons | `assets/ui/` | Buttons, status labels, timeline, and cards created in `js/main.js`; styled in `styles.css` | Use decorative `alt=""` for icons that repeat visible text; preserve forced-colors behavior |
| Music | `assets/audio/music/` | No current consumer | Add one audio controller in `js/main.js`, user-initiated playback, mute/volume persistence, and scene transitions |
| Sound effects | `assets/audio/sfx/` | Click handler and state transitions in `js/main.js` | Play only after user interaction; map sounds to semantic events instead of individual buttons |
| Voice | `assets/audio/voice/` | Briefing, confrontation, and result text from `js/main.js` and `js/cases.js` | Add optional clip metadata, controls, captions/transcripts, interruption rules, and missing-file fallback |
| Fonts | `assets/fonts/` | Font stacks near the top of `styles.css` | Add local `@font-face`, `font-display`, explicit weights, and existing system fallbacks |
| Video | `assets/video/` | No current consumer | Add a native `<video>` only to a named scene, with controls/captions/poster and no forced autoplay |
| 3D models | `assets/models/` | No current consumer | Requires a separate, approved rendering feature; do not add for a normal art pass |

Keep asset paths relative to the page, such as
`assets/characters/suspect-mina-portrait.webp`. Do not use machine-local absolute
paths.

### Server and security policy changes required by the first asset

`server.mjs` currently declares MIME types only for CSS, HTML, JavaScript, and
JSON, and sends `X-Content-Type-Options: nosniff`. Before relying on a new file
type, add its correct MIME type to the `types` object. Typical mappings to verify
for the actual files being added include:

| Extension | MIME type |
| --- | --- |
| `.svg` | `image/svg+xml` |
| `.png` | `image/png` |
| `.webp` | `image/webp` |
| `.avif` | `image/avif` |
| `.jpg`, `.jpeg` | `image/jpeg` |
| `.ogg` | `audio/ogg` |
| `.mp3` | `audio/mpeg` |
| `.wav` | `audio/wav` |
| `.webm` | `video/webm` |
| `.mp4` | `video/mp4` |
| `.woff2` | `font/woff2` |
| `.glb` | `model/gltf-binary` |

Add only mappings that are used and confirm them against the format's current
standard registration.

The Content Security Policy appears both in `index.html` and in the response
headers built by `server.mjs`. It currently allows same-origin images and data
images, and its `default-src 'self'` fallback covers same-origin media and fonts.
Self-hosted assets fit that policy. A deliberate media/font integration may add
explicit `media-src 'self'` or `font-src 'self'`, but the two policy copies must
stay synchronized.

Remote image, font, audio, video, or model hosts are currently blocked. Avoid
weakening the policy just to hotlink an asset. Hotlinks also create privacy,
availability, versioning, and license-proof problems. Download an allowed copy,
record its source, optimize it, and serve it from this repository instead.
Never put a paid-service API key in browser JavaScript.

## 5. Formats and conservative starting budgets

The repository defines no formal asset-size, texture, polycount, sample-rate, or
browser-support budget. The figures below are **starting recommendations**, not
verified project limits. Measure loading, decoded memory, and interaction on the
slowest supported device before making them policy.

### Raster images

Preferred runtime choices:

- **WebP** for portraits, locations, and painted evidence art when the selected
  browser support target permits it.
- **PNG** for small images that need crisp transparency or when lossless detail is
  genuinely important.
- **JPEG** for photographic images when transparency is not needed.
- **AVIF** can be smaller, but only adopt it after defining browser support and
  comparing decode time and visual quality. A `<picture>` fallback may be needed.
- Keep PSD, XCF, KRA, or other layered files as source, not runtime files.

Export in sRGB. Remove unnecessary metadata and hidden layers, inspect dark
gradients for banding, and do not upscale a weak source merely to hit a nominal
dimension.

Conservative working targets:

| Use | Suggested source/export shape | Starting runtime target |
| --- | --- | --- |
| Suspect portrait | Square; author at 1024×1024 or larger if useful, export 256×256 and optionally 512×512 | Roughly 50–150 KB per displayed size |
| Location card | 16:9 or 3:2; export around 960–1280 pixels wide | Roughly 100–250 KB |
| Evidence thumbnail | 4:3 or square; export around 480–640 pixels wide | Roughly 40–120 KB |
| Full-width key art | Responsive 1280- and 1920-pixel-wide variants | Try to keep each under roughly 400 KB |
| PNG icon fallback | 32 or 64 pixels at the intended pixel density | Usually well below 20 KB |

These are quality checks, not acceptance limits. A simple graphic should be much
smaller. A full 1920×1080 RGBA image can occupy about 8 MB after decoding even if
its download is compressed, so count decoded memory as well as transfer size.

For the infant-stage game, aim for an initial page media payload around or below
1 MB and lazy-load scene-specific art. Revisit that number with browser network
and performance tools rather than treating it as a promise.

Implementation settings:

- Give every `<img>` `width` and `height` attributes matching its intrinsic aspect
  ratio to reduce layout shifts.
- Use `loading="lazy"` for images below the first view and
  `decoding="async"` where delayed decode is acceptable.
- Use `srcset`/`sizes` or `<picture>` when one large image would otherwise be sent
  to every viewport.
- Preserve the subject with `object-fit` and an intentional focal point; do not
  crop identifying evidence out of a clue.
- Test at 320 CSS pixels because the existing interface specification requires
  that width.

### Vector art and icons

Use SVG for logos and simple icons when it stays small and crisp. Author with a
meaningful `viewBox`, remove editor metadata, convert unsupported text to paths
only when necessary, and prefer `currentColor`-compatible inline symbols only if
the implementation has been security-reviewed.

Treat downloaded SVG as code: inspect it for scripts, event handlers, foreign
objects, external URLs, trackers, and embedded raster payloads. A safe default is
to self-host a cleaned SVG through `<img>`. Icons must not be the only indication
of locked, successful, claimed, verified, inferred, or admitted state.

### Fonts

The current system stacks are fast, legible, and license-free to ship because the
game does not distribute their files. A custom font is optional.

If adding one:

- Prefer WOFF2 runtime files and retain the legal source/license record.
- Start with one family and one or two necessary weights; avoid downloading an
  entire variable or multilingual family without measuring it.
- Subset only after confirming all game punctuation, curly quotes, en dashes,
  accented names, and planned languages still work.
- Use `font-display: swap` or another deliberate loading policy and retain the
  current system fallback.
- A useful initial target is below about 100–150 KB total font transfer, but actual
  language coverage can justify more.

### Audio

Keep an uncompressed master when practical. A common source workflow is mono or
stereo WAV at 44.1 or 48 kHz and 16- or 24-bit depth. Match the recording/project
rate rather than repeatedly resampling.

For runtime delivery:

- Short effects can use WAV when tiny, but Ogg Vorbis and/or MP3 are usually more
  practical for broad browser delivery.
- Music can start around 128–192 kbps for evaluation.
- Mono voice can often start around 64–96 kbps; listen for damaged consonants and
  room noise before accepting it.
- Provide more than one runtime codec only when the documented browser target
  needs a fallback.
- Normalize a group consistently; do not make success stings or button sounds
  dramatically louder than dialogue.
- Trim silence, add clean fades and loop points, and avoid clipping.
- Use `preload="none"` or metadata-only loading for optional clips. Do not download
  every case's voice on the home screen.

Browsers usually block unprompted audible playback. Start audio only after a user
action, provide mute and volume controls, remember the choice when appropriate,
pause or duck overlapping content, and make every clue understandable without
sound. Voice and meaningful recorded evidence need an equivalent transcript.

### Video and motion

Video is not currently needed. If introduced, begin with WebM and/or MP4 based on
the documented browser target, 720p or restrained 1080p, 24 or 30 frames per
second, and a measured bitrate. Use a poster image, native controls, captions, no
surprise autoplay, and a reduced-motion alternative. Load it only in the scene
that uses it.

CSS animation should respect the existing `prefers-reduced-motion` block in
`styles.css`. Avoid rapid flashes and motion that obscures the evidence timeline.

### Possible future 3D

Use glTF/GLB for web delivery unless the future renderer requires something else.
Keep Blender, FBX, or other editable/export sources outside the runtime directory.
As a first prototype—not a repository limit—try:

- 1,000–5,000 triangles for a small prop.
- 5,000–20,000 triangles for a prominent prop or simple character.
- 1K textures for ordinary objects and at most 2K for a measured hero need.
- Few materials, texture sets, transparent surfaces, bones, and draw calls.

Good topology, UVs, pivots, scale, normals, compression support, and draw-call
count matter more than triangle count alone. Test generated or downloaded models
for hidden geometry, extreme texture memory, broken rigs, malformed files, and
license restrictions before integration.

## 6. Accessibility and narrative rules

Assets cannot carry mandatory deduction information by themselves.

- Keep the clue title, body, time, status, and source text rendered today.
- Write concise alt text for an image that adds information. Use `alt=""` for a
  decorative flourish that repeats nearby text.
- Do not repeat the full paragraph as alt text. A clue image can instead have a
  short description such as "Archive badge reader showing Mina at 10:16" while
  the canonical detail remains in the clue body.
- Keep native buttons, labels, fieldsets, headings, ordered timelines, and live
  announcements.
- Preserve visible focus, keyboard operation, 320-pixel layout, forced-colors
  support, and reduced-motion support.
- Never encode suspects or evidence categories only by color, silhouette, accent,
  sound, or portrait expression.
- Caption/transcribe speech and meaningful sounds. Provide a no-audio route to the
  same deduction.
- Avoid text baked into images. When a prop must contain text, repeat it as HTML
  and make sure it matches `js/cases.js`.
- Check that generated faces, roles, and environments do not introduce misleading
  stereotypes or accidental identifying marks.

## 7. Acquiring assets safely

"Free to download," "generated by AI," and "purchased" do not automatically mean
"safe to ship." For every asset, confirm that the exact item and chosen plan allow
the intended game use.

### Rights checklist

Before integration, record:

1. Asset filename and in-game purpose.
2. Original title, creator, source page, and direct item identifier.
3. Acquisition date and, when useful, a checksum of the downloaded original.
4. Exact license name/version and a local copy or durable reference to its terms.
5. Whether commercial use, modification, web embedding, game distribution, and
   worldwide distribution are allowed.
6. Attribution wording and where it must appear.
7. Restrictions on redistribution, sublicensing, templates, logos, trademarks,
   sensitive uses, AI training, voice cloning, or use as a standalone file.
8. Purchase/order reference when needed for proof, kept without private payment
   data.
9. Tools and model/version used, prompts or briefs worth preserving, and edits
   made.
10. Reviewer and approval date.

A starting `assets/SOURCES.md` row can use:

```text
| Runtime file | Creator/source | Acquired | License/plan | Changes | Attribution | Proof location | Reviewer |
```

Modification does not erase the original license. Keep attribution and
share-alike obligations when they apply. Do not use ripped game assets, fan art,
search-result images, unlicensed fonts, celebrity likenesses, cloned voices
without authorization, or music that merely "sounds royalty-free."

### Choice and tradeoff matrix

These are possibilities, not endorsements. Availability, terms, quality, and
pricing change; verify the exact item and current terms yourself.

| Choice | Advantages | Costs and risks | Best fit here |
| --- | --- | --- | --- |
| Create first-party art/audio | Maximum control, strongest visual consistency, editable sources | Time, skill, equipment, and review effort | Brand mark, UI icons, stylized portraits, custom clue documents, bespoke SFX |
| Commission a creator | Purpose-built work and human art direction | Budget, schedule, revisions, contract and consent management | Portrait set, key art, score, voice cast; obtain written rights and deliverables |
| Public-domain or CC0 libraries | Low acquisition cost and usually broad reuse | Quality/style inconsistency; source may mislabel rights; trademarks and depicted people can remain issues | Textures, ambience, utility sounds after independent verification |
| Other free libraries | Wide choice and fast prototyping | Attribution, noncommercial, share-alike, or redistribution terms may conflict | Placeholders or shipped assets only after per-item review |
| Paid stock or game-asset libraries | Searchable quality, support, and purchase evidence | Per-seat/project limits, no-standalone-redistribution clauses, subscription loss, common-looking art | Backgrounds, UI kits, SFX, music when the license explicitly covers browser games |
| UI/component or icon libraries | Consistent symbols and fast implementation | Code/runtime dependencies, license notices, unused bulk, CSP and accessibility work | Prefer extracting and self-hosting only allowed, used icons rather than adding a framework |
| 3D model libraries | Fast props and environment prototypes | Excess geometry/materials, incompatible rigs, unclear scans/trademarks, renderer not present | Future 3D prototype only after architecture approval |
| Downloadable creator packs | Cohesive sets at a predictable price | License may forbid sharing source pack files; style can dictate the game | A complete portrait/UI/audio family, not isolated mismatched items |
| Generative image/audio/3D tools | Fast ideation and variations | Provider terms, uncertain exclusivity/provenance, inconsistent characters, artifacts, likeness/trademark and training-data concerns | Mood boards and reviewed derivatives; final use only with documented rights |
| Modify an allowed asset | Faster than starting over; can unify palette and dimensions | Original restrictions survive; heavy edits can cost more than expected | Recoloring licensed icons, cropping stock, cleaning audio, retopologizing an allowed model |

Examples worth comparing include:

- **2D/icon/font libraries:** Kenney, OpenGameArt, itch.io asset packs, Font
  Awesome, Heroicons, Lucide, Google Fonts, and commercial stock marketplaces.
  Do not assume one license covers every item or that "open source" removes
  attribution/notice duties.
- **Audio libraries:** Freesound, game-audio packs, production-music libraries,
  direct composer/sound-designer work, and generated-audio services. Verify each
  recording, not just the website's general reputation.
- **3D libraries:** Sketchfab, BlenderKit, CGTrader, TurboSquid, Poly Haven, and
  marketplace model packs. A site's filters are not a substitute for reading the
  selected model's license.
- **Creation/editing tools:** GIMP or Krita for raster work, Inkscape for vector
  work, Blender for 3D, and Audacity or a DAW for audio. Tool ownership does not
  grant rights to imported templates, brushes, models, fonts, or samples.

Scan unfamiliar downloads, inspect archives before extraction, and remove
executables, scripts, macros, external references, and files unrelated to the
licensed item. Optimize a copy; preserve the clean original and license evidence.

### ElevenLabs options

If the selected ElevenLabs account offers music, voice, or sound-effect generation,
it can be compared with human creation and stock libraries for:

- A low-key investigation music bed and short reveal stings.
- Interface, evidence, mechanical, room, and transition sound effects.
- Temporary or final narration and character dialogue.

Before using any output, verify the current product/plan terms for commercial
game distribution, attribution, retention, generated-output rights, and any
restrictions on uploaded material. Product capabilities and plans can change.

For voice:

- Use only voices the project is authorized to use.
- Obtain explicit, documented consent for cloning or a custom performer voice,
  including the intended game, edits, duration, territories, and synthetic use.
- Do not imitate a real person or performer without authorization.
- Keep the approved script, output, tool/voice identifier, generation date, and
  consent/proof location in the source record.
- Review pronunciation, emotion, continuity, bias, and accidental extra speech.
- Supply the exact on-screen transcript and a non-voice fallback.

For music and SFX:

- Record the prompt/brief and generation date.
- Listen for recognizable third-party material, clipping, noise, awkward loops,
  excessive loudness, or hidden speech.
- Edit and normalize in an audio tool, export a lossless master, then make runtime
  encodes.

Do not call a generation API directly from the shipped browser game. Export
approved files, self-host them, and never expose an API key.

### Gemini, ChatGPT, Kittl, Canva, and GIMP

These tools can serve different steps; none is automatically the best source:

- **Gemini or ChatGPT:** brainstorm an art brief, prompt variants, alt-text drafts,
  asset inventories, or—where the selected product supports it—generate image
  concepts. Check the current account terms and model/output rules. Human-review
  every factual clue and do not upload confidential, personal, or unlicensed
  reference material.
- **Kittl:** explore title treatments, vector-like compositions, posters, or logo
  directions. Check whether each template, font, illustration, and AI feature may
  be used in a game logo and distributed as an embedded asset.
- **Canva:** quickly compose mood boards, briefing layouts, or marketing variants.
  Check element-by-element licensing, template restrictions, team ownership, and
  whether a stock element can be used in a trademark or downloadable game.
- **GIMP:** crop, paint, color-correct, remove artifacts, build transparent
  composites, and export WebP/PNG/JPEG. GIMP is an editor; it does not make an
  unlicensed input legal. Keep the XCF source when layers matter.

For generated or templated character consistency, make a written character sheet
first: age range, role, silhouette, wardrobe, palette, camera angle, lighting,
expression list, and prohibited details. Compare all four portraits together.
Record which source images and tools were used. For generated 3D, also inspect and
repair topology, UVs, scale, normals, materials, and rigging rather than accepting
the first output.

## 8. Import and test workflow

There is no engine importer or build pipeline. "Import" means preparing a web
file, placing it under `assets/`, referencing it in HTML/CSS/JavaScript, and
testing the browser result.

### Add one asset

1. **Name the purpose.** Identify the exact scene, data ID, and fallback. Example:
   Mina's briefing portrait supports suspect ID `mina`; her name and role remain
   visible if it fails.
2. **Clear rights first.** Complete a provisional source-register row before
   editing the game.
3. **Quarantine and inspect a download.** Scan it, inspect SVG/source contents,
   remove unrelated files, and confirm dimensions, channels, sample rate, model
   structure, and embedded metadata.
4. **Preserve the source.** Put a reasonably sized editable master in the matching
   `asset-sources/` directory or record its controlled external location.
5. **Export for runtime.** Apply the format, dimensions, color space, compression,
   loudness, and metadata guidance above. Compare the export with the source.
6. **Place and name it.** Put the optimized file in exactly one matching
   `assets/` subdirectory using kebab-case.
7. **Teach the server the type.** If this extension is new, update the MIME table
   in `server.mjs`.
8. **Add metadata close to content.** Portrait/location/evidence paths belong with
   their corresponding objects in `js/cases.js`; global decorative assets can be
   referenced by their renderer or `index.html`. Avoid a path scattered across
   multiple functions.
9. **Render through a reusable helper.** Update `js/main.js` once for each asset
   shape rather than hand-building every suspect or clue image. Add dimensions,
   alt behavior, lazy loading, and missing-asset behavior.
10. **Style responsively.** Update `styles.css`; check 320 pixels, wide desktop,
    zoom, long text, forced colors, reduced motion, and portrait cropping.
11. **Run automated checks.** Run `npm test`. If asset paths become required case
    data, extend case validation/tests so missing or malformed references fail
    clearly.
12. **Run the local server.** Use `npm start`, then inspect the browser console and
    Network panel for 404s, MIME errors, CSP errors, dimensions, transfer sizes,
    and unexpected eager loads.
13. **Play every affected route.** Home → briefing → investigation → timeline →
    confrontation → accusation → result, including failure and missing-media
    behavior.
14. **Complete review.** Check rights, attribution, visual/audio quality,
    accessibility, narrative accuracy, and `assets/SOURCES.md` before acceptance.

### Add audio safely

1. Add visible mute/volume controls before the first sound.
2. Create one audio manager rather than a new `<audio>` element for every click.
3. Unlock playback from a user action; do not autoplay the title screen.
4. Define whether cues can overlap, interrupt, duck music, or be skipped.
5. Use preload sparingly and load case-specific voice only for that case.
6. Test with audio denied, missing, slow, muted, and interrupted.
7. Confirm that every gameplay fact remains available as text.

### Replace an asset

1. Confirm the replacement has equal or better rights documentation.
2. Compare aspect ratio, intrinsic dimensions, color profile, alpha, duration,
   loop point, loudness, codec, and filename case.
3. Prefer the same semantic runtime path when the role is unchanged. If the path
   changes, search every HTML, CSS, JavaScript, test, and source-register
   reference.
4. Keep the old asset until every scene using it has been tested; then remove the
   old runtime and source file only if no other content references it.
5. Update provenance and attribution. Do not leave stale creator/license records.
6. Repeat the automated, console, network, responsive, accessibility, and full-flow
   checks.

### Final asset checklist

- [ ] The asset serves a named scene/content ID and is not speculative bulk.
- [ ] Its exact rights, creator, source, date, edits, and attribution are recorded.
- [ ] Consent and identity checks are complete for any real or synthetic voice or
      likeness.
- [ ] The runtime file is optimized and the editable source/proof location is
      retained.
- [ ] Filename, directory, URL casing, MIME type, and CSP behavior are correct.
- [ ] No secrets, API keys, trackers, external dependencies, or unsafe SVG/code
      were added.
- [ ] Intrinsic dimensions or audio/video metadata are set; optional media is
      lazy-loaded.
- [ ] Text, keyboard, focus, screen-reader, forced-colors, reduced-motion, zoom,
      and 320-pixel behavior still work.
- [ ] Missing/blocked media has a graceful fallback.
- [ ] `npm test` passes.
- [ ] The browser console and Network panel have no asset errors.
- [ ] All affected scenes and all four case variants remain narratively accurate.

## 9. Placeholder and minimum viable packs

The current CSS-only presentation is already a valid placeholder pack. It is
fast, consistent, accessible, and complete. Do not replace it with low-quality or
poorly licensed media merely to make the repository contain assets.

Safe placeholders include:

- CSS blocks, borders, gradients, initials, and geometric symbols.
- A first-party monochrome line-icon set.
- Labeled aspect-ratio boxes with a neutral pattern.
- Generic "document," "recording," "statement," and "physical evidence" icons
  next to the full existing text.
- Silence, with no broken audio controls.

Never use a placeholder that appears to prove a clue the authored text does not
prove. Mark internal-only temporary downloads clearly and remove them before a
public build unless they have shipping rights.

### Pack A: smallest coherent visual pass

- One SVG brand mark and favicon.
- Four same-style suspect portraits.
- Five same-style location images.
- Six same-style UI icons.
- No evidence illustrations, custom font, voice, video, or 3D.

This pack touches every major screen while keeping scope and download size
manageable.

### Pack B: smallest coherent audio pass

- One optional, quiet investigation loop.
- Six short semantic cues: activate, evidence, contradiction, confrontation,
  success, and failure.
- Mute/volume controls and persistence.
- No voice.

This pack requires more code and testing than its file count suggests. Do it after
the visual integration is stable.

### Pack C: evidence-rich vertical slice

- Complete Pack A.
- One case variant's full evidence image family, including both contradiction
  prerequisites and confrontation evidence.
- One portrait expression change for that culprit.
- One contradiction sting and one result cue.

Treat Pack C as a style and workflow test. Do not illustrate random clues across
all variants. After review, either complete the same asset coverage for the other
three variants or retain generic evidence icons everywhere.

## 10. Associated-files map

This map prevents an asset-only task from drifting into unrelated game logic.

### Inspect for almost every asset contribution

| Existing path | Why inspect it |
| --- | --- |
| [`../index.html`](../index.html) | Document shell, favicon, brand markup, CSP, app mount |
| [`../styles.css`](../styles.css) | Current palette, typography, layouts, responsive breakpoint, focus, forced colors, reduced motion |
| [`../js/main.js`](../js/main.js) | Every logical scene and all DOM rendering/event transitions |
| [`../js/cases.js`](../js/cases.js) | Canonical suspect/location/evidence IDs, clue wording, and case-specific meaning |
| [`contradiction-system.md`](contradiction-system.md) | Timeline, contradiction, accessibility, and acceptance constraints |
| [`../server.mjs`](../server.mjs) | MIME types, static URLs, response CSP, and `nosniff` behavior |

### Change only when the asset integration requires it

| Existing path | Appropriate asset-related change |
| --- | --- |
| `index.html` | Favicon, logo markup, deliberate preload, or synchronized CSP |
| `styles.css` | Asset sizing, crop, visual states, `@font-face`, responsive and accessibility behavior |
| `js/main.js` | Reusable media rendering, asset loading/fallback, audio controls and semantic cue playback |
| `js/cases.js` | Optional portrait/location/evidence/voice metadata tied to canonical IDs |
| `server.mjs` | MIME mappings or synchronized CSP for file types actually added |
| `test/engine.test.js` | Data-validation coverage if the case schema gains required asset metadata |
| `package.json` | Only if the team deliberately adopts an optimizer/checker; do not add a dependency just to copy files |

### Normally irrelevant to a visual/audio replacement

| Existing path | Why it normally stays unchanged |
| --- | --- |
| [`../js/engine.js`](../js/engine.js) | Pure game-state, action, contradiction, timeline, hint, scoring, and case validation logic; a media swap must not change deduction behavior |
| [`../test/engine.test.js`](../test/engine.test.js) | Tests deduction behavior, not pixels or playback; change only for an intentional data contract |
| [`../README.md`](../README.md) | Project overview and commands already apply; normal asset swaps need no README edit |
| [`contradiction-system.md`](contradiction-system.md) | Existing feature contract; inspect it but do not rewrite it for art implementation details |
| `package.json` | Existing dependency-free scripts need no change for hand-optimized assets |

New runtime files belong only in the proposed `assets/` tree, new editable
originals only in the proposed `asset-sources/` tree, and rights records in the
proposed `assets/SOURCES.md`. Those proposed paths are intentionally absent until
the first approved asset lands. All other paths named in the associated-files map
exist in the current repository.