import assert from "node:assert/strict";
import test from "node:test";

import { cases } from "../js/cases.js";
import {
  MAX_ACTIONS,
  createSession,
  enterAccusation,
  evaluateAccusation,
  performInvestigation,
  requestHint,
} from "../js/engine.js";

test("every authored case is internally valid and has three decisive clues", () => {
  for (const caseData of cases) {
    const allEvidence = [
      ...Object.values(caseData.locationEvidence),
      ...Object.values(caseData.interviews),
    ];
    const ids = allEvidence.map((item) => item.id);
    assert.equal(
      new Set(ids).size,
      ids.length,
      `${caseData.id} has duplicate evidence`,
    );
    assert.equal(caseData.keyEvidenceIds.length, 3);
    assert.ok(caseData.keyEvidenceIds.every((id) => ids.includes(id)));
    assert.ok(caseData.culpritId);
    assert.ok(caseData.motiveId);
    assert.ok(caseData.resolution.length > 20);
  }
});

test("investigation actions collect evidence once and cost one action", () => {
  const caseData = cases[0];
  const initial = createSession(caseData.id);
  const searched = performInvestigation(
    initial,
    caseData,
    "location",
    "archive",
  );
  assert.equal(searched.actionsLeft, MAX_ACTIONS - 1);
  assert.deepEqual(
    searched.evidence.map((item) => item.id),
    ["mina-badge"],
  );
  assert.equal(
    performInvestigation(searched, caseData, "location", "archive"),
    searched,
  );
  assert.equal(
    performInvestigation(searched, caseData, "location", "unknown"),
    searched,
  );
});

test("a hint identifies an unfound decisive clue and costs two actions once", () => {
  const caseData = cases[1];
  const initial = createSession(caseData.id);
  const outcome = requestHint(initial, caseData);
  assert.equal(outcome.session.actionsLeft, MAX_ACTIONS - 2);
  assert.equal(outcome.session.hintUsed, true);
  assert.match(outcome.hint, /search|interview/);
  assert.equal(requestHint(outcome.session, caseData).session, outcome.session);
});

test("accusations require exactly two distinct collected clues", () => {
  const caseData = cases[2];
  let session = createSession(caseData.id);
  session = performInvestigation(session, caseData, "location", "archive");
  session = performInvestigation(session, caseData, "location", "office");
  session = enterAccusation(session);

  const incomplete = evaluateAccusation(session, caseData, {
    suspectId: "rhea",
    motiveId: "sale",
    evidenceIds: ["rhea-key"],
  });
  assert.equal(incomplete.ok, false);

  const duplicate = evaluateAccusation(session, caseData, {
    suspectId: "rhea",
    motiveId: "sale",
    evidenceIds: ["rhea-key", "rhea-key"],
  });
  assert.equal(duplicate.ok, false);
});

test("correct suspect, motive, and two key clues prove each case", () => {
  for (const caseData of cases) {
    let session = createSession(caseData.id);
    for (const [location, evidence] of Object.entries(
      caseData.locationEvidence,
    )) {
      if (caseData.keyEvidenceIds.includes(evidence.id)) {
        session = performInvestigation(session, caseData, "location", location);
      }
    }
    for (const [suspect, evidence] of Object.entries(caseData.interviews)) {
      if (
        caseData.keyEvidenceIds.includes(evidence.id) &&
        !session.evidence.some((item) => item.id === evidence.id)
      ) {
        session = performInvestigation(session, caseData, "interview", suspect);
      }
    }
    session = enterAccusation(session);
    const outcome = evaluateAccusation(session, caseData, {
      suspectId: caseData.culpritId,
      motiveId: caseData.motiveId,
      evidenceIds: caseData.keyEvidenceIds.slice(0, 2),
    });
    assert.equal(outcome.ok, true);
    assert.equal(outcome.result.won, true, caseData.id);
    assert.equal(outcome.session.phase, "resolved");
  }
});

test("red herrings or a wrong theory fail without corrupting the result", () => {
  const caseData = cases[3];
  let session = createSession(caseData.id);
  session = performInvestigation(session, caseData, "location", "control");
  session = performInvestigation(session, caseData, "location", "archive");
  session = enterAccusation(session);
  const outcome = evaluateAccusation(session, caseData, {
    suspectId: "mina",
    motiveId: "protect",
    evidenceIds: ["local-wipe", "owen-dust"],
  });
  assert.equal(outcome.ok, true);
  assert.equal(outcome.result.won, false);
  assert.equal(outcome.result.decisiveEvidence, 1);
});
