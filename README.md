# Game Experiment Detective

**The Vanishing Variable** is a dependency-free browser detective game. Investigate
the sabotage of a secret game experiment, question four suspects, collect evidence,
and prove who took the missing data drive before the lockdown ends.

## Play

The game can be opened directly from `index.html`, or served locally:

```sh
npm start
```

Then open `http://localhost:8080`.

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
