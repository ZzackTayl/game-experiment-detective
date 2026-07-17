import assert from "node:assert/strict";
import test from "node:test";

import { cases } from "../js/cases.js";
import {
  MAX_ACTIONS,
  canAccuse,
  createSession,
  enterAccusation,
  evaluateAccusation,
  getConfrontationAvailability,
  getEvidenceTimeline,
  performConfrontation,
  performInvestigation,
  requestHint,
  validateCaseData,
} from "../js/engine.js";

function collectEvidence(session, caseData, evidenceId) {
  const location = Object.entries(caseData.locationEvidence).find(
    ([, evidence]) => evidence.id === evidenceId,
  );
  if (location) {
    return performInvestigation(session, caseData, "location", location[0]);
  }
  const interview = Object.entries(caseData.interviews).find(
    ([, evidence]) => evidence.id === evidenceId,
  );
  if (interview) {
    return performInvestigation(session, caseData, "interview", interview[0]);
  }
  throw new Error(`Unknown base evidence: ${evidenceId}`);
}

function confrontCase(caseData) {
  let session = createSession(caseData.id);
  for (const evidenceId of caseData.contradiction.prerequisiteIds) {
    session = collectEvidence(session, caseData, evidenceId);
  }
  return performConfrontation(session, caseData);
}

test("every authored case passes contradiction and timeline validation", () => {
  for (const caseData of cases) {
    assert.deepEqual(validateCaseData(caseData), [], caseData.id);
    assert.equal(caseData.keyEvidenceIds.length, 3);
    assert.ok(
      caseData.keyEvidenceIds.includes(caseData.contradiction.confrontation.id),
    );
    assert.equal(caseData.contradiction.prerequisiteIds.length, 2);
  }
});

test("investigation actions collect timestamped evidence once and cost one action", () => {
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
  assert.deepEqual(searched.evidence[0].timeline, {
    start: "22:16",
    status: "verified",
  });
  assert.equal(
    performInvestigation(searched, caseData, "location", "archive"),
    searched,
  );
  assert.equal(
    performInvestigation(searched, caseData, "location", "unknown"),
    searched,
  );
});

test("contradictions unlock in either prerequisite order for every case", () => {
  for (const caseData of cases) {
    const [firstId, secondId] = caseData.contradiction.prerequisiteIds;
    let forward = createSession(caseData.id);
    forward = collectEvidence(forward, caseData, firstId);
    assert.deepEqual(forward.resolvedContradictionIds, []);
    assert.equal(
      getConfrontationAvailability(forward, caseData).status,
      "locked",
    );
    forward = collectEvidence(forward, caseData, secondId);

    let reverse = createSession(caseData.id);
    reverse = collectEvidence(reverse, caseData, secondId);
    reverse = collectEvidence(reverse, caseData, firstId);

    assert.deepEqual(forward.resolvedContradictionIds, [
      caseData.contradiction.id,
    ]);
    assert.deepEqual(
      reverse.resolvedContradictionIds,
      forward.resolvedContradictionIds,
    );
    assert.equal(
      getConfrontationAvailability(forward, caseData).status,
      "available",
    );
    assert.equal(
      getConfrontationAvailability(reverse, caseData).status,
      "available",
    );
  }
});

test("locked and duplicate confrontations are no-ops", () => {
  const caseData = cases[0];
  const initial = createSession(caseData.id);
  assert.equal(performConfrontation(initial, caseData), initial);

  let detected = collectEvidence(
    initial,
    caseData,
    caseData.contradiction.prerequisiteIds[0],
  );
  assert.equal(performConfrontation(detected, caseData), detected);
  detected = collectEvidence(
    detected,
    caseData,
    caseData.contradiction.prerequisiteIds[1],
  );

  const confronted = performConfrontation(detected, caseData);
  assert.equal(confronted.actionsLeft, detected.actionsLeft - 1);
  assert.equal(confronted.evidence.at(-1).source, "confrontation");
  assert.equal(
    confronted.evidence.at(-1).id,
    caseData.contradiction.confrontation.id,
  );
  assert.equal(
    getConfrontationAvailability(confronted, caseData).status,
    "completed",
  );
  assert.equal(performConfrontation(confronted, caseData), confronted);
});

test("a confrontation can spend the final action atomically", () => {
  const caseData = cases[1];
  let session = createSession(caseData.id);
  for (const evidenceId of caseData.contradiction.prerequisiteIds) {
    session = collectEvidence(session, caseData, evidenceId);
  }
  session = { ...session, actionsLeft: 1 };
  session = performConfrontation(session, caseData);
  assert.equal(session.actionsLeft, 0);
  assert.equal(session.phase, "accusing");
  assert.equal(canAccuse(session, caseData), true);
});

test("using the final action without confrontation exhausts the case", () => {
  const caseData = cases[2];
  const initial = {
    ...createSession(caseData.id),
    actionsLeft: 1,
  };
  const exhausted = collectEvidence(
    initial,
    caseData,
    caseData.contradiction.prerequisiteIds[0],
  );
  assert.equal(exhausted.actionsLeft, 0);
  assert.equal(exhausted.phase, "exhausted");
  assert.equal(canAccuse(exhausted, caseData), false);
});

test("finding the contradiction with the final action does not grant a free confrontation", () => {
  const caseData = cases[2];
  const [firstId, secondId] = caseData.contradiction.prerequisiteIds;
  let session = collectEvidence(createSession(caseData.id), caseData, firstId);
  session = { ...session, actionsLeft: 1 };
  session = collectEvidence(session, caseData, secondId);
  assert.equal(session.actionsLeft, 0);
  assert.equal(session.phase, "exhausted");
  assert.deepEqual(session.resolvedContradictionIds, [
    caseData.contradiction.id,
  ]);
  assert.equal(performConfrontation(session, caseData), session);
});

test("timeline sorting is chronological, stable, and non-mutating", () => {
  const caseData = cases[3];
  let session = createSession(caseData.id);
  session = collectEvidence(session, caseData, "mina-jon");
  session = collectEvidence(session, caseData, "owen-press");
  session = collectEvidence(session, caseData, "local-wipe");
  const originalOrder = session.evidence.map((item) => item.id);
  const timeline = getEvidenceTimeline(session);
  assert.deepEqual(
    timeline.map((item) => item.id),
    ["owen-press", "mina-jon", "local-wipe"],
  );
  assert.deepEqual(
    session.evidence.map((item) => item.id),
    originalOrder,
  );
});

test("hints prioritize contradiction progress and cost two actions once", () => {
  const caseData = cases[1];
  const initial = createSession(caseData.id);
  const outcome = requestHint(initial, caseData);
  assert.equal(outcome.session.actionsLeft, MAX_ACTIONS - 2);
  assert.equal(outcome.session.hintUsed, true);
  assert.match(outcome.hint, /search|interview/);
  assert.equal(requestHint(outcome.session, caseData).session, outcome.session);
});

test("a hint points to confrontation after both sides of the lie are found", () => {
  const caseData = cases[1];
  let session = createSession(caseData.id);
  for (const evidenceId of caseData.contradiction.prerequisiteIds) {
    session = collectEvidence(session, caseData, evidenceId);
  }
  const outcome = requestHint(session, caseData);
  assert.match(outcome.hint, /confront/i);
  assert.doesNotMatch(outcome.hint, /undefined/);
});

test("accusations are unavailable until confrontation is complete", () => {
  const caseData = cases[2];
  let session = createSession(caseData.id);
  for (const evidenceId of caseData.contradiction.prerequisiteIds) {
    session = collectEvidence(session, caseData, evidenceId);
  }
  assert.equal(enterAccusation(session, caseData), session);
  const forged = evaluateAccusation(
    { ...session, phase: "accusing" },
    caseData,
    null,
  );
  assert.equal(forged.ok, false);
  assert.match(forged.error, /confront/i);
});

test("accusations require exactly two distinct collected clues", () => {
  const caseData = cases[2];
  let session = confrontCase(caseData);
  session = enterAccusation(session, caseData);

  const incomplete = evaluateAccusation(session, caseData, {
    suspectId: "rhea",
    motiveId: "sale",
    evidenceIds: [caseData.contradiction.confrontation.id],
  });
  assert.equal(incomplete.ok, false);

  const duplicate = evaluateAccusation(session, caseData, {
    suspectId: "rhea",
    motiveId: "sale",
    evidenceIds: [
      caseData.contradiction.confrontation.id,
      caseData.contradiction.confrontation.id,
    ],
  });
  assert.equal(duplicate.ok, false);
});

test("correct theory with confrontation evidence proves every case", () => {
  for (const caseData of cases) {
    let session = confrontCase(caseData);
    const otherKeyId = caseData.keyEvidenceIds.find(
      (id) => id !== caseData.contradiction.confrontation.id,
    );
    if (!session.evidence.some((item) => item.id === otherKeyId)) {
      session = collectEvidence(session, caseData, otherKeyId);
    }
    session = enterAccusation(session, caseData);
    const outcome = evaluateAccusation(session, caseData, {
      suspectId: caseData.culpritId,
      motiveId: caseData.motiveId,
      evidenceIds: [caseData.contradiction.confrontation.id, otherKeyId],
    });
    assert.equal(outcome.ok, true);
    assert.equal(outcome.result.won, true, caseData.id);
    assert.equal(outcome.result.includesConfrontation, true);
    assert.equal(outcome.session.phase, "resolved");
  }
});

test("two ordinary decisive clues cannot bypass confrontation evidence", () => {
  const caseData = cases[3];
  let session = confrontCase(caseData);
  const ordinaryKeyIds = caseData.keyEvidenceIds.filter(
    (id) => id !== caseData.contradiction.confrontation.id,
  );
  for (const evidenceId of ordinaryKeyIds) {
    if (!session.evidence.some((item) => item.id === evidenceId)) {
      session = collectEvidence(session, caseData, evidenceId);
    }
  }
  session = enterAccusation(session, caseData);
  const outcome = evaluateAccusation(session, caseData, {
    suspectId: caseData.culpritId,
    motiveId: caseData.motiveId,
    evidenceIds: ordinaryKeyIds,
  });
  assert.equal(outcome.ok, true);
  assert.equal(outcome.result.won, false);
  assert.equal(outcome.result.includesConfrontation, false);
});

test("red herrings or a wrong theory fail without corrupting the result", () => {
  const caseData = cases[0];
  let session = confrontCase(caseData);
  if (!session.evidence.some((item) => item.id === "local-wipe")) {
    session = collectEvidence(session, caseData, "local-wipe");
  }
  session = enterAccusation(session, caseData);
  const outcome = evaluateAccusation(session, caseData, {
    suspectId: "jon",
    motiveId: "coverup",
    evidenceIds: ["local-wipe", "mina-confrontation"],
  });
  assert.equal(outcome.ok, true);
  assert.equal(outcome.result.won, false);
  assert.equal(outcome.result.decisiveEvidence, 1);
});

test("case validation reports broken references, times, and statuses", () => {
  const invalid = structuredClone(cases[0]);
  invalid.contradiction.prerequisiteIds[0] = "missing-statement";
  invalid.keyEvidenceIds[0] = "missing-proof";
  invalid.timeline["local-wipe"].start = "23:00";
  invalid.timeline["mina-badge"].status = "uncertain";
  invalid.keyEvidenceIds.pop();
  const errors = validateCaseData(invalid);
  assert.ok(errors.some((message) => message.includes("prerequisite")));
  assert.ok(errors.some((message) => message.includes("decisive")));
  assert.ok(errors.some((message) => message.includes("three distinct")));
  assert.ok(
    errors.filter((message) => message.includes("timeline")).length >= 2,
  );
});
