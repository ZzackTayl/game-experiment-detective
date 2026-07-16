import { cases, casesById, locations, motives, suspects } from "./cases.js";
import {
  createSession,
  enterAccusation,
  evaluateAccusation,
  performInvestigation,
  requestHint,
} from "./engine.js";

const STORAGE_KEY = "game-experiment-detective:v1";
const app = document.querySelector("#app");
const announcer = document.querySelector("#announcer");
let screen = "home";
let session = null;
let notice = "";
let error = "";
let progress = loadProgress();

function loadProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      solved: Array.isArray(value?.solved)
        ? value.solved.filter((id) => casesById[id])
        : [],
      bestScores:
        value?.bestScores && typeof value.bestScores === "object"
          ? value.bestScores
          : {},
    };
  } catch {
    return { solved: [], bestScores: {} };
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    announce("Progress could not be saved, but you can keep playing.");
  }
}

function announce(message) {
  announcer.textContent = "";
  requestAnimationFrame(() => {
    announcer.textContent = message;
  });
}

function chooseCase() {
  const unsolved = cases.filter((item) => !progress.solved.includes(item.id));
  const pool = unsolved.length
    ? unsolved
    : cases.filter((item) => item.id !== session?.caseId);
  return pool[Math.floor(Math.random() * pool.length)] || cases[0];
}

function startCase() {
  const caseData = chooseCase();
  session = createSession(caseData.id);
  screen = "briefing";
  notice = "";
  error = "";
  render(true);
}

function currentCase() {
  return session ? casesById[session.caseId] : null;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label, action, className = "button") {
  const node = element("button", className, label);
  node.type = "button";
  node.dataset.action = action;
  return node;
}

function renderHome() {
  const section = element("section", "hero");
  section.append(
    element("p", "eyebrow", "A closed-room deduction game"),
    element("h1", "", "The experiment is gone. The culprit is still inside."),
    element(
      "p",
      "lead",
      "At 10:20 p.m., ECHO's behavioral dataset was wiped and its encrypted master drive vanished. Four people are trapped inside the studio. Search the scene, challenge their stories, and prove your accusation before lockdown ends.",
    ),
  );
  const stats = element("div", "stats");
  [
    [String(progress.solved.length), "Case variants solved"],
    ["12", "Actions per investigation"],
    ["4", "Possible culprits"],
  ].forEach(([value, label]) => {
    const item = element("div", "stat");
    item.append(element("strong", "", value), element("span", "", label));
    stats.append(item);
  });
  section.append(stats);
  const actions = element("div", "button-row");
  actions.append(
    button(
      progress.solved.length ? "Open a new case" : "Accept the case",
      "start",
    ),
  );
  if (progress.solved.length)
    actions.append(button("Reset progress", "reset", "button danger"));
  section.append(actions);
  return section;
}

function renderBriefing() {
  const fragment = document.createDocumentFragment();
  fragment.append(
    element("p", "eyebrow", "Confidential incident briefing"),
    element("h1", "", "The ECHO Sabotage"),
    element(
      "p",
      "lead",
      "The wipe began locally at 10:17. The master drive left its locked cradle at 10:19. Nobody entered or left the studio between 10:05 and 10:26.",
    ),
  );
  const rules = element("div", "notice");
  rules.textContent =
    "You have 12 actions. Search locations or interview suspects, then accuse one person, choose their motive, and support the charge with exactly two decisive clues.";
  fragment.append(rules, element("h2", "", "Persons of interest"));
  const grid = element("div", "briefing-grid");
  suspects.forEach((suspect) => {
    const card = element("article", "suspect");
    card.append(
      element("p", "role", suspect.role),
      element("h3", "", suspect.name),
      element("p", "", suspect.profile),
    );
    grid.append(card);
  });
  fragment.append(grid);
  const actions = element("div", "button-row");
  actions.append(
    button("Begin investigation", "investigate"),
    button("Decline case", "home", "button secondary"),
  );
  fragment.append(actions);
  return fragment;
}

function renderActionCard(title, detail, action, completed) {
  const card = element("article", "action-card");
  const copy = element("div");
  copy.append(
    element("h3", "", title),
    element("p", "", completed ? "Lead completed." : detail),
  );
  const control = button(
    completed ? "Reviewed" : "Investigate",
    action,
    "button secondary",
  );
  control.disabled = completed || session.actionsLeft === 0;
  card.append(copy, control);
  return card;
}

function renderInvestigation() {
  const caseData = currentCase();
  const fragment = document.createDocumentFragment();
  const header = element("header", "case-header");
  const heading = element("div");
  heading.append(
    element("p", "eyebrow", "Active case"),
    element("h1", "", "Follow the evidence"),
  );
  const meter = element("div", "action-meter");
  meter.setAttribute("aria-label", `${session.actionsLeft} actions remaining`);
  meter.append(
    element("strong", "", String(session.actionsLeft)),
    element("span", "", "actions remaining"),
  );
  header.append(heading, meter);
  fragment.append(header);
  if (notice) fragment.append(element("p", "notice", notice));

  const grid = element("div", "game-grid");
  const leads = element("section", "panel");
  leads.append(element("h2", "", "Investigation leads"));
  const locationTitle = element("h3", "", "Search the studio");
  const locationList = element("div", "action-list");
  locations.forEach((location) => {
    const completed = session.completedActions.includes(
      `location:${location.id}`,
    );
    locationList.append(
      renderActionCard(
        location.name,
        location.detail,
        `search:${location.id}`,
        completed,
      ),
    );
  });
  leads.append(
    locationTitle,
    locationList,
    element("h3", "", "Interview suspects"),
  );
  const interviewList = element("div", "action-list");
  suspects.forEach((suspect) => {
    const completed = session.completedActions.includes(
      `interview:${suspect.id}`,
    );
    interviewList.append(
      renderActionCard(
        suspect.name,
        `Ask the ${suspect.role.toLowerCase()} to account for 10:15–10:20.`,
        `interview:${suspect.id}`,
        completed,
      ),
    );
  });
  leads.append(interviewList);
  const leadActions = element("div", "button-row");
  const hintButton = button(
    session.hintUsed ? "Hint used" : "Request a hint (costs 2)",
    "hint",
    "button secondary",
  );
  hintButton.disabled = session.hintUsed || session.actionsLeft < 2;
  leadActions.append(hintButton, button("Make an accusation", "accuse"));
  leads.append(leadActions);

  const casebook = element("section", "panel casebook");
  casebook.append(
    element("p", "eyebrow", `${session.evidence.length} clues logged`),
    element("h2", "", "Casebook"),
  );
  const evidenceList = element("div", "evidence-list");
  if (!session.evidence.length) {
    evidenceList.append(
      element(
        "p",
        "empty",
        "Your casebook is empty. Follow a lead to collect evidence.",
      ),
    );
  } else {
    [...session.evidence].reverse().forEach((evidence) => {
      const card = element("article", "evidence-card");
      card.append(
        element(
          "p",
          "source",
          evidence.source === "location"
            ? "Scene evidence"
            : "Interview record",
        ),
        element("h3", "", evidence.title),
        element("p", "", evidence.body),
      );
      evidenceList.append(card);
    });
  }
  casebook.append(evidenceList);
  grid.append(leads, casebook);
  fragment.append(grid);
  return fragment;
}

function labeledChoice(type, name, value, title, detail) {
  const label = element("label", "choice");
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.value = value;
  const copy = element("span");
  copy.append(element("strong", "", title));
  if (detail)
    copy.append(document.createElement("br"), document.createTextNode(detail));
  label.append(input, copy);
  return label;
}

function renderAccusation() {
  const fragment = document.createDocumentFragment();
  fragment.append(
    element("p", "eyebrow", "One accusation. Make it count."),
    element("h1", "", "Present your case"),
    element(
      "p",
      "lead",
      "Identify who sabotaged ECHO, why they did it, and the two clues that prove means, opportunity, or intent.",
    ),
  );
  if (error) {
    const message = element("p", "error", error);
    message.id = "form-error";
    message.tabIndex = -1;
    message.setAttribute("role", "alert");
    fragment.append(message);
  }
  const form = element("form", "accusation-form");
  form.id = "accusation-form";
  form.noValidate = true;
  const suspectField = document.createElement("fieldset");
  suspectField.append(element("legend", "", "1. Who sabotaged ECHO?"));
  suspects.forEach((suspect) =>
    suspectField.append(
      labeledChoice("radio", "suspect", suspect.id, suspect.name, suspect.role),
    ),
  );
  const motiveField = document.createElement("fieldset");
  motiveField.append(element("legend", "", "2. What was the motive?"));
  motives.forEach((motive) =>
    motiveField.append(
      labeledChoice("radio", "motive", motive.id, motive.label),
    ),
  );
  const evidenceField = document.createElement("fieldset");
  evidenceField.append(element("legend", "", "3. Which two clues prove it?"));
  if (!session.evidence.length)
    evidenceField.append(element("p", "empty", "You collected no evidence."));
  session.evidence.forEach((evidence) =>
    evidenceField.append(
      labeledChoice(
        "checkbox",
        "evidence",
        evidence.id,
        evidence.title,
        evidence.body,
      ),
    ),
  );
  const actions = element("div", "button-row");
  const submit = element("button", "button", "Submit final accusation");
  submit.type = "submit";
  actions.append(
    submit,
    button("Return to investigation", "return", "button secondary"),
  );
  if (session.actionsLeft === 0) actions.lastElementChild.disabled = true;
  form.append(suspectField, motiveField, evidenceField, actions);
  fragment.append(form);
  return fragment;
}

function renderResult() {
  const caseData = currentCase();
  const result = session.result;
  const culprit = suspects.find((item) => item.id === caseData.culpritId);
  const motive = motives.find((item) => item.id === caseData.motiveId);
  const section = element("section", "panel result");
  section.append(
    element("p", "eyebrow", `${caseData.code} · ${result.rank}`),
    element("h1", "", result.won ? "Case proven." : "Case not proven."),
    element(
      "p",
      result.won ? "success" : "error",
      result.won
        ? `Your accusation holds. Final score: ${result.score}.`
        : `The evidence does not support your accusation. The saboteur was ${culprit.name}.`,
    ),
    element("h2", "", "What happened"),
    element("p", "", caseData.resolution),
    element("h2", "", "Deduction breakdown"),
  );
  const list = element("ul", "breakdown");
  [
    `Culprit: ${result.correctSuspect ? "correct" : `incorrect — ${culprit.name}`}`,
    `Motive: ${result.correctMotive ? "correct" : `incorrect — ${motive.label}`}`,
    `Decisive evidence submitted: ${result.decisiveEvidence} of 2 required`,
    `Actions used: ${result.actionsUsed} of 12`,
    `All three decisive clues found: ${result.allKeyEvidence ? "yes" : "no"}`,
    `Hint used: ${session.hintUsed ? "yes" : "no"}`,
  ].forEach((text) => list.append(element("li", "", text)));
  section.append(list);
  const actions = element("div", "button-row");
  actions.append(
    button("Investigate another variant", "start"),
    button("Return to title", "home", "button secondary"),
  );
  section.append(actions);
  return section;
}

function render(focusMain = false) {
  let content;
  if (screen === "briefing") content = renderBriefing();
  else if (screen === "investigating") content = renderInvestigation();
  else if (screen === "accusing") content = renderAccusation();
  else if (screen === "resolved") content = renderResult();
  else content = renderHome();
  app.replaceChildren(content);
  if (focusMain) app.focus();
}

app.addEventListener("click", (event) => {
  const control = event.target.closest("[data-action]");
  if (!control || control.disabled) return;
  event.preventDefault();
  const [action, targetId] = control.dataset.action.split(":");
  notice = "";
  error = "";
  if (action === "start") startCase();
  else if (action === "home") {
    screen = "home";
    render(true);
  } else if (action === "investigate") {
    screen = "investigating";
    render(true);
    announce("Investigation started. Twelve actions remaining.");
  } else if (action === "search" || action === "interview") {
    const kind = action === "search" ? "location" : "interview";
    const next = performInvestigation(session, currentCase(), kind, targetId);
    if (next !== session) {
      session = next;
      const found = session.evidence.at(-1);
      notice = `Evidence logged: ${found.title}`;
      announce(notice);
      if (session.phase === "accusing") {
        screen = "accusing";
        announce("No actions remain. Present your accusation.");
      }
    }
    render();
  } else if (action === "hint") {
    const outcome = requestHint(session, currentCase());
    session = outcome.session;
    notice = outcome.hint || "";
    if (session.phase === "accusing") screen = "accusing";
    announce(notice);
    render();
  } else if (action === "accuse") {
    session = enterAccusation(session);
    screen = "accusing";
    render(true);
  } else if (action === "return") {
    session = { ...session, phase: "investigating" };
    screen = "investigating";
    render(true);
  } else if (action === "reset") {
    if (window.confirm("Clear all solved cases and best scores?")) {
      progress = { solved: [], bestScores: {} };
      saveProgress();
      render();
      announce("Progress reset.");
    }
  }
});

app.addEventListener("submit", (event) => {
  if (event.target.id !== "accusation-form") return;
  event.preventDefault();
  const data = new FormData(event.target);
  const outcome = evaluateAccusation(session, currentCase(), {
    suspectId: data.get("suspect"),
    motiveId: data.get("motive"),
    evidenceIds: data.getAll("evidence"),
  });
  if (!outcome.ok) {
    error = outcome.error;
    render();
    document.querySelector("#form-error")?.focus();
    return;
  }
  session = outcome.session;
  if (outcome.result.won) {
    if (!progress.solved.includes(session.caseId))
      progress.solved.push(session.caseId);
    progress.bestScores[session.caseId] = Math.max(
      progress.bestScores[session.caseId] || 0,
      outcome.result.score,
    );
    saveProgress();
  }
  screen = "resolved";
  render(true);
  announce(outcome.result.won ? "Case proven." : "Case not proven.");
});

render();
