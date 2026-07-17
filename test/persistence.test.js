import assert from "node:assert/strict";
import test from "node:test";

import {
  ACTIONS,
  createInitialState,
  reduceGame,
} from "../public/app/game-engine.js";
import { createSaveStore } from "../public/app/persistence.js";

function createCaseData() {
  return {
    id: "save-test-case",
    version: 4,
    phases: [{ id: "one" }, { id: "two" }],
    suspects: [{ id: "alix" }, { id: "beck" }],
    evidence: [
      { id: "evidence-one", phase: "one" },
      { id: "evidence-two", phase: "two" },
      { id: "evidence-three", phase: "two" },
      { id: "evidence-four", phase: "two" },
      { id: "evidence-five", phase: "two" },
    ],
    statements: [
      { id: "statement-one", phase: "one", suspectId: "alix" },
      { id: "statement-two", phase: "two", suspectId: "beck" },
    ],
    hints: [{ id: "hint-one" }],
    solution: {
      culpritId: "beck",
      requiredEvidenceGroups: [
        ["evidence-one"],
        ["evidence-two"],
        ["evidence-three"],
        ["evidence-four"],
      ],
    },
  };
}

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

function getStoredEntry(storage) {
  assert.equal(storage.values.size, 1);
  const [key, serialized] = storage.values.entries().next().value;
  return { key, envelope: JSON.parse(serialized) };
}

function replaceEnvelope(storage, key, envelope) {
  storage.setItem(key, JSON.stringify(envelope));
}

function createInvestigatingState(caseData) {
  let state = createInitialState(caseData);
  state = reduceGame(state, { type: ACTIONS.START_CASE }, caseData);
  return reduceGame(
    state,
    { type: ACTIONS.VIEW_EVIDENCE, evidenceId: "evidence-one" },
    caseData,
  );
}

test("save state round trips in a versioned envelope with extra fields removed", () => {
  const caseData = createCaseData();
  const storage = new MemoryStorage();
  const store = createSaveStore(storage, caseData);
  const state = {
    ...createInvestigatingState(caseData),
    ignored: "not persisted",
    accusation: {
      culpritId: null,
      evidenceIds: [],
      ignored: true,
    },
  };

  assert.equal(store.available, true);
  assert.equal(store.save(state), true);

  const { key, envelope } = getStoredEntry(storage);
  assert.match(key, /:v1:save-test-case$/);
  assert.equal(envelope.saveVersion, 1);
  assert.equal(envelope.caseId, caseData.id);
  assert.equal(envelope.caseVersion, caseData.version);
  assert.equal(Object.hasOwn(envelope.state, "ignored"), false);
  assert.equal(Object.hasOwn(envelope.state.accusation, "ignored"), false);
  assert.deepEqual(store.load(), createInvestigatingState(caseData));
  assert.notEqual(store.load(), state);
});

test("load returns null for corrupt JSON", () => {
  const caseData = createCaseData();
  const storage = new MemoryStorage();
  const store = createSaveStore(storage, caseData);
  assert.equal(store.save(createInitialState(caseData)), true);
  const { key } = getStoredEntry(storage);

  storage.setItem(key, "{not-json");

  assert.equal(store.load(), null);
  assert.equal(store.available, true);
});

test("load rejects save, case, case-version, and state-schema mismatches", async (t) => {
  const caseData = createCaseData();
  const mismatches = [
    ["save version", (envelope) => (envelope.saveVersion = 2)],
    ["case id", (envelope) => (envelope.caseId = "another-case")],
    ["case version", (envelope) => (envelope.caseVersion = 5)],
    [
      "state schema",
      (envelope) => {
        envelope.state.schemaVersion = 2;
      },
    ],
    [
      "state case id",
      (envelope) => {
        envelope.state.caseId = "another-case";
      },
    ],
  ];

  for (const [name, mutate] of mismatches) {
    await t.test(name, () => {
      const storage = new MemoryStorage();
      const store = createSaveStore(storage, caseData);
      assert.equal(store.save(createInitialState(caseData)), true);
      const { key, envelope } = getStoredEntry(storage);
      mutate(envelope);
      replaceEnvelope(storage, key, envelope);
      assert.equal(store.load(), null);
    });
  }
});

test("unknown evidence, statement, and suspect IDs are rejected", async (t) => {
  const caseData = createCaseData();
  const invalidStates = [
    [
      "viewed evidence",
      (state) => state.viewedEvidenceIds.push("unknown-evidence"),
    ],
    [
      "viewed statement",
      (state) => state.viewedStatementIds.push("unknown-statement"),
    ],
    [
      "selected evidence",
      (state) => {
        state.selectedEvidenceId = "unknown-evidence";
      },
    ],
    [
      "accused suspect",
      (state) => {
        state.accusation.culpritId = "unknown-suspect";
      },
    ],
    [
      "accusation evidence",
      (state) => state.accusation.evidenceIds.push("unknown-evidence"),
    ],
  ];

  for (const [name, mutate] of invalidStates) {
    await t.test(name, () => {
      const storage = new MemoryStorage();
      const store = createSaveStore(storage, caseData);
      assert.equal(store.save(createInitialState(caseData)), true);
      const { key, envelope } = getStoredEntry(storage);
      mutate(envelope.state);
      replaceEnvelope(storage, key, envelope);
      assert.equal(store.load(), null);
    });
  }
});

test("invalid screens, tabs, indexes, duplicates, oversized proofs, and outcomes are rejected", async (t) => {
  const caseData = createCaseData();
  const invalidStates = [
    ["screen", (state) => (state.screen = "credits")],
    ["tab", (state) => (state.activeTab = "suspects")],
    ["phase index", (state) => (state.phaseIndex = 99)],
    [
      "duplicate viewed evidence",
      (state) => state.viewedEvidenceIds.push("evidence-one"),
    ],
    [
      "duplicate accusation evidence",
      (state) => {
        state.accusation.evidenceIds = ["evidence-one", "evidence-one"];
      },
    ],
    [
      "more than four accusation items",
      (state) => {
        state.accusation.evidenceIds = caseData.evidence.map(({ id }) => id);
      },
    ],
    [
      "premature accusation draft",
      (state) => {
        state.accusation.culpritId = "beck";
      },
    ],
    [
      "outcome outside resolution",
      (state) => {
        state.outcome = "incorrect";
      },
    ],
  ];

  for (const [name, mutate] of invalidStates) {
    await t.test(name, () => {
      const storage = new MemoryStorage();
      const store = createSaveStore(storage, caseData);
      const state = createInvestigatingState(caseData);
      assert.equal(store.save(state), true);
      const { key, envelope } = getStoredEntry(storage);
      mutate(envelope.state);
      replaceEnvelope(storage, key, envelope);
      assert.equal(store.load(), null);
    });
  }
});

test("resolution outcome must agree with its submitted accusation", () => {
  const caseData = createCaseData();
  const storage = new MemoryStorage();
  const store = createSaveStore(storage, caseData);
  assert.equal(store.save(createInitialState(caseData)), true);
  const { key, envelope } = getStoredEntry(storage);
  const evidenceIds = [
    "evidence-one",
    "evidence-two",
    "evidence-three",
    "evidence-four",
  ];

  envelope.state = {
    ...envelope.state,
    screen: "resolution",
    phaseIndex: 1,
    viewedEvidenceIds: caseData.evidence.map(({ id }) => id),
    viewedStatementIds: caseData.statements.map(({ id }) => id),
    accusation: { culpritId: "beck", evidenceIds },
    outcome: "incorrect",
    submission: { culpritId: "beck", evidenceIds: [...evidenceIds] },
  };
  replaceEnvelope(storage, key, envelope);

  assert.equal(store.load(), null);
});

test("throwing storage is unavailable and never interrupts the caller", () => {
  const storage = {
    getItem() {
      throw new DOMException("Blocked", "SecurityError");
    },
    setItem() {
      throw new DOMException("Full", "QuotaExceededError");
    },
    removeItem() {
      throw new DOMException("Blocked", "SecurityError");
    },
  };

  const store = createSaveStore(storage, createCaseData());

  assert.equal(store.available, false);
  assert.equal(store.load(), null);
  assert.equal(store.save({}), false);
  assert.equal(store.clear(), false);
});

test("clear removes the saved envelope", () => {
  const caseData = createCaseData();
  const storage = new MemoryStorage();
  const store = createSaveStore(storage, caseData);

  assert.equal(store.save(createInitialState(caseData)), true);
  assert.notEqual(store.load(), null);
  assert.equal(store.clear(), true);
  assert.equal(storage.values.size, 0);
  assert.equal(store.load(), null);
});
