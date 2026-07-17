export const suspects = [
  {
    id: "mina",
    name: "Mina Park",
    role: "Lead data scientist",
    profile: "Raised formal concerns about consent in ECHO's biometric study.",
  },
  {
    id: "jon",
    name: "Jon Bell",
    role: "Build engineer",
    profile: "Owned the demo build, recovery scripts, and nightly backups.",
  },
  {
    id: "rhea",
    name: "Rhea Vale",
    role: "Executive producer",
    profile:
      "Arranged tomorrow's investor demo and controls the studio contracts.",
  },
  {
    id: "owen",
    name: "Owen Cross",
    role: "Senior playtester",
    profile:
      "Recently learned how much personal data ECHO retained about its testers.",
  },
];

export const motives = [
  { id: "protect", label: "Protect participants from non-consensual data use" },
  { id: "coverup", label: "Hide falsified trial results before the demo" },
  { id: "sale", label: "Sell the only complete dataset to a private buyer" },
  { id: "expose", label: "Take proof of the experiment to the press" },
];

export const locations = [
  {
    id: "control",
    name: "Control Room",
    detail: "Console logs, power records, and the wipe terminal.",
  },
  {
    id: "archive",
    name: "Cold Archive",
    detail: "The locked cradle where the master drive was kept.",
  },
  {
    id: "booth",
    name: "Test Booth",
    detail: "Playtest recordings, telemetry, and a service hatch.",
  },
  {
    id: "breakroom",
    name: "Break Room",
    detail: "Camera stills and the suspects' claimed alibis.",
  },
  {
    id: "office",
    name: "Producer's Office",
    detail: "Contracts, schedules, and courier paperwork.",
  },
];

const shared = {
  control: {
    title: "Local Deletion Report",
    body: "ECHO's live dataset was wiped from the control-room terminal at 10:17. The command was local, not a remote attack.",
  },
  archive: {
    title: "Empty Drive Cradle",
    body: "The encrypted master drive was physically removed at 10:19, two minutes after the wipe began.",
  },
};

export const cases = [
  {
    id: "echo-a",
    code: "ECHO-A",
    culpritId: "mina",
    motiveId: "protect",
    keyEvidenceIds: ["mina-alibi", "mina-phrase", "mina-confrontation"],
    resolution:
      "Mina staged a break-room alibi, used her legitimate archive access, and erased ECHO to keep non-consensual biometric data away from the investors.",
    locationEvidence: {
      control: { id: "local-wipe", ...shared.control },
      archive: {
        id: "mina-badge",
        title: "Archive Badge Event",
        body: "Mina's badge opened the archive at 10:16. Diagnostics show no clone, override, or reader fault.",
      },
      booth: {
        id: "clean-hatch",
        title: "Undisturbed Service Hatch",
        body: "Dust seals around the booth hatch are intact. Nobody crossed through it during the incident.",
      },
      breakroom: {
        id: "mina-alibi",
        title: "Staged Break-Room Alibi",
        body: "A 10:12 still shows Mina placing a mug under the camera. The drink was untouched and cold; later stills show no person.",
      },
      office: {
        id: "mina-phrase",
        title: "Ethics Complaint Draft",
        body: "Mina drafted “NO CONSENT, NO MODEL”—the exact phrase entered into the wipe confirmation at 10:17.",
      },
    },
    interviews: {
      mina: {
        id: "mina-statement",
        title: "Mina's Statement",
        body: "Mina says she entered the break room at 10:12 and remained there until lockdown ended at 10:26.",
      },
      jon: {
        id: "jon-build",
        title: "Jon's Build Log",
        body: "Jon admits a failed build, but signed logs place him compiling continuously until 10:21.",
      },
      rhea: {
        id: "rhea-call",
        title: "Rhea's Investor Call",
        body: "A recorded call places Rhea in the conference room throughout the wipe.",
      },
      owen: {
        id: "owen-session",
        title: "Owen's Session",
        body: "Owen's controller stream is continuous and physically signed by the booth console.",
      },
    },
    timeline: {
      "local-wipe": { start: "22:17", status: "verified" },
      "mina-badge": { start: "22:16", status: "verified" },
      "clean-hatch": { start: "22:05", end: "22:26", status: "verified" },
      "mina-alibi": { start: "22:12", end: "22:26", status: "verified" },
      "mina-phrase": { start: "22:10", status: "verified" },
      "mina-statement": { start: "22:12", end: "22:26", status: "claimed" },
      "jon-build": { start: "22:05", end: "22:21", status: "verified" },
      "rhea-call": { start: "22:13", end: "22:20", status: "verified" },
      "owen-session": { start: "22:09", end: "22:20", status: "verified" },
    },
    contradiction: {
      id: "mina-breakroom-alibi",
      suspectId: "mina",
      prerequisiteIds: ["mina-statement", "mina-alibi"],
      title: "The break-room alibi is staged",
      body: "Mina says she remained in the break room, but the camera recorded only a mug after 10:12.",
      prompt:
        "You said you never left the break room. Where were you at 10:16?",
      confrontation: {
        id: "mina-confrontation",
        title: "Mina Breaks Her Alibi",
        body: "Mina admits leaving the mug for the camera, opening the archive at 10:16, and removing the drive to keep the biometric model from being restored.",
        timeline: { start: "22:16", end: "22:19", status: "admitted" },
      },
    },
  },
  {
    id: "echo-b",
    code: "ECHO-B",
    culpritId: "jon",
    motiveId: "coverup",
    keyEvidenceIds: ["jon-script", "jon-ledger", "jon-confrontation"],
    resolution:
      "Jon copied successful values from an old trial. When the demo threatened to expose the fraud, he wiped the dataset and removed its only clean backup.",
    locationEvidence: {
      control: {
        id: "jon-script",
        title: "Signed Utility and Uptime Record",
        body: "The wipe utility was compiled and signed by Jon's account at 10:08. UPS and uptime records run continuously through the incident; no reboot occurred.",
      },
      archive: { id: "empty-cradle", ...shared.archive },
      booth: {
        id: "jon-ledger",
        title: "Altered Run Ledger",
        body: "The successful trial values were copied from an earlier run. The edit originated from Jon's maintenance terminal.",
      },
      breakroom: {
        id: "mina-meeting",
        title: "Ethics Meeting Record",
        body: "Mina was on a recorded call with the study's independent ethics adviser from 10:14 to 10:22.",
      },
      office: {
        id: "failed-demo",
        title: "Demo Quality Report",
        body: "Jon received notice at 10:06 that tomorrow's live run would reveal discrepancies in his reported results.",
      },
    },
    interviews: {
      mina: {
        id: "mina-objection",
        title: "Mina's Statement",
        body: "Mina confirms she opposed the study but wanted a documented suspension, not destroyed evidence.",
      },
      jon: {
        id: "jon-reboot",
        title: "Jon's Reboot Claim",
        body: "Jon says a failed build forced him to reboot the server at 10:17 and that he remained at its console until it completed.",
      },
      rhea: {
        id: "rhea-demo",
        title: "Rhea's Statement",
        body: "Rhea was rehearsing the pitch on a conference recording when the drive vanished.",
      },
      owen: {
        id: "owen-camera",
        title: "Owen's Statement",
        body: "The booth camera and controller stream both show Owen testing through 10:20.",
      },
    },
    timeline: {
      "jon-script": { start: "22:08", status: "verified" },
      "empty-cradle": { start: "22:19", status: "verified" },
      "jon-ledger": { start: "22:11", status: "verified" },
      "mina-meeting": { start: "22:14", end: "22:22", status: "verified" },
      "failed-demo": { start: "22:06", status: "verified" },
      "mina-objection": { start: "22:14", end: "22:22", status: "verified" },
      "jon-reboot": { start: "22:17", status: "claimed" },
      "rhea-demo": { start: "22:11", end: "22:24", status: "verified" },
      "owen-camera": { start: "22:09", end: "22:20", status: "verified" },
    },
    contradiction: {
      id: "jon-impossible-reboot",
      suspectId: "jon",
      prerequisiteIds: ["jon-reboot", "jon-script"],
      title: "The server never rebooted",
      body: "Jon claims he stayed at a rebooting server, but uninterrupted uptime proves that reboot never happened.",
      prompt:
        "The server never restarted. What were you actually doing at 10:17?",
      confrontation: {
        id: "jon-confrontation",
        title: "Jon Admits the Maintenance Session",
        body: "Jon admits using the maintenance session to run his signed wipe utility and taking the clean master before a live comparison exposed his altered results.",
        timeline: { start: "22:17", end: "22:19", status: "admitted" },
      },
    },
  },
  {
    id: "echo-c",
    code: "ECHO-C",
    culpritId: "rhea",
    motiveId: "sale",
    keyEvidenceIds: ["rhea-key", "rhea-contract", "rhea-confrontation"],
    resolution:
      "Rhea used her mechanical override to avoid the badge log, wiped the live copy, and planned to hand the unique master drive to a buyer after lockdown.",
    locationEvidence: {
      control: { id: "local-wipe", ...shared.control },
      archive: {
        id: "rhea-key",
        title: "Graphite in the Override",
        body: "Fresh graphite in the archive bypass matches Rhea's newly filed master key. The mechanical entry produced no badge log.",
      },
      booth: {
        id: "normal-session",
        title: "Verified Playtest Stream",
        body: "Owen's biometric and controller streams agree continuously from 10:09 until lockdown.",
      },
      breakroom: {
        id: "jon-medical",
        title: "First-Aid Record",
        body: "Jon was treating a solder burn with Mina from 10:15 to 10:20; the cabinet recorded both badges.",
      },
      office: {
        id: "rhea-contract",
        title: "Buyer Addendum",
        body: "A hidden contract promises Rhea payment on delivery of a drive with the missing master's exact serial number.",
      },
    },
    interviews: {
      mina: {
        id: "mina-key",
        title: "Mina's Statement",
        body: "Mina confirms only Rhea keeps the mechanical archive override outside the security office.",
      },
      jon: {
        id: "jon-burn",
        title: "Jon's Statement",
        body: "Jon's bandaged hand and cabinet log support his first-aid alibi.",
      },
      rhea: {
        id: "rhea-courier",
        title: "Rhea's Statement",
        body: "Rhea says she has no buyer and arranged no pickup for ECHO's master drive during lockdown.",
      },
      owen: {
        id: "owen-grievance",
        title: "Owen's Statement",
        body: "Owen threatened to expose ECHO, but his full session recording has no gaps or loops.",
      },
    },
    timeline: {
      "local-wipe": { start: "22:17", status: "verified" },
      "rhea-key": { start: "22:18", status: "inferred" },
      "normal-session": { start: "22:09", end: "22:20", status: "verified" },
      "jon-medical": { start: "22:15", end: "22:20", status: "verified" },
      "rhea-contract": { start: "22:08", status: "verified" },
      "mina-key": { start: "22:18", status: "inferred" },
      "jon-burn": { start: "22:15", end: "22:20", status: "verified" },
      "rhea-courier": { start: "22:05", end: "22:26", status: "claimed" },
      "owen-grievance": { start: "22:09", end: "22:20", status: "verified" },
    },
    contradiction: {
      id: "rhea-buyer-denial",
      suspectId: "rhea",
      prerequisiteIds: ["rhea-courier", "rhea-contract"],
      title: "The buyer denial is false",
      body: "Rhea denies having a buyer, but the addendum pays her for delivering this exact drive.",
      prompt:
        "If there is no buyer, why did you print this delivery contract at 10:08?",
      confrontation: {
        id: "rhea-confrontation",
        title: "Alias Courier Booking",
        body: "The contract's delivery code exposes a concealed 10:26 curbside pickup under Rhea's conference alias, marked “encrypted media.”",
        timeline: { start: "22:23", end: "22:26", status: "verified" },
      },
    },
  },
  {
    id: "echo-d",
    code: "ECHO-D",
    culpritId: "owen",
    motiveId: "expose",
    keyEvidenceIds: ["owen-loop", "owen-dust", "owen-confrontation"],
    resolution:
      "Owen looped his test recording, crossed through the service hatch, and took the master drive as physical proof for journalists.",
    locationEvidence: {
      control: { id: "local-wipe", ...shared.control },
      archive: {
        id: "owen-dust",
        title: "Service-Hatch Dust",
        body: "Archive insulation dust is ground into Owen's shoes. A studio plan in his bag marks the booth-to-archive route.",
      },
      booth: {
        id: "owen-loop",
        title: "Looped Playtest",
        body: "Owen's supposedly continuous recording repeats the exact same input checksum every 90 seconds. It is a playback loop.",
      },
      breakroom: {
        id: "mina-jon",
        title: "Corroborated Conversation",
        body: "Break-room audio places Mina and Jon arguing about consent from 10:15 through 10:21.",
      },
      office: {
        id: "owen-press",
        title: "Embargoed Press Draft",
        body: "Owen's scheduled message promises journalists the physical ECHO drive as proof—not screenshots or allegations.",
      },
    },
    interviews: {
      mina: {
        id: "mina-argument",
        title: "Mina's Statement",
        body: "Mina says Jon joined her in the break room before the incident; room audio confirms it.",
      },
      jon: {
        id: "jon-argument",
        title: "Jon's Statement",
        body: "Jon admits arguing with Mina and provides an audio timestamp matching her account.",
      },
      rhea: {
        id: "rhea-recording",
        title: "Rhea's Statement",
        body: "Rhea's investor rehearsal was recorded continuously from 10:11 to 10:24.",
      },
      owen: {
        id: "owen-denial",
        title: "Owen's Statement",
        body: "Owen insists he never left the booth and points to his continuous recording as proof.",
      },
    },
    timeline: {
      "local-wipe": { start: "22:17", status: "verified" },
      "owen-dust": { start: "22:18", end: "22:19", status: "inferred" },
      "owen-loop": { start: "22:13", end: "22:20", status: "verified" },
      "mina-jon": { start: "22:15", end: "22:21", status: "verified" },
      "owen-press": { start: "22:10", status: "verified" },
      "mina-argument": { start: "22:15", end: "22:21", status: "verified" },
      "jon-argument": { start: "22:15", end: "22:21", status: "verified" },
      "rhea-recording": { start: "22:11", end: "22:24", status: "verified" },
      "owen-denial": { start: "22:09", end: "22:20", status: "claimed" },
    },
    contradiction: {
      id: "owen-looped-alibi",
      suspectId: "owen",
      prerequisiteIds: ["owen-denial", "owen-loop"],
      title: "The booth alibi is a recording loop",
      body: "Owen cites a continuous playtest as proof, but its repeating checksum shows it was playback.",
      prompt:
        "Your controller checksum repeats every 90 seconds. Where did you go?",
      confrontation: {
        id: "owen-confrontation",
        title: "Owen Admits the Hatch Route",
        body: "Owen admits starting the loop at 10:13, crossing the service hatch, and reaching the archive before the drive came free at 10:19.",
        timeline: { start: "22:13", end: "22:19", status: "admitted" },
      },
    },
  },
];

export const casesById = Object.fromEntries(
  cases.map((caseData) => [caseData.id, caseData]),
);
