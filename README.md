# Game Experiment Detective

**The Vanishing Variable** is a dependency-free browser detective game. Investigate
the sabotage of a secret game experiment, question four suspects, collect evidence,
and prove who took the missing data drive before the lockdown ends.

## Play

Serve the game locally:

```sh
npm start
```

Then open `http://localhost:8080`.

Opening `index.html` directly is not the supported workflow because browsers may
block its JavaScript modules when they are loaded from a `file://` URL.

> `npm start` is for trusted local development only. The current server exposes
> files from the whole repository and does not explicitly bind to loopback. Do
> not expose its port publicly, share the URL on an untrusted network, or treat
> it as a production server.

## How it works

- Spend a limited number of actions searching locations and interviewing suspects.
- Reconstruct events in a chronological evidence timeline.
- Compare statements with scene evidence to expose one contradiction per case.
- Confront the suspect to unlock the decisive account behind their lie.
- Name the culprit, identify their motive, and submit two pieces of proof.
- Replay four authored case variants, each with a different culprit and solution.
- Progress and best scores are saved locally when browser storage is available.

## Development

No dependencies or build step are required. Run the complete local check suite with:

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
