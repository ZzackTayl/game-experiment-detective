import assert from "node:assert/strict";
import test from "node:test";

import { caseData } from "../public/app/case-data.js";
import { evaluateAccusation, validateCase } from "../public/app/game-engine.js";

test("the production case is structurally valid and serializable", () => {
  assert.deepEqual(validateCase(caseData), []);
  assert.deepEqual(JSON.parse(JSON.stringify(caseData)), caseData);
  assert.equal(caseData.phases.length, 3);
  assert.equal(caseData.suspects.length, 4);
  assert.equal(caseData.evidence.length, 10);
  assert.equal(caseData.statements.length, 12);

  assert.deepEqual(
    caseData.phases.map(
      (phase) =>
        caseData.evidence.filter((item) => item.phase === phase.id).length,
    ),
    [3, 4, 3],
  );
  assert.ok(
    caseData.phases.every(
      (phase) =>
        caseData.statements.filter((statement) => statement.phase === phase.id)
          .length === caseData.suspects.length,
    ),
  );
});

test("the authored solution accepts alternatives but rejects red herrings", () => {
  assert.equal(
    evaluateAccusation(caseData, {
      culpritId: "ada-rook",
      evidenceIds: [
        "stopped-watch",
        "missing-heel-lug",
        "bell-without-a-hand",
        "lure-note",
      ],
    }),
    true,
  );
  assert.equal(
    evaluateAccusation(caseData, {
      culpritId: "ada-rook",
      evidenceIds: [
        "rainwater-lungs",
        "missing-heel-lug",
        "honest-machines",
        "lure-note",
      ],
    }),
    true,
  );
  assert.equal(
    evaluateAccusation(caseData, {
      culpritId: "finn-merrow",
      evidenceIds: [
        "stopped-watch",
        "missing-heel-lug",
        "bell-without-a-hand",
        "lure-note",
      ],
    }),
    false,
  );
  assert.equal(
    evaluateAccusation(caseData, {
      culpritId: "ada-rook",
      evidenceIds: [
        "oilskin-initials",
        "missing-sedative",
        "cistern-floor",
        "lure-note",
      ],
    }),
    false,
  );
});
