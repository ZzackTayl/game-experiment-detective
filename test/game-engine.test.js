import assert from "node:assert/strict";
import test from "node:test";

import {
  ACTIONS,
  createInitialState,
  evaluateAccusation,
  reduceGame,
  selectCanAccuse,
  selectCanAdvance,
  selectPhase,
  selectPhaseProgress,
  selectVisibleEvidence,
  selectVisibleStatements,
  validateCase,
} from "../public/app/game-engine.js";

function createCaseData() {
  return {
    id: "museum-heist",
    version: 3,
    phases: [
      { id: "arrival", title: "Arrival" },
      { id: "reconstruction", title: "Reconstruction" },
    ],
    suspects: [
      { id: "avery", name: "Avery" },
      { id: "blake", name: "Blake" },
      { id: "casey", name: "Casey" },
    ],
    evidence: [
      { id: "guest-log", phase: "arrival" },
      { id: "muddy-print", phase: "arrival" },
      { id: "camera-gap", phase: "reconstruction" },
      { id: "paint-chip", phase: "reconstruction" },
      { id: "fiber", phase: "reconstruction" },
      { id: "receipt", phase: "reconstruction" },
    ],
    statements: [
      { id: "avery-alibi", phase: "arrival", suspectId: "avery" },
      {
        id: "blake-follow-up",
        phase: "reconstruction",
        suspectId: "blake",
      },
    ],
    hints: ["Review the guest log.", "Compare the camera and receipt."],
    solution: {
      culpritId: "blake",
      requiredEvidenceGroups: [
        ["guest-log", "muddy-print"],
        ["camera-gap"],
        ["paint-chip", "fiber"],
      ],
    },
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
  }
  return value;
}

function dispatch(state, type, caseData, details = {}) {
  return reduceGame(state, { type, ...details }, caseData);
}

function reachAccusation(caseData = createCaseData()) {
  let state = createInitialState(caseData);
  state = dispatch(state, ACTIONS.START_CASE, caseData);
  state = dispatch(state, ACTIONS.VIEW_EVIDENCE, caseData, {
    evidenceId: "guest-log",
  });
  state = dispatch(state, ACTIONS.VIEW_EVIDENCE, caseData, {
    evidenceId: "muddy-print",
  });
  state = dispatch(state, ACTIONS.VIEW_STATEMENT, caseData, {
    statementId: "avery-alibi",
  });
  state = dispatch(state, ACTIONS.ADVANCE_PHASE, caseData);
  for (const evidenceId of ["camera-gap", "paint-chip", "fiber", "receipt"]) {
    state = dispatch(state, ACTIONS.VIEW_EVIDENCE, caseData, { evidenceId });
  }
  state = dispatch(state, ACTIONS.VIEW_STATEMENT, caseData, {
    statementId: "blake-follow-up",
  });
  return dispatch(state, ACTIONS.OPEN_ACCUSATION, caseData);
}

test("createInitialState returns a serializable intake state", () => {
  const caseData = createCaseData();
  const state = createInitialState(caseData);

  assert.deepEqual(state, {
    schemaVersion: 1,
    caseId: "museum-heist",
    caseVersion: 3,
    screen: "intake",
    activeTab: "evidence",
    phaseIndex: 0,
    viewedEvidenceIds: [],
    viewedStatementIds: [],
    selectedEvidenceId: null,
    accusation: {
      culpritId: null,
      evidenceIds: [],
    },
    hintsUsed: 0,
    outcome: null,
    submission: null,
  });
  assert.deepEqual(JSON.parse(JSON.stringify(state)), state);
  assert.deepEqual(validateCase(caseData), []);
});

test("submission rejects repeated evidence IDs in externally restored state", () => {
  const caseData = createCaseData();
  let state = reachAccusation(caseData);
  state = dispatch(state, ACTIONS.SET_CULPRIT, caseData, {
    culpritId: "blake",
  });
  state = {
    ...state,
    accusation: {
      culpritId: "blake",
      evidenceIds: ["guest-log", "guest-log", "camera-gap", "paint-chip"],
    },
  };

  assert.equal(dispatch(state, ACTIONS.SUBMIT_ACCUSATION, caseData), state);
});

test("phase selectors expose only the current phase and report progress", () => {
  const caseData = createCaseData();
  let state = createInitialState(caseData);

  assert.equal(selectPhase(caseData, state), caseData.phases[0]);
  assert.deepEqual(
    selectVisibleEvidence(caseData, state).map(({ id }) => id),
    ["guest-log", "muddy-print"],
  );
  assert.deepEqual(
    selectVisibleStatements(caseData, state).map(({ id }) => id),
    ["avery-alibi"],
  );
  assert.deepEqual(selectPhaseProgress(caseData, state), {
    evidenceViewed: 0,
    evidenceTotal: 2,
    statementsViewed: 0,
    statementsTotal: 1,
    viewed: 0,
    total: 3,
    complete: false,
  });

  state = dispatch(state, ACTIONS.START_CASE, caseData);
  state = dispatch(state, ACTIONS.VIEW_EVIDENCE, caseData, {
    evidenceId: "guest-log",
  });
  state = dispatch(state, ACTIONS.VIEW_STATEMENT, caseData, {
    statementId: "avery-alibi",
  });

  assert.deepEqual(selectPhaseProgress(caseData, state), {
    evidenceViewed: 1,
    evidenceTotal: 2,
    statementsViewed: 1,
    statementsTotal: 1,
    viewed: 2,
    total: 3,
    complete: false,
  });
  assert.equal(selectCanAdvance(caseData, state), false);
});

test("investigation advances only after every visible item is viewed", () => {
  const caseData = createCaseData();
  let state = createInitialState(caseData);

  assert.equal(selectCanAdvance(caseData, state), false);
  const beforeStart = state;
  state = dispatch(state, ACTIONS.START_CASE, caseData);
  assert.notEqual(state, beforeStart);
  assert.equal(state.screen, "investigate");

  const tooEarly = dispatch(state, ACTIONS.ADVANCE_PHASE, caseData);
  assert.equal(tooEarly, state);

  state = dispatch(state, ACTIONS.VIEW_EVIDENCE, caseData, {
    evidenceId: "guest-log",
  });
  assert.equal(state.selectedEvidenceId, "guest-log");
  state = dispatch(state, ACTIONS.VIEW_EVIDENCE, caseData, {
    evidenceId: "muddy-print",
  });
  state = dispatch(state, ACTIONS.VIEW_STATEMENT, caseData, {
    statementId: "avery-alibi",
  });

  assert.equal(selectCanAdvance(caseData, state), true);
  const previous = state;
  state = dispatch(state, ACTIONS.ADVANCE_PHASE, caseData);
  assert.equal(state.phaseIndex, 1);
  assert.equal(state.selectedEvidenceId, null);
  assert.deepEqual(state.viewedEvidenceIds, ["guest-log", "muddy-print"]);
  assert.equal(state.viewedEvidenceIds, previous.viewedEvidenceIds);
  assert.equal(selectPhase(caseData, state), caseData.phases[1]);
  assert.equal(selectCanAccuse(caseData, state), false);
});

test("reducers do not mutate frozen state, actions, or case data", () => {
  const caseData = deepFreeze(createCaseData());
  const initial = createInitialState(caseData);
  const state = deepFreeze({
    ...initial,
    screen: "investigate",
  });
  const action = deepFreeze({
    type: ACTIONS.VIEW_EVIDENCE,
    evidenceId: "guest-log",
  });
  const stateSnapshot = clone(state);
  const caseSnapshot = clone(caseData);
  const actionSnapshot = clone(action);

  const next = reduceGame(state, action, caseData);

  assert.notEqual(next, state);
  assert.notEqual(next.viewedEvidenceIds, state.viewedEvidenceIds);
  assert.deepEqual(next.viewedEvidenceIds, ["guest-log"]);
  assert.deepEqual(state, stateSnapshot);
  assert.deepEqual(caseData, caseSnapshot);
  assert.deepEqual(action, actionSnapshot);
});

test("invalid actions and true no-ops preserve state identity", () => {
  const caseData = createCaseData();
  let state = createInitialState(caseData);

  assert.equal(reduceGame(state, { type: "UNKNOWN" }, caseData), state);
  assert.equal(
    dispatch(state, ACTIONS.VIEW_EVIDENCE, caseData, {
      evidenceId: "guest-log",
    }),
    state,
  );

  state = dispatch(state, ACTIONS.START_CASE, caseData);
  assert.equal(dispatch(state, ACTIONS.START_CASE, caseData), state);
  assert.equal(
    dispatch(state, ACTIONS.SET_TAB, caseData, { tab: "evidence" }),
    state,
  );
  assert.equal(
    dispatch(state, ACTIONS.SET_TAB, caseData, { tab: "not-a-tab" }),
    state,
  );
  assert.equal(
    dispatch(state, ACTIONS.VIEW_EVIDENCE, caseData, {
      evidenceId: "camera-gap",
    }),
    state,
  );
  assert.equal(
    dispatch(state, ACTIONS.VIEW_STATEMENT, caseData, {
      statementId: "blake-follow-up",
    }),
    state,
  );

  state = dispatch(state, ACTIONS.SET_TAB, caseData, { tab: "interviews" });
  assert.equal(state.activeTab, "interviews");
  const firstView = dispatch(state, ACTIONS.VIEW_STATEMENT, caseData, {
    statementId: "avery-alibi",
  });
  assert.equal(
    dispatch(firstView, ACTIONS.VIEW_STATEMENT, caseData, {
      statementId: "avery-alibi",
    }),
    firstView,
  );
});

test("the accusation screen opens only after the final phase is complete", () => {
  const caseData = createCaseData();
  let state = createInitialState(caseData);
  state = dispatch(state, ACTIONS.START_CASE, caseData);

  assert.equal(dispatch(state, ACTIONS.OPEN_ACCUSATION, caseData), state);

  state = dispatch(state, ACTIONS.VIEW_EVIDENCE, caseData, {
    evidenceId: "guest-log",
  });
  state = dispatch(state, ACTIONS.VIEW_EVIDENCE, caseData, {
    evidenceId: "muddy-print",
  });
  state = dispatch(state, ACTIONS.VIEW_STATEMENT, caseData, {
    statementId: "avery-alibi",
  });
  state = dispatch(state, ACTIONS.ADVANCE_PHASE, caseData);

  assert.equal(dispatch(state, ACTIONS.OPEN_ACCUSATION, caseData), state);

  for (const evidenceId of ["camera-gap", "paint-chip", "fiber", "receipt"]) {
    state = dispatch(state, ACTIONS.VIEW_EVIDENCE, caseData, { evidenceId });
  }
  state = dispatch(state, ACTIONS.VIEW_STATEMENT, caseData, {
    statementId: "blake-follow-up",
  });

  assert.equal(selectCanAdvance(caseData, state), false);
  assert.equal(selectCanAccuse(caseData, state), true);
  state = dispatch(state, ACTIONS.OPEN_ACCUSATION, caseData);
  assert.equal(state.screen, "accuse");
  assert.equal(selectCanAccuse(caseData, state), false);
});

test("an accusation draft can return to the investigation without losing selections", () => {
  const caseData = createCaseData();
  let state = reachAccusation(caseData);
  state = dispatch(state, ACTIONS.SET_CULPRIT, caseData, {
    culpritId: "blake",
  });
  state = dispatch(state, ACTIONS.TOGGLE_ACCUSATION_EVIDENCE, caseData, {
    evidenceId: "guest-log",
  });

  state = dispatch(state, ACTIONS.RETURN_TO_CASE, caseData);

  assert.equal(state.screen, "investigate");
  assert.equal(state.outcome, null);
  assert.equal(state.submission, null);
  assert.deepEqual(state.accusation, {
    culpritId: "blake",
    evidenceIds: ["guest-log"],
  });
  assert.equal(dispatch(state, ACTIONS.RETURN_TO_CASE, caseData), state);
});

test("accusation selection toggles valid evidence and enforces four items", () => {
  const caseData = createCaseData();
  let state = reachAccusation(caseData);

  assert.equal(
    dispatch(state, ACTIONS.SET_CULPRIT, caseData, {
      culpritId: "unknown",
    }),
    state,
  );
  state = dispatch(state, ACTIONS.SET_CULPRIT, caseData, {
    culpritId: "blake",
  });
  assert.equal(state.accusation.culpritId, "blake");

  for (const evidenceId of [
    "guest-log",
    "camera-gap",
    "paint-chip",
    "receipt",
  ]) {
    state = dispatch(state, ACTIONS.TOGGLE_ACCUSATION_EVIDENCE, caseData, {
      evidenceId,
    });
  }
  assert.deepEqual(state.accusation.evidenceIds, [
    "guest-log",
    "camera-gap",
    "paint-chip",
    "receipt",
  ]);

  const atLimit = state;
  assert.equal(
    dispatch(state, ACTIONS.TOGGLE_ACCUSATION_EVIDENCE, caseData, {
      evidenceId: "fiber",
    }),
    atLimit,
  );

  state = dispatch(state, ACTIONS.TOGGLE_ACCUSATION_EVIDENCE, caseData, {
    evidenceId: "paint-chip",
  });
  assert.deepEqual(state.accusation.evidenceIds, [
    "guest-log",
    "camera-gap",
    "receipt",
  ]);
  assert.equal(dispatch(state, ACTIONS.SUBMIT_ACCUSATION, caseData), state);
});

test("evaluateAccusation requires the culprit and one item from every proof group", () => {
  const caseData = createCaseData();

  assert.equal(
    evaluateAccusation(caseData, {
      culpritId: "blake",
      evidenceIds: ["muddy-print", "camera-gap", "fiber", "receipt"],
    }),
    true,
  );
  assert.equal(
    evaluateAccusation(caseData, {
      culpritId: "avery",
      evidenceIds: ["muddy-print", "camera-gap", "fiber", "receipt"],
    }),
    false,
  );
  assert.equal(
    evaluateAccusation(caseData, {
      culpritId: "blake",
      evidenceIds: ["guest-log", "paint-chip", "fiber", "receipt"],
    }),
    false,
  );
  assert.equal(
    evaluateAccusation(caseData, {
      culpritId: "blake",
      evidenceIds: ["guest-log", "camera-gap", "receipt"],
    }),
    false,
  );
});

test("an incorrect submission can return to the case and be revised", () => {
  const caseData = createCaseData();
  let state = reachAccusation(caseData);
  state = dispatch(state, ACTIONS.SET_CULPRIT, caseData, {
    culpritId: "blake",
  });

  for (const evidenceId of [
    "guest-log",
    "muddy-print",
    "paint-chip",
    "receipt",
  ]) {
    state = dispatch(state, ACTIONS.TOGGLE_ACCUSATION_EVIDENCE, caseData, {
      evidenceId,
    });
  }
  state = dispatch(state, ACTIONS.SUBMIT_ACCUSATION, caseData);

  assert.equal(state.screen, "resolution");
  assert.equal(state.outcome, "incorrect");
  assert.deepEqual(state.submission, {
    culpritId: "blake",
    evidenceIds: ["guest-log", "muddy-print", "paint-chip", "receipt"],
  });
  assert.notEqual(state.submission.evidenceIds, state.accusation.evidenceIds);

  state = dispatch(state, ACTIONS.RETURN_TO_CASE, caseData);
  assert.equal(state.screen, "investigate");
  assert.equal(state.outcome, null);
  assert.equal(state.submission, null);
  assert.deepEqual(state.accusation.evidenceIds, [
    "guest-log",
    "muddy-print",
    "paint-chip",
    "receipt",
  ]);

  state = dispatch(state, ACTIONS.OPEN_ACCUSATION, caseData);
  state = dispatch(state, ACTIONS.TOGGLE_ACCUSATION_EVIDENCE, caseData, {
    evidenceId: "muddy-print",
  });
  state = dispatch(state, ACTIONS.TOGGLE_ACCUSATION_EVIDENCE, caseData, {
    evidenceId: "camera-gap",
  });
  state = dispatch(state, ACTIONS.SUBMIT_ACCUSATION, caseData);

  assert.equal(state.screen, "resolution");
  assert.equal(state.outcome, "correct");
  assert.equal(dispatch(state, ACTIONS.RETURN_TO_CASE, caseData), state);
});

test("hints are bounded by case content and reset creates a fresh intake state", () => {
  const caseData = createCaseData();
  let state = createInitialState(caseData);
  assert.equal(dispatch(state, ACTIONS.USE_HINT, caseData), state);

  state = dispatch(state, ACTIONS.START_CASE, caseData);
  state = dispatch(state, ACTIONS.USE_HINT, caseData);
  state = dispatch(state, ACTIONS.USE_HINT, caseData);
  assert.equal(state.hintsUsed, 2);
  assert.equal(dispatch(state, ACTIONS.USE_HINT, caseData), state);

  const reset = dispatch(state, ACTIONS.RESET_CASE, caseData);
  assert.notEqual(reset, state);
  assert.deepEqual(reset, createInitialState(caseData));
  assert.notEqual(reset.accusation, state.accusation);
});

test("validateCase reports malformed top-level content", () => {
  assert.deepEqual(validateCase(null), ["Case data must be an object."]);

  const errors = validateCase({});
  assert.ok(errors.includes("Case id must be a non-empty string."));
  assert.ok(errors.includes("Case version is required."));
  assert.ok(errors.includes("Case phases must be an array."));
  assert.ok(errors.includes("Case suspects must be an array."));
  assert.ok(errors.includes("Case evidence must be an array."));
  assert.ok(errors.includes("Case statements must be an array."));
  assert.ok(errors.includes("Case hints must be an array."));
  assert.ok(errors.includes("Case solution must be an object."));

  const invalidVersion = createCaseData();
  invalidVersion.version = false;
  assert.ok(
    validateCase(invalidVersion).includes(
      "Case version must be a non-empty string or finite number.",
    ),
  );
});

test("validateCase reports duplicate IDs and broken references", () => {
  const caseData = createCaseData();
  caseData.phases.push({ id: "arrival" });
  caseData.suspects.push({ id: "avery" });
  caseData.evidence.push({
    id: "guest-log",
    phase: "missing-phase",
  });
  caseData.statements.push({
    id: "avery-alibi",
    phase: "missing-phase",
    suspectId: "nobody",
  });
  caseData.solution = {
    culpritId: "nobody",
    requiredEvidenceGroups: [
      ["missing-evidence", "missing-evidence"],
      [],
      ["guest-log", 42],
    ],
  };

  const errors = validateCase(caseData);

  assert.ok(errors.includes('Duplicate phase id "arrival".'));
  assert.ok(errors.includes('Duplicate suspect id "avery".'));
  assert.ok(errors.includes('Duplicate evidence id "guest-log".'));
  assert.ok(
    errors.includes(
      'Evidence "guest-log" references unknown phase "missing-phase".',
    ),
  );
  assert.ok(errors.includes('Duplicate statement id "avery-alibi".'));
  assert.ok(
    errors.includes(
      'Statement "avery-alibi" references unknown phase "missing-phase".',
    ),
  );
  assert.ok(
    errors.includes(
      'Statement "avery-alibi" references unknown suspect "nobody".',
    ),
  );
  assert.ok(errors.includes('Solution references unknown culprit "nobody".'));
  assert.ok(
    errors.includes(
      'Required evidence group 0 references unknown evidence "missing-evidence".',
    ),
  );
  assert.ok(
    errors.includes(
      'Required evidence group 0 contains duplicate evidence id "missing-evidence".',
    ),
  );
  assert.ok(
    errors.includes(
      "Required evidence group at index 1 must be a non-empty array.",
    ),
  );
  assert.ok(
    errors.includes("Required evidence group 2 item 1 must be an evidence id."),
  );
});
