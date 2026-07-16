export const MAX_ACTIONS = 12;

export function createSession(caseId) {
  return {
    caseId,
    phase: "investigating",
    actionsLeft: MAX_ACTIONS,
    completedActions: [],
    evidence: [],
    resolvedContradictionIds: [],
    hintUsed: false,
    result: null,
  };
}

function collectedEvidenceIds(session) {
  return session.evidence.map((item) => item.id);
}

export function findResolvedContradictionIds(caseData, collectedEvidenceIds) {
  const found = new Set(collectedEvidenceIds);
  const contradiction = caseData.contradiction;
  if (
    !contradiction ||
    !contradiction.prerequisiteIds.every((id) => found.has(id))
  ) {
    return [];
  }
  return [contradiction.id];
}

function hasCompletedConfrontation(session, caseData) {
  const suspectId = caseData.contradiction?.suspectId;
  return Boolean(
    suspectId &&
      session.completedActions.includes(`confrontation:${suspectId}`) &&
      session.evidence.some(
        (item) => item.id === caseData.contradiction.confrontation.id,
      ),
  );
}

function phaseAfterAction(session, caseData, actionsLeft) {
  if (actionsLeft > 0) return session.phase;
  return hasCompletedConfrontation(session, caseData)
    ? "accusing"
    : "exhausted";
}

function addEvidence(
  session,
  caseData,
  authoredEvidence,
  source,
  sourceId,
  actionId,
) {
  const actionsLeft = session.actionsLeft - 1;
  const evidence = [
    ...session.evidence,
    {
      ...authoredEvidence,
      timeline:
        authoredEvidence.timeline || caseData.timeline?.[authoredEvidence.id],
      source,
      sourceId,
    },
  ];
  const completedActions = [...session.completedActions, actionId];
  const next = {
    ...session,
    actionsLeft,
    completedActions,
    evidence,
    resolvedContradictionIds: findResolvedContradictionIds(
      caseData,
      evidence.map((item) => item.id),
    ),
  };
  return {
    ...next,
    phase: phaseAfterAction(next, caseData, actionsLeft),
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

  return addEvidence(session, caseData, evidence, kind, targetId, actionId);
}

export function getConfrontationAvailability(session, caseData) {
  const contradiction = caseData.contradiction;
  if (!contradiction) return { status: "unavailable", missingEvidenceIds: [] };
  const actionId = `confrontation:${contradiction.suspectId}`;
  if (session.completedActions.includes(actionId)) {
    return { status: "completed", missingEvidenceIds: [] };
  }
  if (session.phase !== "investigating") {
    return { status: "wrong-phase", missingEvidenceIds: [] };
  }
  const found = new Set(collectedEvidenceIds(session));
  const missingEvidenceIds = contradiction.prerequisiteIds.filter(
    (id) => !found.has(id),
  );
  if (missingEvidenceIds.length) {
    return { status: "locked", missingEvidenceIds };
  }
  if (session.actionsLeft < 1) {
    return { status: "out-of-actions", missingEvidenceIds: [] };
  }
  return { status: "available", missingEvidenceIds: [] };
}

export function performConfrontation(session, caseData) {
  const availability = getConfrontationAvailability(session, caseData);
  if (availability.status !== "available") return session;
  const contradiction = caseData.contradiction;
  return addEvidence(
    session,
    caseData,
    contradiction.confrontation,
    "confrontation",
    contradiction.suspectId,
    `confrontation:${contradiction.suspectId}`,
  );
}

export function getEvidenceTimeline(session) {
  return [...session.evidence].sort((left, right) => {
    const leftTimeline = left.timeline || {};
    const rightTimeline = right.timeline || {};
    return (
      String(leftTimeline.start || "").localeCompare(
        String(rightTimeline.start || ""),
      ) ||
      String(leftTimeline.end || leftTimeline.start || "").localeCompare(
        String(rightTimeline.end || rightTimeline.start || ""),
      ) ||
      left.id.localeCompare(right.id)
    );
  });
}

export function requestHint(session, caseData) {
  if (
    session.phase !== "investigating" ||
    session.hintUsed ||
    session.actionsLeft < 2
  ) {
    return { session, hint: null };
  }

  const found = new Set(collectedEvidenceIds(session));
  const contradiction = caseData.contradiction;
  const missingPrerequisite = contradiction?.prerequisiteIds.find(
    (id) => !found.has(id),
  );
  const confrontationAvailable =
    getConfrontationAvailability(session, caseData).status === "available";
  const evidenceId =
    missingPrerequisite ||
    caseData.keyEvidenceIds.find(
      (id) => id !== contradiction?.confrontation.id && !found.has(id),
    );
  if (!evidenceId && !confrontationAvailable)
    return { session, hint: "You already have every decisive clue." };

  const location = evidenceId
    ? Object.entries(caseData.locationEvidence).find(
        ([, item]) => item.id === evidenceId,
      )
    : null;
  const interview = evidenceId
    ? Object.entries(caseData.interviews).find(
        ([, item]) => item.id === evidenceId,
      )
    : null;
  const target = confrontationAvailable
    ? "confront the suspect about the exposed contradiction"
    : location
      ? `search the ${location[0]}`
      : `interview ${interview?.[0]}`;
  const actionsLeft = session.actionsLeft - 2;
  const next = {
    ...session,
    actionsLeft,
    hintUsed: true,
  };
  return {
    session: {
      ...next,
      phase: phaseAfterAction(next, caseData, actionsLeft),
    },
    hint: `The next productive lead is to ${target}.`,
  };
}

export function canAccuse(session, caseData) {
  return hasCompletedConfrontation(session, caseData);
}

export function enterAccusation(session, caseData) {
  if (session.phase !== "investigating" || !canAccuse(session, caseData))
    return session;
  return { ...session, phase: "accusing" };
}

export function leaveAccusation(session) {
  if (session.phase !== "accusing" || session.actionsLeft <= 0) return session;
  return { ...session, phase: "investigating" };
}

export function evaluateAccusation(session, caseData, accusation) {
  if (session.phase !== "accusing") {
    return { ok: false, error: "The accusation is not available yet." };
  }
  if (!canAccuse(session, caseData)) {
    return {
      ok: false,
      error: "Resolve the contradiction and confront the suspect first.",
    };
  }
  const selectedEvidenceIds = Array.isArray(accusation?.evidenceIds)
    ? accusation.evidenceIds
    : [];
  if (
    !accusation?.suspectId ||
    !accusation?.motiveId ||
    selectedEvidenceIds.length !== 2
  ) {
    return {
      ok: false,
      error: "Choose a suspect, a motive, and exactly two pieces of evidence.",
    };
  }
  if (new Set(selectedEvidenceIds).size !== 2) {
    return { ok: false, error: "Choose two different pieces of evidence." };
  }
  const found = new Set(collectedEvidenceIds(session));
  if (selectedEvidenceIds.some((id) => !found.has(id))) {
    return {
      ok: false,
      error: "Your proof must come from evidence in your casebook.",
    };
  }

  const correctSuspect = accusation.suspectId === caseData.culpritId;
  const correctMotive = accusation.motiveId === caseData.motiveId;
  const decisiveEvidence = selectedEvidenceIds.filter((id) =>
    caseData.keyEvidenceIds.includes(id),
  ).length;
  const confrontationEvidenceId = caseData.contradiction.confrontation.id;
  const includesConfrontation = selectedEvidenceIds.includes(
    confrontationEvidenceId,
  );
  const won =
    correctSuspect &&
    correctMotive &&
    decisiveEvidence === 2 &&
    includesConfrontation;
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
    includesConfrontation,
    actionsUsed,
    allKeyEvidence,
  };

  return {
    ok: true,
    session: { ...session, phase: "resolved", result },
    result,
  };
}

export function validateCaseData(caseData) {
  const errors = [];
  const baseEvidence = [
    ...Object.values(caseData.locationEvidence || {}),
    ...Object.values(caseData.interviews || {}),
  ];
  const confrontation = caseData.contradiction?.confrontation;
  const allEvidence = confrontation
    ? [...baseEvidence, confrontation]
    : baseEvidence;
  const ids = allEvidence.map((item) => item.id);
  const knownIds = new Set(ids);
  if (new Set(ids).size !== ids.length)
    errors.push("Evidence IDs must be unique.");
  if (!caseData.contradiction) {
    errors.push("A contradiction is required.");
    return errors;
  }
  const prerequisites = caseData.contradiction.prerequisiteIds || [];
  if (prerequisites.length !== 2 || new Set(prerequisites).size !== 2) {
    errors.push("A contradiction requires two distinct prerequisites.");
  }
  for (const id of prerequisites) {
    if (!baseEvidence.some((item) => item.id === id)) {
      errors.push(`Unknown contradiction prerequisite: ${id}`);
    }
  }
  for (const id of caseData.keyEvidenceIds || []) {
    if (!knownIds.has(id)) errors.push(`Unknown decisive evidence: ${id}`);
  }
  if (
    caseData.keyEvidenceIds?.length !== 3 ||
    new Set(caseData.keyEvidenceIds).size !== 3
  ) {
    errors.push("Exactly three distinct decisive evidence IDs are required.");
  }
  if (confrontation && !caseData.keyEvidenceIds?.includes(confrontation.id)) {
    errors.push("Confrontation evidence must be decisive.");
  }
  const timelineEntries = [
    ...baseEvidence.map((item) => [item.id, caseData.timeline?.[item.id]]),
    ...(confrontation ? [[confrontation.id, confrontation.timeline]] : []),
  ];
  const validTime = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const validStatuses = new Set([
    "verified",
    "claimed",
    "inferred",
    "admitted",
  ]);
  for (const [id, timeline] of timelineEntries) {
    if (
      !timeline ||
      !validTime.test(timeline.start) ||
      timeline.start < "22:05" ||
      timeline.start > "22:26" ||
      (timeline.end &&
        (!validTime.test(timeline.end) ||
          timeline.end < timeline.start ||
          timeline.end > "22:26")) ||
      !validStatuses.has(timeline?.status)
    ) {
      errors.push(`Invalid timeline for evidence: ${id}`);
    }
  }
  return errors;
}
