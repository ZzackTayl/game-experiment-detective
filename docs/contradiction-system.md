# Timeline, Contradiction, and Confrontation System

## Goal

Turn collected clues into active deduction. Players should reconstruct the incident
chronologically, discover one evidence-backed lie, and confront the responsible
suspect before making a final accusation.

## Player flow

1. Search locations and interview suspects as before.
2. Collected evidence is placed automatically on a chronological incident timeline.
3. Collecting both clues in a case's contradiction pair exposes the conflict,
   regardless of collection order.
4. The contradiction unlocks one suspect confrontation. Confronting costs one
   action and produces a decisive admission or reveal.
5. The accusation phase unlocks only after the confrontation is complete.
6. A winning accusation must include the confrontation evidence and one other
   decisive clue, alongside the correct culprit and motive.

## Authored content

Every case defines:

- Timeline metadata for all location and interview evidence.
- Exactly one contradiction with two distinct prerequisite evidence IDs.
- Exactly one suspect confrontation.
- One unique confrontation evidence item with timeline metadata.
- Three decisive evidence IDs, including the confrontation evidence.

Timeline values use 24-hour `HH:mm` strings from `22:05` through `22:26`.
The interface formats them as local narrative times such as `10:17 p.m.`. Entries
may be `verified`, `claimed`, `inferred`, or `admitted`.

### Case contradictions

| Case   | Statement                                        | Contradicting evidence                                     | Confrontation                                            |
| ------ | ------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------- |
| ECHO-A | Mina says she remained in the break room         | Later camera stills show only her staged mug               | Mina admits staging the alibi and entering the archive   |
| ECHO-B | Jon says the build server rebooted at 10:17      | Continuous UPS and uptime records prove no reboot occurred | Jon admits using the maintenance session to run the wipe |
| ECHO-C | Rhea denies having a buyer or arranging a pickup | The buyer addendum promises payment for the exact drive    | Its delivery code reveals her alias courier booking      |
| ECHO-D | Owen says he never left the test booth           | His controller recording is a repeating playback loop      | Owen admits using the loop to cover his hatch route      |

## State and action rules

- Contradiction detection is automatic, costs no action, and is order-independent.
- A locked, duplicate, unknown, or out-of-phase confrontation is an identity no-op.
- A valid confrontation costs exactly one action and adds one evidence item.
- Repeating a completed confrontation never spends another action.
- Investigation actions and confrontations never reduce the budget below zero.
- Reaching zero actions after confrontation opens the accusation phase.
- Reaching zero actions without confrontation produces an exhausted-case state.
- Hints prioritize a missing contradiction prerequisite, then the unlocked
  confrontation, then another decisive clue.

## Interface and accessibility

- The timeline is a semantic ordered list sorted by incident time.
- Every entry includes textual time, status, source, title, and description.
- Contradictions remain visible as persistent content and identify both conflicting
  clues in text.
- Unlocking a confrontation is announced once through the polite live region
  without stealing focus.
- Confrontations use native buttons with the suspect's name in the visible label.
- Locked and completed states use text rather than color alone.
- Newly produced confrontation evidence receives programmatic focus when the
  investigation screen remains active. A final-action confrontation transitions
  directly to accusation, focuses the main region, and announces the transition.
- The timeline remains one-dimensional and readable at 320 CSS pixels, with CSS
  disabled, in forced-colors mode, and with reduced motion enabled.

## Acceptance criteria

- All four variants expose exactly one coherent contradiction and confrontation.
- Both prerequisite collection orders produce the same detected contradiction.
- Confrontation is unavailable with zero or one prerequisite.
- A valid confrontation spends one action and cannot be repeated.
- The accusation evaluator independently rejects unresolved cases.
- Two ordinary decisive clues cannot bypass mandatory confrontation evidence.
- Timeline sorting is deterministic and does not mutate session or case data.
- Every evidence reference and timeline value passes content validation.
- The complete flow works with keyboard controls and has no browser console errors.
- The investigation screen and its timeline and confrontation regions, plus the
  accusation and result screens, have no horizontal page overflow at 320 pixels.
