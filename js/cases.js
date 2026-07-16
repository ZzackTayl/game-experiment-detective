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
    keyEvidenceIds: ["mina-badge", "mina-alibi", "mina-phrase"],
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
        body: "Mina says she remained in the break room from 10:12 until lockdown.",
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
  },
  {
    id: "echo-b",
    code: "ECHO-B",
    culpritId: "jon",
    motiveId: "coverup",
    keyEvidenceIds: ["jon-script", "jon-reboot", "jon-ledger"],
    resolution:
      "Jon copied successful values from an old trial. When the demo threatened to expose the fraud, he wiped the dataset and removed its only clean backup.",
    locationEvidence: {
      control: {
        id: "jon-script",
        title: "Signed Recovery Script",
        body: "The wipe utility was compiled and cryptographically signed by Jon's build account at 9:48 tonight.",
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
        body: "Jon received notice at 9:35 that tomorrow's live run would reveal discrepancies in his reported results.",
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
        title: "Impossible Reboot",
        body: "Jon claims he rebooted the build server at 10:17. UPS and uptime records prove no reboot occurred.",
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
  },
  {
    id: "echo-c",
    code: "ECHO-C",
    culpritId: "rhea",
    motiveId: "sale",
    keyEvidenceIds: ["rhea-key", "rhea-contract", "rhea-courier"],
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
        title: "Courier Booking",
        body: "Rhea denies planning a delivery, but a 10:30 pickup under her conference alias lists “encrypted media.”",
      },
      owen: {
        id: "owen-grievance",
        title: "Owen's Statement",
        body: "Owen threatened to expose ECHO, but his full session recording has no gaps or loops.",
      },
    },
  },
  {
    id: "echo-d",
    code: "ECHO-D",
    culpritId: "owen",
    motiveId: "expose",
    keyEvidenceIds: ["owen-loop", "owen-dust", "owen-press"],
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
  },
];

export const casesById = Object.fromEntries(
  cases.map((caseData) => [caseData.id, caseData]),
);
