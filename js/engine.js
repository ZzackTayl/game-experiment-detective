export const MAX_ACTIONS = 12;

export function createSession(caseId) {
  return {
    caseId,
    phase: "investigating",
    actionsLeft: MAX_ACTIONS,
    completedActions: [],
    evidence: [],
    hintUsed: false,
    result: null,
  };
}

export function performInvestigation(session, caseData, kind, targetId) {
  if (session.phase !== "investigating" || session.actionsLeft <= 0)
    return session;
  const actionId = `${kind}:${targetId}`;
  if (session.completedActions.includes(actionId)) return session;

  const evidence =
    kind === "location"
      ? caseData.locationEvidence[targetId]
      : kind === "interview"
        ? caseData.interviews[targetId]
        : null;
  if (!evidence) return session;

  const actionsLeft = session.actionsLeft - 1;
  return {
    ...session,
    actionsLeft,
    completedActions: [...session.completedActions, actionId],
    evidence: [...session.evidence, { ...evidence, source: kind }],
    phase: actionsLeft === 0 ? "accusing" : session.phase,
  };
}

export function requestHint(session, caseData) {
  if (
    session.phase !== "investigating" ||
    session.hintUsed ||
    session.actionsLeft < 2
  ) {
    return { session, hint: null };
  }

  const found = new Set(session.evidence.map((item) => item.id));
  const evidenceId = caseData.keyEvidenceIds.find((id) => !found.has(id));
  if (!evidenceId)
    return { session, hint: "You already have every decisive clue." };

  const location = Object.entries(caseData.locationEvidence).find(
    ([, item]) => item.id === evidenceId,
  );
  const interview = Object.entries(caseData.interviews).find(
    ([, item]) => item.id === evidenceId,
  );
  const target = location
    ? `search the ${location[0]}`
    : `interview ${interview?.[0]}`;
  const actionsLeft = session.actionsLeft - 2;
  return {
    session: {
      ...session,
      actionsLeft,
      hintUsed: true,
      phase: actionsLeft === 0 ? "accusing" : session.phase,
    },
    hint: `The next productive lead is to ${target}.`,
  };
}

export function enterAccusation(session) {
  if (session.phase !== "investigating") return session;
  return { ...session, phase: "accusing" };
}

export function evaluateAccusation(session, caseData, accusation) {
  if (session.phase !== "accusing") {
    return { ok: false, error: "The accusation is not available yet." };
  }
  if (
    !accusation.suspectId ||
    !accusation.motiveId ||
    accusation.evidenceIds.length !== 2
  ) {
    return {
      ok: false,
      error: "Choose a suspect, a motive, and exactly two pieces of evidence.",
    };
  }
  if (new Set(accusation.evidenceIds).size !== 2) {
    return { ok: false, error: "Choose two different pieces of evidence." };
  }
  const found = new Set(session.evidence.map((item) => item.id));
  if (accusation.evidenceIds.some((id) => !found.has(id))) {
    return {
      ok: false,
      error: "Your proof must come from evidence in your casebook.",
    };
  }

  const correctSuspect = accusation.suspectId === caseData.culpritId;
  const correctMotive = accusation.motiveId === caseData.motiveId;
  const decisiveEvidence = accusation.evidenceIds.filter((id) =>
    caseData.keyEvidenceIds.includes(id),
  ).length;
  const won = correctSuspect && correctMotive && decisiveEvidence === 2;
  const actionsUsed = MAX_ACTIONS - session.actionsLeft;
  const allKeyEvidence = caseData.keyEvidenceIds.every((id) => found.has(id));
  const score = Math.max(
    0,
    1000 -
      actionsUsed * 50 -
      (session.hintUsed ? 150 : 0) +
      (allKeyEvidence ? 100 : 0),
  );
  const rank =
    score >= 900
      ? "Master Detective"
      : score >= 700
        ? "Sharp Investigator"
        : score >= 500
          ? "Case Closed"
          : "Messy but Proven";
  const result = {
    won,
    score,
    rank,
    correctSuspect,
    correctMotive,
    decisiveEvidence,
    actionsUsed,
    allKeyEvidence,
  };

  return {
    ok: true,
    session: { ...session, phase: "resolved", result },
    result,
  };
}
