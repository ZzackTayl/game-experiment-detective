import { evaluateAccusation } from "./game-engine.js";

const SAVE_VERSION = 1;
const STATE_SCHEMA_VERSION = 1;
const SAVE_KEY_PREFIX = "morrowtide:case-save";
const SCREENS = new Set(["intake", "investigate", "accuse", "resolution"]);
const TABS = new Set(["evidence", "interviews", "timeline"]);
const OUTCOMES = new Set(["correct", "incorrect"]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sanitizeIdList(value, knownIds, maximum = Number.POSITIVE_INFINITY) {
  if (!Array.isArray(value) || value.length > maximum) {
    return null;
  }

  const ids = [];
  const seen = new Set();
  for (const id of value) {
    if (typeof id !== "string" || !knownIds.has(id) || seen.has(id)) {
      return null;
    }
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

function sanitizeAccusation(value, suspectIds, evidenceIds) {
  if (!isRecord(value)) {
    return null;
  }

  const culpritId = value.culpritId;
  if (culpritId !== null && !suspectIds.has(culpritId)) {
    return null;
  }

  const selectedEvidenceIds = sanitizeIdList(value.evidenceIds, evidenceIds, 4);
  if (selectedEvidenceIds === null) {
    return null;
  }

  return {
    culpritId,
    evidenceIds: selectedEvidenceIds,
  };
}

function sanitizeSubmission(value, suspectIds, evidenceIds) {
  const submission = sanitizeAccusation(value, suspectIds, evidenceIds);
  if (
    submission === null ||
    submission.culpritId === null ||
    submission.evidenceIds.length !== 4
  ) {
    return null;
  }
  return submission;
}

function sameAccusation(left, right) {
  return (
    left.culpritId === right.culpritId &&
    left.evidenceIds.length === right.evidenceIds.length &&
    left.evidenceIds.every((id, index) => id === right.evidenceIds[index])
  );
}

function hasCompletedPriorPhases(caseData, state) {
  const completedPhaseIds = new Set(
    caseData.phases.slice(0, state.phaseIndex).map((phase) => phase.id),
  );

  return (
    caseData.evidence
      .filter((item) => completedPhaseIds.has(item.phase))
      .every((item) => state.viewedEvidenceIds.includes(item.id)) &&
    caseData.statements
      .filter((item) => completedPhaseIds.has(item.phase))
      .every((item) => state.viewedStatementIds.includes(item.id))
  );
}

function hasCompletedCurrentPhase(caseData, state) {
  const phaseId = caseData.phases[state.phaseIndex].id;
  return (
    caseData.evidence
      .filter((item) => item.phase === phaseId)
      .every((item) => state.viewedEvidenceIds.includes(item.id)) &&
    caseData.statements
      .filter((item) => item.phase === phaseId)
      .every((item) => state.viewedStatementIds.includes(item.id))
  );
}

function isProgressConsistent(caseData, state) {
  const unlockedPhaseIds = new Set(
    caseData.phases.slice(0, state.phaseIndex + 1).map((phase) => phase.id),
  );
  const evidenceById = new Map(
    caseData.evidence.map((item) => [item.id, item]),
  );
  const statementsById = new Map(
    caseData.statements.map((item) => [item.id, item]),
  );

  if (
    !state.viewedEvidenceIds.every((id) =>
      unlockedPhaseIds.has(evidenceById.get(id).phase),
    ) ||
    !state.viewedStatementIds.every((id) =>
      unlockedPhaseIds.has(statementsById.get(id).phase),
    ) ||
    !hasCompletedPriorPhases(caseData, state)
  ) {
    return false;
  }

  if (state.selectedEvidenceId !== null) {
    const selectedEvidence = evidenceById.get(state.selectedEvidenceId);
    if (
      state.screen !== "investigate" ||
      !state.viewedEvidenceIds.includes(state.selectedEvidenceId) ||
      selectedEvidence.phase !== caseData.phases[state.phaseIndex].id
    ) {
      return false;
    }
  }

  return (
    (state.screen !== "accuse" && state.screen !== "resolution") ||
    (state.phaseIndex === caseData.phases.length - 1 &&
      hasCompletedCurrentPhase(caseData, state))
  );
}

function sanitizeState(value, caseData) {
  if (
    !isRecord(value) ||
    value.schemaVersion !== STATE_SCHEMA_VERSION ||
    value.caseId !== caseData.id ||
    value.caseVersion !== caseData.version ||
    !SCREENS.has(value.screen) ||
    !TABS.has(value.activeTab) ||
    !Number.isInteger(value.phaseIndex) ||
    value.phaseIndex < 0 ||
    value.phaseIndex >= caseData.phases.length ||
    !Number.isInteger(value.hintsUsed) ||
    value.hintsUsed < 0 ||
    value.hintsUsed > caseData.hints.length
  ) {
    return null;
  }

  const evidenceIds = new Set(caseData.evidence.map((item) => item.id));
  const statementIds = new Set(caseData.statements.map((item) => item.id));
  const suspectIds = new Set(caseData.suspects.map((item) => item.id));
  const viewedEvidenceIds = sanitizeIdList(
    value.viewedEvidenceIds,
    evidenceIds,
  );
  const viewedStatementIds = sanitizeIdList(
    value.viewedStatementIds,
    statementIds,
  );
  const accusation = sanitizeAccusation(
    value.accusation,
    suspectIds,
    evidenceIds,
  );
  const selectedEvidenceId = value.selectedEvidenceId;

  if (
    viewedEvidenceIds === null ||
    viewedStatementIds === null ||
    accusation === null ||
    (selectedEvidenceId !== null && !evidenceIds.has(selectedEvidenceId))
  ) {
    return null;
  }

  let submission = null;
  if (value.submission !== null) {
    submission = sanitizeSubmission(value.submission, suspectIds, evidenceIds);
    if (submission === null) {
      return null;
    }
  }

  const state = {
    schemaVersion: STATE_SCHEMA_VERSION,
    caseId: caseData.id,
    caseVersion: caseData.version,
    screen: value.screen,
    activeTab: value.activeTab,
    phaseIndex: value.phaseIndex,
    viewedEvidenceIds,
    viewedStatementIds,
    selectedEvidenceId,
    accusation,
    hintsUsed: value.hintsUsed,
    outcome: value.outcome,
    submission,
  };
  const hasAccusationDraft =
    state.accusation.culpritId !== null ||
    state.accusation.evidenceIds.length > 0;
  const draftIsReachable =
    state.phaseIndex === caseData.phases.length - 1 &&
    hasCompletedCurrentPhase(caseData, state);

  if (
    !isProgressConsistent(caseData, state) ||
    !state.accusation.evidenceIds.every((id) =>
      state.viewedEvidenceIds.includes(id),
    ) ||
    (hasAccusationDraft && !draftIsReachable) ||
    (state.screen === "intake" &&
      (state.activeTab !== "evidence" ||
        state.phaseIndex !== 0 ||
        state.viewedEvidenceIds.length !== 0 ||
        state.viewedStatementIds.length !== 0 ||
        state.selectedEvidenceId !== null ||
        state.accusation.culpritId !== null ||
        state.accusation.evidenceIds.length !== 0 ||
        state.hintsUsed !== 0)) ||
    (state.screen !== "resolution" &&
      (state.outcome !== null || state.submission !== null)) ||
    (state.screen === "resolution" &&
      (!OUTCOMES.has(state.outcome) ||
        state.submission === null ||
        !sameAccusation(state.accusation, state.submission) ||
        evaluateAccusation(caseData, state.submission) !==
          (state.outcome === "correct")))
  ) {
    return null;
  }

  return state;
}

function createSaveKey(caseData) {
  return `${SAVE_KEY_PREFIX}:v${SAVE_VERSION}:${String(caseData?.id ?? "")}`;
}

export function createSaveStore(storage, caseData) {
  const key = createSaveKey(caseData);
  let storageApiAvailable = false;
  let storageAvailable = false;

  try {
    storageApiAvailable =
      storage !== null &&
      typeof storage === "object" &&
      typeof storage.getItem === "function" &&
      typeof storage.setItem === "function" &&
      typeof storage.removeItem === "function";
    storageAvailable = storageApiAvailable;
    if (storageApiAvailable) {
      storage.getItem(key);
    }
  } catch {
    storageAvailable = false;
  }

  function load() {
    if (!storageAvailable) {
      return null;
    }

    try {
      const serialized = storage.getItem(key);
      if (serialized === null) {
        return null;
      }

      const envelope = JSON.parse(serialized);
      if (
        !isRecord(envelope) ||
        envelope.saveVersion !== SAVE_VERSION ||
        envelope.caseId !== caseData.id ||
        envelope.caseVersion !== caseData.version
      ) {
        return null;
      }

      return sanitizeState(envelope.state, caseData);
    } catch {
      return null;
    }
  }

  function save(state) {
    if (!storageAvailable) {
      return false;
    }

    try {
      const sanitizedState = sanitizeState(state, caseData);
      if (sanitizedState === null) {
        return false;
      }

      storage.setItem(
        key,
        JSON.stringify({
          saveVersion: SAVE_VERSION,
          caseId: caseData.id,
          caseVersion: caseData.version,
          state: sanitizedState,
        }),
      );
      return true;
    } catch {
      storageAvailable = false;
      return false;
    }
  }

  function clear() {
    if (!storageApiAvailable) {
      return false;
    }

    try {
      storage.removeItem(key);
      return true;
    } catch {
      storageAvailable = false;
      return false;
    }
  }

  return {
    load,
    save,
    clear,
    get available() {
      return storageAvailable;
    },
  };
}
