export const caseData = {
  id: "the-bell-that-drowned",
  version: 1,
  title: "The Bell That Drowned",
  eyebrow: "A Morrowtide Light mystery",
  summary:
    "At 23:40, the lighthouse bell sounds and Lucian Wake is found soaked beneath a dry lens. Four people are stranded inside Morrowtide Light, and every one of them is protecting a dangerous secret.",
  briefing: [
    "Morrowtide Light stands cut off by rain, its chapel below and lantern room above. At 23:40, one iron note shakes the tower.",
    "Lucian Wake lies under the spotless lens, streaming water onto dry brass. Four people had reason to fear what he knew, and each carries a suspicious secret.",
    "Establish where and when Lucian died, learn how the bell lied, and name the person who moved him.",
  ],
  objective:
    "Select evidence that proves the true time and place of death, the culprit's presence, the staged bell, and the lure that supplied motive and method.",
  phases: [
    {
      id: "one",
      label: "Phase I",
      title: "The Dry Lens",
      description:
        "Read the lantern room before the suspects give the bell a meaning it never had.",
    },
    {
      id: "two",
      label: "Phase II",
      title: "What the Water Kept",
      description:
        "Follow the water downhill and test every convenient accusation.",
    },
    {
      id: "three",
      label: "Phase III",
      title: "The Honest Machine",
      description:
        "Set human stories against mechanical facts and the marks left in stone.",
    },
  ],
  suspects: [
    {
      id: "ada-rook",
      name: "Ada Rook",
      role: "Deputy keeper and quartermaster",
      initials: "AR",
      summary:
        "Exacting and capable, Ada controls the lamp stores, supply books, and most keys in the tower.",
      motive:
        "Lucian was auditing a black salvage ledger that exposed Ada's sale of wreck goods and falsified crew shares.",
    },
    {
      id: "finn-merrow",
      name: "Finn Merrow",
      role: "Ferryman and rigger",
      initials: "FM",
      summary:
        "Finn fought publicly with Lucian and owns the oilskin whose marked cloth appears beside the body.",
      motive:
        "Lucian withheld Finn's salvage pay after accusing him of cutting cargo loose before it was declared.",
    },
    {
      id: "inez-quill",
      name: "Dr Inez Quill",
      role: "Island physician",
      initials: "IQ",
      summary:
        "Inez keeps the sedative found in Lucian's blood and cannot account for one missing ampoule.",
      motive:
        "Lucian threatened to report her informal medicine stores and end the clinic's mainland exemption.",
    },
    {
      id: "orrin-vale",
      name: "Orrin Vale",
      role: "Lighthouse engineer",
      initials: "OV",
      summary:
        "Orrin maintains the bell and concealed an illegal timer capable of ringing it without a hand on the rope.",
      motive:
        "Exposure of the timer would cost Orrin his license and prove he had falsified required night watches.",
    },
  ],
  evidence: [
    {
      id: "lantern-room-body",
      phase: "one",
      code: "E-01",
      title: "The Body Beneath the Lens",
      type: "Scene",
      time: "23:40",
      summary:
        "Lucian is drenched, but the lens, stair rail, and lantern-room threshold are dry.",
      detail:
        "Fresh water pools only beneath him. His coat carries pale mortar grit and a crushed strand of chapel moss, while the brass around the lens shows no struggle.",
      implication:
        "Lucian died elsewhere and was placed beneath the lens to make the bell seem connected to his death.",
    },
    {
      id: "stopped-watch",
      phase: "one",
      code: "E-02",
      title: "A Watch Full of Water",
      type: "Object",
      time: "23:28",
      summary:
        "Lucian's cracked watch stopped at 23:28 with fresh water sealed inside its case.",
      detail:
        "The impact dent matches the cistern's squared coping, and the trapped water carries its soot, lime, and moss signature. The spring seized while submerged.",
      implication:
        "Lucian entered the chapel cistern at 23:28, making the later lantern-room discovery and 23:40 bell part of a staged chronology.",
    },
    {
      id: "oilskin-initials",
      phase: "one",
      code: "E-03",
      title: "F.M. in Blue Thread",
      type: "Fabric",
      time: "Unknown",
      summary:
        "A strip of yellow oilskin embroidered F.M. is clenched loosely in Lucian's hand.",
      detail:
        "The edge is a straight knife cut, not a tear from a fight, and the cloth lacks blood, skin, or cistern grit. Finn's coat had hung unattended in the boathouse.",
      implication:
        "The initials point at Finn, but the clean, uncontaminated strip is planted rather than won in a struggle.",
    },
    {
      id: "rainwater-lungs",
      phase: "two",
      code: "E-04",
      title: "Rain in the Lungs",
      type: "Postmortem",
      time: "23:28–23:31",
      summary:
        "Lucian inhaled cold rainwater carrying chapel moss spores and lime from old mortar.",
      detail:
        "The chapel cistern contains the same spores, lime ratio, and gutter soot. Water temperature, digestion, and early changes constrain the drowning to 23:27–23:31.",
      implication:
        "Lucian drowned alive in the chapel cistern roughly twelve minutes before the bell, then was carried upstairs.",
    },
    {
      id: "cistern-floor",
      phase: "two",
      code: "E-05",
      title: "Scuffs at the Cistern",
      type: "Trace",
      time: "23:20–23:32",
      summary:
        "Wet heel marks approach the cistern; broad drag smears leave it toward the service hoist.",
      detail:
        "One right heel print has an empty trapezoid in its tread. A matching black lug is embedded in newly softened mortar below the coping.",
      implication:
        "The killer braced against the cistern, lost part of a boot heel, and moved Lucian by the maintenance route.",
    },
    {
      id: "bell-without-a-hand",
      phase: "two",
      code: "E-06",
      title: "The Bell Without a Hand",
      type: "Mechanism",
      time: "23:40",
      summary:
        "The bell rope's dust is unbroken even though witnesses heard a single full strike.",
      detail:
        "The rope clapper was never pulled. A clock-linked second striker bears the fresh contact mark, and its cam released at exactly 23:40.",
      implication:
        "The automatic strike was predictable, so the body was placed to make a scheduled sound announce a false time and scene of death.",
    },
    {
      id: "missing-sedative",
      phase: "two",
      code: "E-07",
      title: "The Empty Ampoule Slot",
      type: "Medical",
      time: "Before 23:20",
      summary:
        "A measured dose of Inez's sedative is in Lucian's blood, and one ampoule is missing from her field case.",
      detail:
        "The dose would leave him conscious but weak. Inez's inventory seal is intact; the ampoules sit in an unlocked inner tray that Ada handled while delivering clinic stores.",
      implication:
        "The drug made Lucian easier to drown and frames Inez, but access to her case was not exclusive.",
    },
    {
      id: "honest-machines",
      phase: "three",
      code: "E-08",
      title: "Honest Machines",
      type: "Mechanical record",
      time: "23:40",
      summary:
        "Orrin's concealed clockwork cam was set days earlier to strike the bell automatically at 23:40.",
      detail:
        "The sealed escapement completed its cycle exactly once and could not alter its own schedule. Orrin hid the illegal device, but its wear record confirms the strike was automatic.",
      implication:
        "Orrin lied to protect his license, not to conceal a hand on the rope. Someone who knew his timer staged the body before its predictable strike.",
    },
    {
      id: "missing-heel-lug",
      phase: "three",
      code: "E-09",
      title: "The Missing Heel Lug",
      type: "Footwear",
      time: "23:28",
      summary:
        "Ada's right boot is missing the same uncommon trapezoid lug found under the cistern lip.",
      detail:
        "The torn socket carries wet chapel lime, and the recovered lug fits it edge for edge. The other suspects' soles are complete and do not match the approach prints.",
      implication:
        "Ada was braced at the cistern during the drowning despite insisting she never entered the chapel.",
    },
    {
      id: "lure-note",
      phase: "three",
      code: "E-10",
      title: "Come Alone",
      type: "Document",
      time: "23:15",
      summary:
        "A note sent Lucian to the chapel with the black salvage ledger and promised the missing accounts.",
      detail:
        "Its paper tears perfectly from Ada's quartermaster book. Pressure marks on the page beneath her desk copy the opening words: “Below the chapel. Come alone.”",
      implication:
        "Ada arranged the private cistern meeting because Lucian's ledger proved her theft; the note supplied both lure and motive.",
    },
  ],
  statements: [
    {
      id: "ada-one",
      phase: "one",
      suspectId: "ada-rook",
      quote:
        "I counted lamp oil from eleven-ten until the bell. I never went below the tower, and I found Lucian only after the strike.",
      analysis:
        "The store count has no witness. Her absolute denial of entering the chapel can be tested against its traces.",
    },
    {
      id: "finn-one",
      phase: "one",
      suspectId: "finn-merrow",
      quote:
        "Yes, we quarreled. No, he did not tear my coat. It was on its peg in the boathouse while I reset the south mooring.",
      analysis:
        "Finn admits a motive, but the oilskin's cut edge supports his claim that it was removed elsewhere.",
    },
    {
      id: "inez-one",
      phase: "one",
      suspectId: "inez-quill",
      quote:
        "Lucian was tense at supper, not ill. I gave him nothing. Orrin was my only patient tonight.",
      analysis:
        "Inez separates medical access from administration; her stock record must decide whether the distinction matters.",
    },
    {
      id: "orrin-one",
      phase: "one",
      suspectId: "orrin-vale",
      quote:
        "A bell sounds because someone pulls it. I was in the engine room when this one spoke.",
      analysis:
        "Orrin's alibi may hold, but his claim about the bell is knowingly incomplete.",
    },
    {
      id: "ada-two",
      phase: "two",
      suspectId: "ada-rook",
      quote:
        "I saw Lucian cross the upper gallery near eleven-thirty-five, dry and walking quickly. His watch must have failed early.",
      analysis:
        "The matched cistern water and submerged watch make this sighting impossible; Ada is trying to move death toward the bell.",
    },
    {
      id: "finn-two",
      phase: "two",
      suspectId: "finn-merrow",
      quote:
        "Ada asked me before eleven whether the chapel side door still caught in rain. I thought she was checking storm access.",
      analysis:
        "The question gives Ada practical interest in an unwitnessed route between the cistern and service hoist.",
    },
    {
      id: "inez-two",
      phase: "two",
      suspectId: "inez-quill",
      quote:
        "The missing dose is mine, but Ada unpacked my lamp oil and bandages beside the open case at ten-fifty.",
      analysis:
        "The sedative implicates Inez by ownership, while her account gives Ada a quiet chance to steal it.",
    },
    {
      id: "orrin-two",
      phase: "two",
      suspectId: "orrin-vale",
      quote:
        "There is a clock striker. I built it to cover storm rounds and set it for eleven-forty days ago. I hid it because it is forbidden.",
      analysis:
        "Orrin's concealed misconduct explains his first lie. The sealed timer can confirm or refute the rest.",
    },
    {
      id: "ada-three",
      phase: "three",
      suspectId: "ada-rook",
      quote:
        "That piece left my heel on the jetty last week. Finn knows the black ledger too; he could have made that note.",
      analysis:
        "Fresh chapel lime in the torn socket and the note's matching paper and pressure marks refute both deflections.",
    },
    {
      id: "finn-three",
      phase: "three",
      suspectId: "finn-merrow",
      quote:
        "Ada borrowed my oilskin at ten to wrap spare lamp wicks. When she returned it, a strip near the hem was gone.",
      analysis:
        "Finn's cloth was available to Ada before the murder and functions as a deliberate red herring.",
    },
    {
      id: "inez-three",
      phase: "three",
      suspectId: "inez-quill",
      quote:
        "That dose weakens; it does not drown. Ada signed every clinic delivery and knew exactly where the ampoules sat.",
      analysis:
        "The stolen sedative is Ada's aid to the drowning and a second red herring aimed at Inez.",
    },
    {
      id: "orrin-three",
      phase: "three",
      suspectId: "orrin-vale",
      quote:
        "Ada watched me test the timer last Tuesday. She asked whether the bell would sound if the rope stayed untouched.",
      analysis:
        "Orrin supplied the hidden opportunity without joining the crime; Ada knew the exact sound and time she could exploit.",
    },
  ],
  hints: [
    {
      id: "hint-one",
      title: "Do Not Begin With the Bell",
      text: "Compare the dry lantern room with the water inside Lucian's watch and lungs. Ask which fact marks death and which merely marks discovery.",
    },
    {
      id: "hint-two",
      title: "Let the Machine Testify",
      text: "The untouched rope and sealed timer tell one consistent story. Orrin's lie protects a secret, but not necessarily a murder.",
    },
    {
      id: "hint-three",
      title: "Stone, Sole, and Paper",
      text: "Fit the cistern's loose lug to a suspect's boot, then trace the lure note back to the book it left.",
    },
  ],
  solution: {
    culpritId: "ada-rook",
    requiredEvidenceGroups: [
      ["stopped-watch", "rainwater-lungs"],
      ["missing-heel-lug"],
      ["bell-without-a-hand", "honest-machines"],
      ["lure-note"],
    ],
    headline: "Ada Rook made a scheduled bell announce a staged death.",
    rationale:
      "The waterlogged watch and matched rainwater place Lucian's drowning in the chapel cistern at about 23:28, twelve minutes before the bell. Ada's missing heel lug fits the piece trapped beneath the cistern lip, proving she was there despite her denial. The dusty rope, hidden striker, and sealed timer show that the 23:40 bell was Orrin's automatic mechanism, which Ada knew about and used as a false time marker after moving Lucian beneath the dry lens. The lure note came from Ada's own quartermaster book and summoned Lucian with the salvage ledger that exposed her theft. Finn's clean-cut oilskin was planted in Lucian's hand, Inez's sedative was stolen to weaken him, and Orrin's illegal timer was exploited; each secret is a red herring, but none survives the physical sequence.",
    confession:
      "He would have opened the ledger at dawn and taken everything from me. I sent him below, put Quill's dose in his tea, and held him under until the watch struck stone. Finn's cloth was meant to end the questions. I knew Orrin's bell would speak at eleven-forty, so I gave it a body to speak for.",
    timeline: [
      {
        time: "22:50",
        event:
          "While delivering clinic stores, Ada steals one sedative ampoule from Inez's open field case.",
      },
      {
        time: "23:15",
        event:
          "Ada sends Lucian a note torn from her quartermaster book, promising missing salvage accounts below the chapel.",
      },
      {
        time: "23:20",
        event:
          "Lucian arrives weak from the sedative and carrying the black salvage ledger.",
      },
      {
        time: "23:28",
        event:
          "Ada drowns Lucian in the rain-fed cistern; his watch strikes the coping, floods, and stops.",
      },
      {
        time: "23:31",
        event:
          "Ada loses a heel lug in the cistern mortar and moves Lucian toward the service hoist.",
      },
      {
        time: "23:36",
        event:
          "She lays him beneath the dry lens and plants the strip cut from Finn's oilskin.",
      },
      {
        time: "23:40",
        event:
          "Orrin's pre-set timer strikes the bell. Ada uses the sound to trigger discovery and falsely anchor the death.",
      },
    ],
  },
};
