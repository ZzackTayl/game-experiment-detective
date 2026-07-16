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
- Build a casebook of evidence while separating decisive clues from red herrings.
- Name the culprit, identify their motive, and submit two pieces of proof.
- Replay four authored case variants, each with a different culprit and solution.
- Progress and best scores are saved locally when browser storage is available.

## Development

No dependencies or build step are required. Run the complete local check suite with:

```sh
npm test
```
