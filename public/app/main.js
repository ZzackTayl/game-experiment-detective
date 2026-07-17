import { caseData } from "./case-data.js";
import {
  ACTIONS,
  createInitialState,
  reduceGame,
  selectCanAccuse,
  selectCanAdvance,
  selectPhase,
  selectPhaseProgress,
  selectVisibleEvidence,
  selectVisibleStatements,
  validateCase,
} from "./game-engine.js";
import { createSaveStore } from "./persistence.js";

const app = document.querySelector("#app");
const saveStatus = document.querySelector("#save-status");
const liveRegion = document.querySelector("#live-region");

let saveStore;
let state;
let loadedFromSave = false;
let selectedStatementId = null;

function createNode(tagName, options = {}, children = []) {
  const node = document.createElement(tagName);

  if (options.className) {
    node.className = options.className;
  }
  if (options.id) {
    node.id = options.id;
  }
  if (options.text !== undefined) {
    node.textContent = options.text;
  }

  for (const [name, value] of Object.entries(options.attributes ?? {})) {
    if (value === false || value === null || value === undefined) {
      continue;
    }
    node.setAttribute(name, value === true ? "" : String(value));
  }
  for (const [name, value] of Object.entries(options.dataset ?? {})) {
    node.dataset[name] = String(value);
  }
  for (const [name, value] of Object.entries(options.properties ?? {})) {
    node[name] = value;
  }

  node.append(...children.filter(Boolean));
  return node;
}

function createActionButton(
  text,
  {
    action,
    className = "secondary-button",
    focusKey = action,
    attributes = {},
    dataset = {},
    disabled = false,
    type = "button",
  },
) {
  return createNode("button", {
    className,
    text,
    attributes: {
      ...attributes,
      type,
    },
    dataset: {
      ...dataset,
      action,
      focusKey,
    },
    properties: { disabled },
  });
}

function createScreenHeading(text, id) {
  return createNode("h1", {
    id,
    text,
    attributes: { tabindex: "-1" },
    dataset: { focusKey: "screen-heading" },
  });
}

function createSuspectAvatar(suspect) {
  return createNode("span", {
    className: "suspect-avatar",
    text: suspect.initials,
    attributes: { "aria-hidden": "true" },
  });
}

function createResetButton() {
  return createActionButton("Reset case", {
    action: "reset-case",
    className: "secondary-button",
    focusKey: "reset-case",
  });
}

function findFocusTarget(focusKey) {
  if (!focusKey) {
    return null;
  }
  return [...app.querySelectorAll("[data-focus-key]")].find(
    (element) => element.dataset.focusKey === focusKey,
  );
}

function render(options = {}) {
  const screen = renderCurrentScreen();
  app.replaceChildren(screen);

  const focusTarget = findFocusTarget(options.focusKey);
  if (focusTarget) {
    focusTarget.focus({ preventScroll: options.preventScroll ?? false });
  }
}

function announce(message) {
  liveRegion.textContent = "";
  window.requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
}

function setSaveStatus(message) {
  saveStatus.textContent = message;
}

function getBrowserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function countLabel(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function describeAction(action, previousState, nextState) {
  switch (action.type) {
    case ACTIONS.START_CASE:
      return `Investigation opened. ${selectPhase(caseData, nextState).label}: ${selectPhase(caseData, nextState).title}.`;
    case ACTIONS.SET_TAB:
      return `${action.tab[0].toUpperCase()}${action.tab.slice(1)} tab selected.`;
    case ACTIONS.VIEW_EVIDENCE: {
      const evidence = caseData.evidence.find(
        (item) => item.id === action.evidenceId,
      );
      const progress = selectPhaseProgress(caseData, nextState);
      return `${evidence.title} reviewed. ${progress.viewed} of ${progress.total} phase records complete.`;
    }
    case ACTIONS.VIEW_STATEMENT: {
      const statement = caseData.statements.find(
        (item) => item.id === action.statementId,
      );
      const suspect = caseData.suspects.find(
        (item) => item.id === statement.suspectId,
      );
      return `${suspect.name}'s interview reviewed.`;
    }
    case ACTIONS.ADVANCE_PHASE: {
      const phase = selectPhase(caseData, nextState);
      return `${phase.label} unlocked: ${phase.title}.`;
    }
    case ACTIONS.OPEN_ACCUSATION:
      return "Final accusation opened. Select one suspect and exactly four evidence records.";
    case ACTIONS.SET_CULPRIT: {
      const suspect = caseData.suspects.find(
        (item) => item.id === action.culpritId,
      );
      return `Suspect selected: ${suspect.name}.`;
    }
    case ACTIONS.TOGGLE_ACCUSATION_EVIDENCE: {
      const evidence = caseData.evidence.find(
        (item) => item.id === action.evidenceId,
      );
      const selected = nextState.accusation.evidenceIds.includes(
        action.evidenceId,
      );
      return `${evidence.title} ${selected ? "selected" : "removed"}. ${nextState.accusation.evidenceIds.length} of 4 evidence records selected.`;
    }
    case ACTIONS.USE_HINT:
      return `Hint ${nextState.hintsUsed} of ${caseData.hints.length} revealed.`;
    case ACTIONS.SUBMIT_ACCUSATION:
      return nextState.outcome === "correct"
        ? "Case solved. The evidence chain holds."
        : "Accusation reviewed. The theory has a broken link.";
    case ACTIONS.RETURN_TO_CASE:
      return "Returned to the investigation. Your accusation draft is preserved.";
    case ACTIONS.RESET_CASE:
      return "Case reset. All investigation progress was cleared.";
    default:
      return previousState === nextState ? "" : "Case updated.";
  }
}

function dispatch(action, options = {}) {
  const previousState = state;
  const previousFocusKey = document.activeElement?.dataset?.focusKey;
  const nextState = reduceGame(previousState, action, caseData);

  if (nextState === previousState) {
    if (options.renderOnNoop) {
      render({ focusKey: options.focusKey ?? previousFocusKey });
    }
    return false;
  }

  state = nextState;
  if (options.persist === false) {
    setSaveStatus(
      options.saveMessage ??
        (saveStore.available
          ? "Progress cleared"
          : "Autosave unavailable · play continues"),
    );
  } else if (saveStore.save(state)) {
    setSaveStatus("Progress saved");
  } else {
    setSaveStatus("Autosave unavailable · play continues");
  }

  render({
    focusKey: options.focusKey ?? previousFocusKey,
    preventScroll: options.preventScroll,
  });
  announce(
    options.announcement ?? describeAction(action, previousState, nextState),
  );
  return true;
}

function renderIntake() {
  const section = createNode("section", {
    className: "screen intake",
    attributes: { "aria-labelledby": "intake-title" },
  });

  section.append(
    createNode("p", { className: "eyebrow", text: caseData.eyebrow }),
    createScreenHeading(caseData.title, "intake-title"),
    createNode("p", { text: caseData.summary }),
  );

  const briefing = createNode("section", {
    className: "briefing-panel",
    attributes: { "aria-labelledby": "briefing-title" },
  });
  briefing.append(
    createNode("h2", { id: "briefing-title", text: "Incident briefing" }),
    ...caseData.briefing.map((paragraph) =>
      createNode("p", { text: paragraph }),
    ),
    createNode("h3", { text: "Objective" }),
    createNode("p", { text: caseData.objective }),
  );
  section.append(briefing);

  const suspectsSection = createNode("section", {
    attributes: { "aria-labelledby": "suspects-title" },
  });
  suspectsSection.append(
    createNode("h2", { id: "suspects-title", text: "People of interest" }),
    createNode("p", {
      text: "Each suspect has a reason to hide the truth. Separate a dangerous secret from the murder itself.",
    }),
  );
  const suspects = createNode("ul", { className: "suspect-options" });
  for (const suspect of caseData.suspects) {
    const details = createNode("div");
    details.append(
      createNode("h3", { text: suspect.name }),
      createNode("p", { text: suspect.role }),
      createNode("p", { text: suspect.summary }),
      createNode("p", { text: `Possible motive: ${suspect.motive}` }),
    );
    suspects.append(
      createNode("li", { className: "statement-card" }, [
        createSuspectAvatar(suspect),
        details,
      ]),
    );
  }
  suspectsSection.append(suspects);
  section.append(suspectsSection);

  if (loadedFromSave) {
    section.append(
      createNode("p", {
        className: "status-pill",
        text: "Saved case file found",
      }),
    );
  }
  section.append(
    createActionButton(
      loadedFromSave ? "Resume investigation" : "Start investigation",
      {
        action: "start-case",
        className: "primary-button",
        focusKey: "start-case",
      },
    ),
  );
  return section;
}

function renderCaseHeader(phase) {
  const headingGroup = createNode("div");
  headingGroup.append(
    createNode("p", { className: "eyebrow", text: caseData.title }),
    createNode("span", { className: "phase-chip", text: phase.label }),
    createScreenHeading(phase.title, "investigation-title"),
    createNode("p", { text: phase.description }),
  );

  return createNode("header", { className: "case-header" }, [
    headingGroup,
    createResetButton(),
  ]);
}

function renderProgress(progress) {
  const percentage =
    progress.total === 0
      ? 0
      : Math.round((progress.viewed / progress.total) * 100);
  const group = createNode("div");
  group.append(
    createNode("p", {
      id: "phase-progress-text",
      text: `Phase progress: ${progress.viewed} of ${progress.total} records reviewed — ${progress.evidenceViewed} of ${progress.evidenceTotal} evidence and ${progress.statementsViewed} of ${progress.statementsTotal} interviews.`,
    }),
    createNode("progress", {
      className: "progress-track",
      text: `${percentage}%`,
      attributes: {
        "aria-describedby": "phase-progress-text",
        "aria-label": "Phase completion",
      },
      properties: {
        max: Math.max(progress.total, 1),
        value: progress.viewed,
      },
    }),
  );
  return group;
}

const TAB_DETAILS = [
  ["evidence", "Evidence"],
  ["interviews", "Interviews"],
  ["timeline", "Timeline"],
];

function renderTabs() {
  const tabList = createNode("div", {
    className: "tabs",
    attributes: { role: "tablist", "aria-label": "Case records" },
  });

  for (const [tabId, label] of TAB_DETAILS) {
    const selected = state.activeTab === tabId;
    tabList.append(
      createActionButton(label, {
        action: "set-tab",
        className: `tab${selected ? " is-active" : ""}`,
        focusKey: `tab:${tabId}`,
        attributes: {
          role: "tab",
          id: `tab-${tabId}`,
          "aria-controls": `panel-${tabId}`,
          "aria-selected": String(selected),
          tabindex: selected ? "0" : "-1",
        },
        dataset: { tab: tabId },
      }),
    );
  }
  return tabList;
}

function renderEvidenceCard(evidence) {
  const selected = state.selectedEvidenceId === evidence.id;
  const viewed = state.viewedEvidenceIds.includes(evidence.id);
  const card = createActionButton("", {
    action: "view-evidence",
    className: `evidence-card${viewed ? " is-read" : ""}${selected ? " is-selected" : ""}`,
    focusKey: `evidence:${evidence.id}`,
    attributes: {
      "aria-label": `${viewed ? "Review" : "Open"} ${evidence.code}, ${evidence.title}`,
      "aria-pressed": String(selected),
    },
    dataset: { evidenceId: evidence.id },
  });
  card.append(
    createNode("span", { className: "evidence-code", text: evidence.code }),
    createNode("span", { className: "evidence-type", text: evidence.type }),
    createNode("strong", { text: evidence.title }),
    createNode("span", { text: evidence.summary }),
  );
  return card;
}

function renderEvidenceDetail(selectedEvidence) {
  if (!selectedEvidence) {
    return createNode("aside", {
      className: "locked-panel",
      text: "Select an evidence card to inspect its details and investigative implication.",
      attributes: { "aria-label": "No evidence selected" },
    });
  }

  const panel = createNode("aside", {
    className: "detail-panel",
    attributes: {
      "aria-labelledby": "evidence-detail-title",
    },
  });
  panel.append(
    createNode("span", {
      className: "evidence-code",
      text: selectedEvidence.code,
    }),
    createNode("span", {
      className: "evidence-type",
      text: selectedEvidence.type,
    }),
    createNode("h2", {
      id: "evidence-detail-title",
      text: selectedEvidence.title,
    }),
    createNode("p", { text: `Recorded time: ${selectedEvidence.time}` }),
    createNode("p", { text: selectedEvidence.detail }),
    createNode("h3", { text: "What it suggests" }),
    createNode("p", { text: selectedEvidence.implication }),
  );
  return panel;
}

function renderEvidencePanel() {
  const visibleEvidence = selectVisibleEvidence(caseData, state);
  const selectedEvidence = visibleEvidence.find(
    (item) => item.id === state.selectedEvidenceId,
  );
  const grid = createNode("div", {
    className: "evidence-grid",
    attributes: { "aria-label": "Current phase evidence" },
  });
  grid.append(...visibleEvidence.map(renderEvidenceCard));

  return createNode(
    "section",
    {
      id: "panel-evidence",
      className: "workspace",
      attributes: {
        role: "tabpanel",
        "aria-labelledby": "tab-evidence",
      },
    },
    [grid, renderEvidenceDetail(selectedEvidence)],
  );
}

function renderStatementCard(statement) {
  const suspect = caseData.suspects.find(
    (item) => item.id === statement.suspectId,
  );
  const viewed = state.viewedStatementIds.includes(statement.id);
  const selected = selectedStatementId === statement.id;
  const details = createNode("div");
  details.append(
    createNode("h3", { text: suspect.name }),
    createNode("p", { text: suspect.role }),
    createNode("span", {
      className: `status-pill${viewed ? " is-confirmed" : " is-question"}`,
      text: viewed ? "Reviewed" : "Unread",
    }),
    createActionButton(viewed ? "Review interview" : "Open interview", {
      action: "view-statement",
      className: "text-button",
      focusKey: `statement:${statement.id}`,
      attributes: {
        "aria-controls": "statement-detail",
        "aria-expanded": String(selected),
      },
      dataset: { statementId: statement.id },
    }),
  );

  return createNode("li", { className: "statement-card" }, [
    createSuspectAvatar(suspect),
    details,
  ]);
}

function renderStatementDetail(statements) {
  const selectedStatement = statements.find(
    (item) => item.id === selectedStatementId,
  );
  if (!selectedStatement) {
    return createNode("aside", {
      id: "statement-detail",
      className: "locked-panel",
      text: "Open an interview to read the suspect's statement and your analysis notes.",
      attributes: { "aria-label": "No interview selected" },
    });
  }

  const suspect = caseData.suspects.find(
    (item) => item.id === selectedStatement.suspectId,
  );
  const panel = createNode("aside", {
    id: "statement-detail",
    className: "detail-panel",
    attributes: { "aria-labelledby": "statement-detail-title" },
  });
  panel.append(
    createNode("p", { className: "eyebrow", text: "Interview transcript" }),
    createNode("h2", {
      id: "statement-detail-title",
      text: suspect.name,
    }),
    createNode("p", { text: suspect.role }),
    createNode("blockquote", { text: `“${selectedStatement.quote}”` }),
    createNode("h3", { text: "Analysis" }),
    createNode("p", { text: selectedStatement.analysis }),
  );
  return panel;
}

function renderInterviewsPanel() {
  const statements = selectVisibleStatements(caseData, state);
  if (!statements.some((item) => item.id === selectedStatementId)) {
    selectedStatementId = null;
  }

  const list = createNode("ul", {
    className: "statement-list",
    attributes: { "aria-label": "Current phase interviews" },
  });
  list.append(...statements.map(renderStatementCard));

  return createNode(
    "section",
    {
      id: "panel-interviews",
      className: "workspace",
      attributes: {
        role: "tabpanel",
        "aria-labelledby": "tab-interviews",
      },
    },
    [list, renderStatementDetail(statements)],
  );
}

function evidenceTimeValue(time) {
  const match = time.match(/(\d{2}):(\d{2})/);
  if (!match) {
    return Number.POSITIVE_INFINITY;
  }
  const value = Number(match[1]) * 60 + Number(match[2]);
  return time.startsWith("Before") ? value - 0.5 : value;
}

function getReviewedTimelineEvidence() {
  const unlockedPhaseIds = new Set(
    caseData.phases.slice(0, state.phaseIndex + 1).map((phase) => phase.id),
  );

  return caseData.evidence
    .map((evidence, order) => ({ evidence, order }))
    .filter(
      ({ evidence }) =>
        unlockedPhaseIds.has(evidence.phase) &&
        state.viewedEvidenceIds.includes(evidence.id),
    )
    .sort(
      (left, right) =>
        evidenceTimeValue(left.evidence.time) -
          evidenceTimeValue(right.evidence.time) || left.order - right.order,
    )
    .map(({ evidence }) => evidence);
}

function renderTimelinePanel() {
  const panel = createNode("section", {
    id: "panel-timeline",
    attributes: {
      role: "tabpanel",
      "aria-labelledby": "tab-timeline",
    },
  });
  const evidence = getReviewedTimelineEvidence();

  if (evidence.length === 0) {
    panel.append(
      createNode("div", {
        className: "locked-panel",
        text: "Your timeline is empty. Review evidence cards in the Evidence tab to add their known times and observations here.",
      }),
    );
    return panel;
  }

  panel.append(
    createNode("p", {
      text: "This working chronology contains only evidence you have already reviewed. Unknown times appear last.",
    }),
  );
  const timeline = createNode("ol", {
    className: "timeline",
    attributes: { "aria-label": "Reviewed evidence chronology" },
  });
  for (const item of evidence) {
    timeline.append(
      createNode("li", { className: "timeline-entry" }, [
        createNode("time", { text: item.time }),
        createNode("h3", { text: item.title }),
        createNode("p", { text: item.summary }),
      ]),
    );
  }
  panel.append(timeline);
  return panel;
}

function renderActiveTabPanel() {
  switch (state.activeTab) {
    case "interviews":
      return renderInterviewsPanel();
    case "timeline":
      return renderTimelinePanel();
    default:
      return renderEvidencePanel();
  }
}

function renderHints() {
  const group = createNode("section", {
    attributes: { "aria-labelledby": "hints-title" },
  });
  group.append(
    createNode("h2", { id: "hints-title", text: "Investigation hints" }),
  );

  if (state.hintsUsed === 0) {
    group.append(
      createNode("p", {
        text: "Hints are optional. Each one gives a stronger nudge and is reflected in your final grade.",
      }),
    );
  }

  caseData.hints.slice(0, state.hintsUsed).forEach((hint, index) => {
    group.append(
      createNode(
        "article",
        {
          className: "hint-panel",
          attributes: { "aria-labelledby": `hint-title-${index}` },
        },
        [
          createNode("p", {
            className: "eyebrow",
            text: `Hint ${index + 1} of ${caseData.hints.length}`,
          }),
          createNode("h3", {
            id: `hint-title-${index}`,
            text: hint.title,
            attributes: { tabindex: "-1" },
            dataset: { focusKey: `hint:${index + 1}` },
          }),
          createNode("p", { text: hint.text }),
        ],
      ),
    );
  });

  if (state.hintsUsed < caseData.hints.length) {
    group.append(
      createActionButton(
        state.hintsUsed === 0 ? "Reveal first hint" : "Reveal next hint",
        {
          action: "use-hint",
          className: "text-button",
          focusKey: "use-hint",
        },
      ),
    );
  } else {
    group.append(
      createNode("p", {
        className: "status-pill",
        text: "All hints revealed",
      }),
    );
  }
  return group;
}

function renderPhaseControls(progress) {
  const finalPhase = state.phaseIndex === caseData.phases.length - 1;
  const remaining = progress.total - progress.viewed;
  const canContinue = finalPhase
    ? selectCanAccuse(caseData, state)
    : selectCanAdvance(caseData, state);
  const panel = createNode("section", {
    className: "briefing-panel",
    attributes: { "aria-labelledby": "phase-controls-title" },
  });
  panel.append(
    createNode("h2", {
      id: "phase-controls-title",
      text: finalPhase ? "Final theory" : "Next phase",
    }),
  );

  if (!canContinue) {
    const destination = finalPhase
      ? "the final accusation"
      : caseData.phases[state.phaseIndex + 1].label;
    panel.append(
      createNode("p", {
        text: `Review the remaining ${countLabel(remaining, "record")} in this phase to unlock ${destination}. Evidence and interviews both count.`,
      }),
      createActionButton(
        finalPhase ? "Final accusation locked" : "Next phase locked",
        {
          action: finalPhase ? "open-accusation" : "advance-phase",
          className: "primary-button",
          focusKey: finalPhase ? "open-accusation" : "advance-phase",
          disabled: true,
        },
      ),
    );
    return panel;
  }

  panel.append(
    createNode("p", {
      text: finalPhase
        ? "Every case record is reviewed. Build a four-part evidence chain and name the culprit."
        : "Every record in this phase is reviewed. The next set of evidence and interviews is ready.",
    }),
    createActionButton(
      finalPhase ? "Open final accusation" : "Advance to next phase",
      {
        action: finalPhase ? "open-accusation" : "advance-phase",
        className: "primary-button",
        focusKey: finalPhase ? "open-accusation" : "advance-phase",
      },
    ),
  );
  return panel;
}

function renderInvestigation() {
  const phase = selectPhase(caseData, state);
  const progress = selectPhaseProgress(caseData, state);
  const section = createNode("section", {
    className: "screen",
    attributes: { "aria-labelledby": "investigation-title" },
  });
  section.append(
    renderCaseHeader(phase),
    renderProgress(progress),
    renderTabs(),
    renderActiveTabPanel(),
    renderHints(),
    renderPhaseControls(progress),
  );
  return section;
}

const PROOF_CATEGORIES = [
  [
    "Time and place",
    "Show where Lucian died and which facts establish the real time.",
  ],
  ["Presence", "Connect the accused person physically to the decisive scene."],
  [
    "Staging",
    "Explain how the discovery scene or its apparent time was manipulated.",
  ],
  [
    "Lure and purpose",
    "Show why Lucian went to danger and what drove the crime.",
  ],
];

function renderProofCategories() {
  const list = createNode("ol", {
    className: "result-chain",
    attributes: { "aria-label": "Required proof categories" },
  });
  for (const [title, description] of PROOF_CATEGORIES) {
    list.append(
      createNode("li", {}, [
        createNode("strong", { text: title }),
        createNode("p", { text: description }),
      ]),
    );
  }
  return list;
}

function renderSuspectOptions() {
  const options = createNode("div", {
    className: "suspect-options",
    attributes: {
      role: "radiogroup",
      "aria-labelledby": "choose-suspect-title",
    },
  });

  caseData.suspects.forEach((suspect, index) => {
    const selected = state.accusation.culpritId === suspect.id;
    const details = createNode("span");
    details.append(
      createNode("strong", { text: suspect.name }),
      createNode("small", { text: suspect.role }),
    );
    options.append(
      createActionButton("", {
        action: "set-culprit",
        className: `suspect-option${selected ? " is-selected" : ""}`,
        focusKey: `suspect:${suspect.id}`,
        attributes: {
          role: "radio",
          "aria-checked": String(selected),
          "aria-label": `${suspect.name}, ${suspect.role}`,
          tabindex:
            selected || (state.accusation.culpritId === null && index === 0)
              ? "0"
              : "-1",
        },
        dataset: { culpritId: suspect.id },
      }),
    );
    options.lastElementChild.append(createSuspectAvatar(suspect), details);
  });
  return options;
}

function renderProofOptions() {
  const selectedIds = state.accusation.evidenceIds;
  const atLimit = selectedIds.length === 4;
  const list = createNode("ul", {
    className: "proof-list",
    attributes: {
      "aria-labelledby": "choose-proof-title",
      "aria-describedby": "proof-guidance",
    },
  });

  for (const evidence of caseData.evidence) {
    const selected = selectedIds.includes(evidence.id);
    const details = createNode("span");
    details.append(
      createNode("strong", { text: `${evidence.code} · ${evidence.title}` }),
      createNode("small", {
        text:
          atLimit && !selected
            ? "Remove a selected record before choosing this one."
            : `${evidence.type} · ${evidence.time}`,
      }),
    );
    const button = createActionButton("", {
      action: "toggle-proof",
      className: `proof-option${selected ? " is-selected" : ""}`,
      focusKey: `proof:${evidence.id}`,
      attributes: {
        "aria-label": `${selected ? "Remove" : "Select"} ${evidence.code}, ${evidence.title}`,
        "aria-pressed": String(selected),
      },
      dataset: { evidenceId: evidence.id },
      disabled: atLimit && !selected,
    });
    button.append(details);
    list.append(createNode("li", {}, [button]));
  }
  return list;
}

function accusationGuidance() {
  const suspectChosen = state.accusation.culpritId !== null;
  const evidenceCount = state.accusation.evidenceIds.length;
  if (!suspectChosen && evidenceCount < 4) {
    return `Choose a suspect and ${countLabel(4 - evidenceCount, "more evidence record", "more evidence records")}.`;
  }
  if (!suspectChosen) {
    return "Your evidence chain has four records. Choose the suspect it proves.";
  }
  if (evidenceCount < 4) {
    return `Suspect selected. Choose ${countLabel(4 - evidenceCount, "more evidence record", "more evidence records")}.`;
  }
  return "Your suspect and four evidence records are ready for submission.";
}

function renderAccusation() {
  const section = createNode("section", {
    className: "screen",
    attributes: { "aria-labelledby": "accusation-title" },
  });
  const headingGroup = createNode("div");
  headingGroup.append(
    createNode("p", { className: "eyebrow", text: "Final accusation" }),
    createScreenHeading("Build the evidence chain", "accusation-title"),
    createNode("p", {
      text: "Name one suspect and select exactly four evidence records. A complete theory must support all four proof categories.",
    }),
  );
  section.append(
    createNode("header", { className: "case-header" }, [
      headingGroup,
      createResetButton(),
    ]),
  );

  const form = createNode("form", {
    className: "accusation-layout",
    attributes: { novalidate: true },
    dataset: { accusationForm: "true" },
  });
  const suspectColumn = createNode("section", {
    attributes: { "aria-labelledby": "choose-suspect-title" },
  });
  suspectColumn.append(
    createNode("h2", {
      id: "choose-suspect-title",
      text: "1. Name the culprit",
    }),
    createNode("p", {
      text: "Select the person your evidence places at the center of the complete sequence.",
    }),
    renderSuspectOptions(),
  );

  const proofColumn = createNode("section", {
    attributes: { "aria-labelledby": "choose-proof-title" },
  });
  proofColumn.append(
    createNode("h2", {
      id: "choose-proof-title",
      text: "2. Prove the theory",
    }),
    createNode("p", {
      text: "Your four selections should form one chain, with evidence for each category below.",
    }),
    renderProofCategories(),
    createNode("p", {
      className: "selection-count",
      text: `${state.accusation.evidenceIds.length} / 4 selected`,
    }),
    createNode("p", {
      id: "proof-guidance",
      text: accusationGuidance(),
      attributes: { role: "status" },
    }),
    renderProofOptions(),
  );
  form.append(suspectColumn, proofColumn);

  const ready =
    state.accusation.culpritId !== null &&
    state.accusation.evidenceIds.length === 4;
  form.append(
    createNode("div", {}, [
      createActionButton("Submit accusation", {
        action: "submit-accusation",
        className: "primary-button",
        focusKey: "submit-accusation",
        type: "submit",
        disabled: !ready,
      }),
      createActionButton("Return to case", {
        action: "return-draft",
        className: "text-button",
        focusKey: "return-draft",
      }),
    ]),
  );
  section.append(form);
  return section;
}

function getSubmittedEvidence() {
  const submittedIds = state.submission?.evidenceIds ?? [];
  return submittedIds
    .map((id) => caseData.evidence.find((item) => item.id === id))
    .filter(Boolean);
}

function renderEvidenceChain(evidence, label) {
  const list = createNode("ol", {
    className: "result-chain",
    attributes: { "aria-label": label },
  });
  for (const item of evidence) {
    list.append(
      createNode("li", {}, [
        createNode("strong", { text: `${item.code} · ${item.title}` }),
        createNode("p", { text: item.implication }),
      ]),
    );
  }
  return list;
}

function renderIncorrectResolution() {
  const submittedEvidence = getSubmittedEvidence();
  const accusedSuspect = caseData.suspects.find(
    (suspect) => suspect.id === state.submission.culpritId,
  );
  const panel = createNode("section", {
    className: "result-panel is-failure",
    attributes: {
      "aria-labelledby": "resolution-title",
      "data-result": "failure",
    },
  });
  panel.append(
    createNode("p", { className: "eyebrow", text: "Theory not sustained" }),
    createScreenHeading("The chain has a broken link", "resolution-title"),
    createNode("p", {
      text: "At least one part of this accusation does not connect the true time and place, the culprit's presence, the staged bell, and the lure. The case remains open, and no alternative culprit has been revealed.",
    }),
    createNode("p", {
      className: "status-pill is-contradiction",
      text: `Submitted suspect: ${accusedSuspect.name}`,
    }),
    createNode("h2", { text: "Submitted evidence" }),
    renderEvidenceChain(submittedEvidence, "Submitted evidence"),
    createNode("p", {
      text: "Return to the case to compare these records with the full chronology. Your accusation draft will remain selected.",
    }),
    createNode("div", {}, [
      createActionButton("Return to case", {
        action: "return-case",
        className: "primary-button",
        focusKey: "return-case",
      }),
      createResetButton(),
    ]),
  );
  return createNode("section", { className: "screen" }, [panel]);
}

function gradeForHints(hintsUsed) {
  if (hintsUsed === 0) {
    return {
      title: "Master detective",
      detail: "Solved with no hints used.",
    };
  }
  if (hintsUsed === 1) {
    return {
      title: "Sharp deduction",
      detail: "Solved with 1 hint used.",
    };
  }
  if (hintsUsed === 2) {
    return {
      title: "Steady investigator",
      detail: "Solved with 2 hints used.",
    };
  }
  return {
    title: "Case solver",
    detail: `Solved with ${hintsUsed} hints used.`,
  };
}

function renderTrueTimeline() {
  const timeline = createNode("ol", {
    className: "timeline",
    attributes: { "aria-label": "True sequence of events" },
  });
  for (const entry of caseData.solution.timeline) {
    timeline.append(
      createNode("li", { className: "timeline-entry" }, [
        createNode("time", { text: entry.time }),
        createNode("p", { text: entry.event }),
      ]),
    );
  }
  return timeline;
}

function renderCorrectResolution() {
  const grade = gradeForHints(state.hintsUsed);
  const panel = createNode("section", {
    className: "result-panel is-success",
    attributes: {
      "aria-labelledby": "resolution-title",
      "data-result": "success",
    },
  });
  panel.append(
    createNode("p", { className: "eyebrow", text: "Case closed" }),
    createScreenHeading(caseData.solution.headline, "resolution-title"),
    createNode("p", { text: caseData.solution.rationale }),
    createNode("h2", { text: "Confession" }),
    createNode("blockquote", { text: `“${caseData.solution.confession}”` }),
    createNode("h2", { text: "The true timeline" }),
    renderTrueTimeline(),
    createNode("h2", { text: "Your evidence chain" }),
    renderEvidenceChain(getSubmittedEvidence(), "Successful evidence chain"),
    createNode("section", { className: "hint-panel" }, [
      createNode("p", { className: "eyebrow", text: "Investigation grade" }),
      createNode("h2", { text: grade.title }),
      createNode("p", { text: grade.detail }),
    ]),
    createResetButton(),
  );
  return createNode("section", { className: "screen" }, [panel]);
}

function renderResolution() {
  return state.outcome === "correct"
    ? renderCorrectResolution()
    : renderIncorrectResolution();
}

function renderCurrentScreen() {
  switch (state.screen) {
    case "investigate":
      return renderInvestigation();
    case "accuse":
      return renderAccusation();
    case "resolution":
      return renderResolution();
    default:
      return renderIntake();
  }
}

function resetCase() {
  if (
    !window.confirm(
      "Reset this case? All reviewed evidence, interviews, hints, and accusation progress will be cleared.",
    )
  ) {
    return;
  }

  saveStore.clear();
  selectedStatementId = null;
  loadedFromSave = false;
  dispatch(
    { type: ACTIONS.RESET_CASE },
    {
      persist: false,
      focusKey: "screen-heading",
      saveMessage: saveStore.available
        ? "Case reset · save cleared"
        : "Case reset · autosave unavailable",
    },
  );
}

function handleAction(button) {
  const action = button.dataset.action;

  switch (action) {
    case "start-case":
      dispatch({ type: ACTIONS.START_CASE }, { focusKey: "screen-heading" });
      break;
    case "set-tab":
      dispatch(
        { type: ACTIONS.SET_TAB, tab: button.dataset.tab },
        { focusKey: `tab:${button.dataset.tab}`, preventScroll: true },
      );
      break;
    case "view-evidence":
      dispatch({
        type: ACTIONS.VIEW_EVIDENCE,
        evidenceId: button.dataset.evidenceId,
      });
      break;
    case "view-statement": {
      const previousSelection = selectedStatementId;
      selectedStatementId = button.dataset.statementId;
      const accepted = dispatch({
        type: ACTIONS.VIEW_STATEMENT,
        statementId: button.dataset.statementId,
      });
      if (!accepted && previousSelection !== selectedStatementId) {
        const statement = caseData.statements.find(
          (item) => item.id === selectedStatementId,
        );
        const suspect = caseData.suspects.find(
          (item) => item.id === statement.suspectId,
        );
        render({ focusKey: `statement:${selectedStatementId}` });
        announce(`${suspect.name}'s interview opened.`);
      }
      break;
    }
    case "advance-phase":
      selectedStatementId = null;
      dispatch({ type: ACTIONS.ADVANCE_PHASE }, { focusKey: "screen-heading" });
      break;
    case "open-accusation":
      dispatch(
        { type: ACTIONS.OPEN_ACCUSATION },
        { focusKey: "screen-heading" },
      );
      break;
    case "set-culprit":
      dispatch({
        type: ACTIONS.SET_CULPRIT,
        culpritId: button.dataset.culpritId,
      });
      break;
    case "toggle-proof":
      dispatch({
        type: ACTIONS.TOGGLE_ACCUSATION_EVIDENCE,
        evidenceId: button.dataset.evidenceId,
      });
      break;
    case "use-hint":
      dispatch(
        { type: ACTIONS.USE_HINT },
        { focusKey: `hint:${state.hintsUsed + 1}` },
      );
      break;
    case "return-draft":
      dispatch(
        { type: ACTIONS.RETURN_TO_CASE },
        { focusKey: "screen-heading" },
      );
      break;
    case "return-case":
      dispatch(
        { type: ACTIONS.RETURN_TO_CASE },
        { focusKey: "screen-heading" },
      );
      break;
    case "reset-case":
      resetCase();
      break;
    case "reload-case":
      window.location.reload();
      break;
  }
}

function handleTabKeydown(event, tab) {
  const tabs = [...app.querySelectorAll('[role="tab"]')];
  const currentIndex = tabs.indexOf(tab);
  let targetIndex;

  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    targetIndex = (currentIndex + 1) % tabs.length;
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  } else if (event.key === "Home") {
    targetIndex = 0;
  } else if (event.key === "End") {
    targetIndex = tabs.length - 1;
  } else {
    return;
  }

  event.preventDefault();
  const target = tabs[targetIndex];
  dispatch(
    { type: ACTIONS.SET_TAB, tab: target.dataset.tab },
    {
      focusKey: `tab:${target.dataset.tab}`,
      preventScroll: true,
      renderOnNoop: true,
    },
  );
}

function handleRadioKeydown(event, radio) {
  if (
    !["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)
  ) {
    return;
  }

  const radios = [...app.querySelectorAll('[role="radio"]')];
  const direction =
    event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
  const target =
    radios[(radios.indexOf(radio) + direction + radios.length) % radios.length];
  event.preventDefault();
  dispatch(
    {
      type: ACTIONS.SET_CULPRIT,
      culpritId: target.dataset.culpritId,
    },
    {
      focusKey: `suspect:${target.dataset.culpritId}`,
      preventScroll: true,
      renderOnNoop: true,
    },
  );
}

function renderCaseError(errors) {
  setSaveStatus("Case unavailable");
  const panel = createNode("section", {
    className: "result-panel is-failure",
    attributes: { "aria-labelledby": "case-error-title" },
  });
  panel.append(
    createNode("p", { className: "eyebrow", text: "Case file error" }),
    createNode("h1", {
      id: "case-error-title",
      text: "The case file could not be opened",
    }),
    createNode("p", {
      text: "The investigation data failed validation. Reload to try opening the original case file again.",
    }),
  );
  const list = createNode("ul");
  list.append(...errors.map((error) => createNode("li", { text: error })));
  panel.append(
    list,
    createActionButton("Reload case file", {
      action: "reload-case",
      className: "primary-button",
      focusKey: "reload-case",
    }),
  );
  app.replaceChildren(
    createNode("section", { className: "screen intake" }, [panel]),
  );
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || !app.contains(button) || button.disabled) {
    return;
  }
  handleAction(button);
});

app.addEventListener("submit", (event) => {
  if (!event.target.matches("[data-accusation-form]")) {
    return;
  }
  event.preventDefault();
  dispatch({ type: ACTIONS.SUBMIT_ACCUSATION }, { focusKey: "screen-heading" });
});

app.addEventListener("keydown", (event) => {
  const tab = event.target.closest('[role="tab"]');
  if (tab) {
    handleTabKeydown(event, tab);
    return;
  }

  const radio = event.target.closest('[role="radio"]');
  if (radio) {
    handleRadioKeydown(event, radio);
  }
});

const caseErrors = validateCase(caseData);
if (caseErrors.length > 0) {
  renderCaseError(caseErrors);
} else {
  saveStore = createSaveStore(getBrowserStorage(), caseData);
  const loadedState = saveStore.load();
  loadedFromSave = loadedState !== null;
  state = loadedState ?? createInitialState(caseData);

  if (loadedFromSave) {
    setSaveStatus("Progress restored");
  } else if (saveStore.available) {
    setSaveStatus("Case not started · autosave ready");
  } else {
    setSaveStatus("Autosave unavailable · play continues");
  }

  render();
  if (loadedFromSave && state.screen !== "intake") {
    announce("Saved investigation resumed.");
  }
}
