export const ACTIONS = Object.freeze({
  START_CASE: "START_CASE",
  SET_TAB: "SET_TAB",
  VIEW_EVIDENCE: "VIEW_EVIDENCE",
  VIEW_STATEMENT: "VIEW_STATEMENT",
  ADVANCE_PHASE: "ADVANCE_PHASE",
  OPEN_ACCUSATION: "OPEN_ACCUSATION",
  SET_CULPRIT: "SET_CULPRIT",
  TOGGLE_ACCUSATION_EVIDENCE: "TOGGLE_ACCUSATION_EVIDENCE",
  USE_HINT: "USE_HINT",
  SUBMIT_ACCUSATION: "SUBMIT_ACCUSATION",
  RETURN_TO_CASE: "RETURN_TO_CASE",
  RESET_CASE: "RESET_CASE",
});

const SCHEMA_VERSION = 1;
const TABS = new Set(["evidence", "interviews", "timeline"]);

function getActionValue(action, key) {
  if (Object.prototype.hasOwnProperty.call(action, key)) {
    return action[key];
  }

  if (
    action.payload !== null &&
    typeof action.payload === "object" &&
    Object.prototype.hasOwnProperty.call(action.payload, key)
  ) {
    return action.payload[key];
  }

  return action.payload;
}

function includesId(items, id) {
  return Array.isArray(items) && items.some((item) => item.id === id);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function createInitialState(caseData) {
  return {
    schemaVersion: SCHEMA_VERSION,
    caseId: caseData?.id ?? null,
    caseVersion: caseData?.version ?? null,
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
  };
}

export function selectPhase(caseData, state) {
  if (
    !Array.isArray(caseData?.phases) ||
    !Number.isInteger(state?.phaseIndex)
  ) {
    return null;
  }

  return caseData.phases[state.phaseIndex] ?? null;
}

export function selectVisibleEvidence(caseData, state) {
  const phase = selectPhase(caseData, state);
  if (!phase || !Array.isArray(caseData?.evidence)) {
    return [];
  }

  return caseData.evidence.filter((item) => item.phase === phase.id);
}

export function selectVisibleStatements(caseData, state) {
  const phase = selectPhase(caseData, state);
  if (!phase || !Array.isArray(caseData?.statements)) {
    return [];
  }

  return caseData.statements.filter(
    (statement) => statement.phase === phase.id,
  );
}

export function selectPhaseProgress(caseData, state) {
  const evidence = selectVisibleEvidence(caseData, state);
  const statements = selectVisibleStatements(caseData, state);
  const viewedEvidenceIds = Array.isArray(state?.viewedEvidenceIds)
    ? state.viewedEvidenceIds
    : [];
  const viewedStatementIds = Array.isArray(state?.viewedStatementIds)
    ? state.viewedStatementIds
    : [];
  const evidenceViewed = evidence.filter((item) =>
    viewedEvidenceIds.includes(item.id),
  ).length;
  const statementsViewed = statements.filter((statement) =>
    viewedStatementIds.includes(statement.id),
  ).length;
  const total = evidence.length + statements.length;
  const viewed = evidenceViewed + statementsViewed;

  return {
    evidenceViewed,
    evidenceTotal: evidence.length,
    statementsViewed,
    statementsTotal: statements.length,
    viewed,
    total,
    complete: viewed === total,
  };
}

export function selectCanAdvance(caseData, state) {
  if (
    state?.screen !== "investigate" ||
    !Array.isArray(caseData?.phases) ||
    state.phaseIndex < 0 ||
    state.phaseIndex >= caseData.phases.length - 1
  ) {
    return false;
  }

  return selectPhaseProgress(caseData, state).complete;
}

export function selectCanAccuse(caseData, state) {
  if (
    state?.screen !== "investigate" ||
    !Array.isArray(caseData?.phases) ||
    caseData.phases.length === 0 ||
    state.phaseIndex !== caseData.phases.length - 1
  ) {
    return false;
  }

  return selectPhaseProgress(caseData, state).complete;
}

export function evaluateAccusation(caseData, accusation) {
  const solution = caseData?.solution;
  if (
    !isRecord(solution) ||
    !isRecord(accusation) ||
    accusation.culpritId !== solution.culpritId ||
    !Array.isArray(accusation.evidenceIds) ||
    !Array.isArray(solution.requiredEvidenceGroups)
  ) {
    return false;
  }

  const selectedEvidenceIds = new Set(accusation.evidenceIds);
  return solution.requiredEvidenceGroups.every(
    (group) =>
      Array.isArray(group) &&
      group.some((evidenceId) => selectedEvidenceIds.has(evidenceId)),
  );
}

export function reduceGame(state, action, caseData) {
  if (!isRecord(state) || !isRecord(action)) {
    return state;
  }

  switch (action.type) {
    case ACTIONS.START_CASE:
      if (state.screen !== "intake") {
        return state;
      }
      return { ...state, screen: "investigate" };

    case ACTIONS.SET_TAB: {
      const tab = getActionValue(action, "tab");
      if (
        state.screen !== "investigate" ||
        !TABS.has(tab) ||
        tab === state.activeTab
      ) {
        return state;
      }
      return { ...state, activeTab: tab };
    }

    case ACTIONS.VIEW_EVIDENCE: {
      const evidenceId = getActionValue(action, "evidenceId");
      const visibleEvidence = selectVisibleEvidence(caseData, state);
      if (
        state.screen !== "investigate" ||
        !includesId(visibleEvidence, evidenceId)
      ) {
        return state;
      }

      const alreadyViewed = state.viewedEvidenceIds.includes(evidenceId);
      if (alreadyViewed && state.selectedEvidenceId === evidenceId) {
        return state;
      }

      return {
        ...state,
        viewedEvidenceIds: alreadyViewed
          ? state.viewedEvidenceIds
          : [...state.viewedEvidenceIds, evidenceId],
        selectedEvidenceId: evidenceId,
      };
    }

    case ACTIONS.VIEW_STATEMENT: {
      const statementId = getActionValue(action, "statementId");
      const visibleStatements = selectVisibleStatements(caseData, state);
      if (
        state.screen !== "investigate" ||
        !includesId(visibleStatements, statementId) ||
        state.viewedStatementIds.includes(statementId)
      ) {
        return state;
      }

      return {
        ...state,
        viewedStatementIds: [...state.viewedStatementIds, statementId],
      };
    }

    case ACTIONS.ADVANCE_PHASE:
      if (!selectCanAdvance(caseData, state)) {
        return state;
      }
      return {
        ...state,
        phaseIndex: state.phaseIndex + 1,
        selectedEvidenceId: null,
      };

    case ACTIONS.OPEN_ACCUSATION:
      if (!selectCanAccuse(caseData, state)) {
        return state;
      }
      return {
        ...state,
        screen: "accuse",
        selectedEvidenceId: null,
        outcome: null,
        submission: null,
      };

    case ACTIONS.SET_CULPRIT: {
      const culpritId = getActionValue(action, "culpritId");
      if (
        state.screen !== "accuse" ||
        !includesId(caseData?.suspects, culpritId) ||
        state.accusation.culpritId === culpritId
      ) {
        return state;
      }

      return {
        ...state,
        accusation: {
          ...state.accusation,
          culpritId,
        },
      };
    }

    case ACTIONS.TOGGLE_ACCUSATION_EVIDENCE: {
      const evidenceId = getActionValue(action, "evidenceId");
      if (
        state.screen !== "accuse" ||
        !includesId(caseData?.evidence, evidenceId)
      ) {
        return state;
      }

      const selectedEvidenceIds = state.accusation.evidenceIds;
      const isSelected = selectedEvidenceIds.includes(evidenceId);
      if (!isSelected && selectedEvidenceIds.length >= 4) {
        return state;
      }

      return {
        ...state,
        accusation: {
          ...state.accusation,
          evidenceIds: isSelected
            ? selectedEvidenceIds.filter((id) => id !== evidenceId)
            : [...selectedEvidenceIds, evidenceId],
        },
      };
    }

    case ACTIONS.USE_HINT:
      if (
        state.screen !== "investigate" ||
        !Array.isArray(caseData?.hints) ||
        state.hintsUsed >= caseData.hints.length
      ) {
        return state;
      }
      return { ...state, hintsUsed: state.hintsUsed + 1 };

    case ACTIONS.SUBMIT_ACCUSATION: {
      if (
        state.screen !== "accuse" ||
        !includesId(caseData?.suspects, state.accusation.culpritId) ||
        state.accusation.evidenceIds.length !== 4 ||
        new Set(state.accusation.evidenceIds).size !== 4 ||
        !state.accusation.evidenceIds.every((id) =>
          includesId(caseData?.evidence, id),
        )
      ) {
        return state;
      }

      const submission = {
        culpritId: state.accusation.culpritId,
        evidenceIds: [...state.accusation.evidenceIds],
      };
      const isCorrect = evaluateAccusation(caseData, submission);

      return {
        ...state,
        screen: "resolution",
        outcome: isCorrect ? "correct" : "incorrect",
        submission,
      };
    }

    case ACTIONS.RETURN_TO_CASE:
      if (
        state.screen !== "accuse" &&
        !(state.screen === "resolution" && state.outcome === "incorrect")
      ) {
        return state;
      }
      return {
        ...state,
        screen: "investigate",
        outcome: null,
        submission: null,
      };

    case ACTIONS.RESET_CASE:
      return createInitialState(caseData);

    default:
      return state;
  }
}

export function validateCase(caseData) {
  const errors = [];
  if (!isRecord(caseData)) {
    return ["Case data must be an object."];
  }

  if (!hasNonEmptyString(caseData.id)) {
    errors.push("Case id must be a non-empty string.");
  }
  if (
    caseData.version === undefined ||
    caseData.version === null ||
    caseData.version === ""
  ) {
    errors.push("Case version is required.");
  } else if (
    !hasNonEmptyString(caseData.version) &&
    !(typeof caseData.version === "number" && Number.isFinite(caseData.version))
  ) {
    errors.push("Case version must be a non-empty string or finite number.");
  }

  const arrayFields = ["phases", "suspects", "evidence", "statements", "hints"];
  for (const field of arrayFields) {
    if (!Array.isArray(caseData[field])) {
      errors.push(`Case ${field} must be an array.`);
    }
  }

  const phases = Array.isArray(caseData.phases) ? caseData.phases : [];
  const suspects = Array.isArray(caseData.suspects) ? caseData.suspects : [];
  const evidence = Array.isArray(caseData.evidence) ? caseData.evidence : [];
  const statements = Array.isArray(caseData.statements)
    ? caseData.statements
    : [];

  if (Array.isArray(caseData.phases) && phases.length === 0) {
    errors.push("Case must contain at least one phase.");
  }
  if (Array.isArray(caseData.suspects) && suspects.length === 0) {
    errors.push("Case must contain at least one suspect.");
  }

  const phaseIds = new Set();
  phases.forEach((phase, index) => {
    if (!isRecord(phase)) {
      errors.push(`Phase at index ${index} must be an object.`);
      return;
    }
    if (!hasNonEmptyString(phase.id)) {
      errors.push(`Phase at index ${index} must have a non-empty id.`);
      return;
    }
    if (phaseIds.has(phase.id)) {
      errors.push(`Duplicate phase id "${phase.id}".`);
    }
    phaseIds.add(phase.id);
  });

  const suspectIds = new Set();
  suspects.forEach((suspect, index) => {
    if (!isRecord(suspect)) {
      errors.push(`Suspect at index ${index} must be an object.`);
      return;
    }
    if (!hasNonEmptyString(suspect.id)) {
      errors.push(`Suspect at index ${index} must have a non-empty id.`);
      return;
    }
    if (suspectIds.has(suspect.id)) {
      errors.push(`Duplicate suspect id "${suspect.id}".`);
    }
    suspectIds.add(suspect.id);
  });

  const evidenceIds = new Set();
  evidence.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push(`Evidence at index ${index} must be an object.`);
      return;
    }
    if (!hasNonEmptyString(item.id)) {
      errors.push(`Evidence at index ${index} must have a non-empty id.`);
    } else {
      if (evidenceIds.has(item.id)) {
        errors.push(`Duplicate evidence id "${item.id}".`);
      }
      evidenceIds.add(item.id);
    }
    if (!hasNonEmptyString(item.phase)) {
      errors.push(`Evidence "${item.id ?? index}" must reference a phase id.`);
    } else if (!phaseIds.has(item.phase)) {
      errors.push(
        `Evidence "${item.id ?? index}" references unknown phase "${item.phase}".`,
      );
    }
  });

  const statementIds = new Set();
  statements.forEach((statement, index) => {
    if (!isRecord(statement)) {
      errors.push(`Statement at index ${index} must be an object.`);
      return;
    }
    if (!hasNonEmptyString(statement.id)) {
      errors.push(`Statement at index ${index} must have a non-empty id.`);
    } else {
      if (statementIds.has(statement.id)) {
        errors.push(`Duplicate statement id "${statement.id}".`);
      }
      statementIds.add(statement.id);
    }
    if (!hasNonEmptyString(statement.phase)) {
      errors.push(
        `Statement "${statement.id ?? index}" must reference a phase id.`,
      );
    } else if (!phaseIds.has(statement.phase)) {
      errors.push(
        `Statement "${statement.id ?? index}" references unknown phase "${statement.phase}".`,
      );
    }
    if (!hasNonEmptyString(statement.suspectId)) {
      errors.push(
        `Statement "${statement.id ?? index}" must reference a suspect id.`,
      );
    } else if (!suspectIds.has(statement.suspectId)) {
      errors.push(
        `Statement "${statement.id ?? index}" references unknown suspect "${statement.suspectId}".`,
      );
    }
  });

  if (!isRecord(caseData.solution)) {
    errors.push("Case solution must be an object.");
    return errors;
  }

  if (!hasNonEmptyString(caseData.solution.culpritId)) {
    errors.push("Solution culpritId must be a non-empty string.");
  } else if (!suspectIds.has(caseData.solution.culpritId)) {
    errors.push(
      `Solution references unknown culprit "${caseData.solution.culpritId}".`,
    );
  }

  if (!Array.isArray(caseData.solution.requiredEvidenceGroups)) {
    errors.push("Solution requiredEvidenceGroups must be an array.");
    return errors;
  }

  caseData.solution.requiredEvidenceGroups.forEach((group, groupIndex) => {
    if (!Array.isArray(group) || group.length === 0) {
      errors.push(
        `Required evidence group at index ${groupIndex} must be a non-empty array.`,
      );
      return;
    }

    const groupIds = new Set();
    group.forEach((evidenceId, evidenceIndex) => {
      if (!hasNonEmptyString(evidenceId)) {
        errors.push(
          `Required evidence group ${groupIndex} item ${evidenceIndex} must be an evidence id.`,
        );
        return;
      }
      if (groupIds.has(evidenceId)) {
        errors.push(
          `Required evidence group ${groupIndex} contains duplicate evidence id "${evidenceId}".`,
        );
      }
      groupIds.add(evidenceId);
      if (!evidenceIds.has(evidenceId)) {
        errors.push(
          `Required evidence group ${groupIndex} references unknown evidence "${evidenceId}".`,
        );
      }
    });
  });

  return errors;
}
