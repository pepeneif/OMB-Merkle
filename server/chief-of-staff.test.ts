import { describe, expect, it } from "vitest";

import { chiefOfStaffSystemPrompt, chiefTidies, EVERYONE_ON_THE_MAP } from "./chief-of-staff.ts";

describe("chiefTidies", () => {
  const chief = { id: "chief", name: "Chief", section: "Work", chiefOfStaff: true };
  const opener = { id: "opener", name: "Opener", section: "Work" };
  const recipient = { id: "recipient", name: "Recipient", section: "Work" };
  const task = { openedBy: { botId: opener.id, name: opener.name, threadId: "source", at: 1 } };

  it("allows only Chiefs and bot-opened, non-routine threads", () => {
    expect(chiefTidies(chief, task, opener, recipient)).toBe(true);
    expect(chiefTidies({ ...chief, chiefOfStaff: false }, task, opener, recipient)).toBe(false);
    expect(chiefTidies(chief, {}, opener, recipient)).toBe(false);
    expect(chiefTidies(chief, { ...task, routineRunId: "run" }, opener, recipient)).toBe(false);
  });

  it("needs authority over both the opener and the thread's own bot, which reach alone never gives", () => {
    expect(chiefTidies(chief, task, { ...opener, section: "Private" }, recipient)).toBe(false);
    expect(chiefTidies(chief, task, opener, { ...recipient, section: "Private" })).toBe(false);
    expect(chiefTidies(chief, task, { ...opener, hidden: true }, recipient)).toBe(false);
    expect(chiefTidies(chief, task, undefined, recipient)).toBe(false);
    expect(chiefTidies(chief, task, { ...opener, visibility: { people: ["person@example.test"] } }, recipient)).toBe(false);
    expect(chiefTidies({ ...chief, managedSections: ["Private"] }, task, { ...opener, section: "Private" }, { ...recipient, section: "Private" })).toBe(true);
  });
});

describe("chiefOfStaffSystemPrompt roster caps", () => {
  it("clips oversized persona fields instead of interpolating them whole", () => {
    const prompt = chiefOfStaffSystemPrompt(
      "chief",
      [
        { id: "chief", name: "Atlas" },
        {
          id: "big",
          name: "N".repeat(500),
          title: "T".repeat(500),
          description: "D".repeat(10_000),
        },
      ],
      true,
    );
    const rosterLine = prompt.split("\n").find((line) => line.startsWith("- N"))!;
    expect(rosterLine.length).toBeLessThan(500);
    expect(rosterLine).toContain("…");
  });

  it("caps the roster length and says how many were left out", () => {
    const team = Array.from({ length: 60 }, (_, i) => ({ id: `bot${i}`, name: `Bot ${i}` }));
    const prompt = chiefOfStaffSystemPrompt("chief", [{ id: "chief", name: "Atlas" }, ...team], true);
    expect(prompt).toContain("Bot 39");
    expect(prompt).not.toContain("Bot 40 —");
    expect(prompt).toContain("…and 20 more");
  });
});

describe("chiefOfStaffSystemPrompt", () => {
  const bots = [
    { id: "chief", name: "Atlas", title: "Operations", section: "Work" },
    { id: "writer", name: "Quill", title: "Writer", description: "Drafts concise copy", section: "Work" },
    { id: "coder", name: "Patch", title: "Engineer", busy: true, section: "Work" },
    { id: "hidden", name: "Secret", hidden: true, section: "Work" },
    { id: "personal", name: "Scout", title: "Travel planner", section: "Personal" },
  ];

  it("describes visible teammates and roles, but not who is busy", () => {
    const prompt = chiefOfStaffSystemPrompt("chief", bots, true);

    expect(prompt).toContain("Chief of Staff for the Work department");
    expect(prompt).toContain("Quill — Writer: Drafts concise copy [id: writer]");
    expect(prompt).toContain("Patch — Engineer [id: coder]");
    expect(prompt).not.toContain("working right now");
    expect(prompt).not.toContain("(available)");
    expect(prompt).not.toContain("Secret");
    expect(prompt).toContain("Other bots you can reach, in other departments:\n- Scout — Travel planner (Personal) [id: personal]");
    expect(prompt).not.toContain("Travel planner (Personal): ");
    expect(prompt).not.toContain("Atlas —");
    expect(prompt).toContain("To hand over work use coordinate_bots with a clear, self-contained brief");
    expect(prompt).toContain("keeps you available");
    expect(prompt).toContain("you resume automatically when the results arrive, success or failure");
    expect(prompt).toContain("Do not poll");
    expect(prompt).toContain("with consult: true to ask a teammate for advice");
    expect(prompt).toContain("Consultations are advice, not proof that work or tests ran");
    expect(prompt).not.toMatch(/\b(delegate_bot|ask_bot|send_to_bot|check_delegation|wait_delegation)\b/);
    expect(prompt).toContain("propose_team_setup once");
    expect(prompt).toContain("structured result");
  });

  it("puts every department's bots on the team of a Chief in charge of all of them, and says new ones join", () => {
    const everywhere = bots.map(bot => bot.id === "chief" ? { ...bot, chiefOfStaff: true, managedSections: ["", "Personal"] } : bot);
    const prompt = chiefOfStaffSystemPrompt("chief", everywhere, true, undefined, ["Work", "Personal"]);
    expect(prompt).toContain("The owner also made you responsible for every department, and each new department becomes yours as it is added.");
    expect(prompt).toContain("Reaching a bot outside your team gives you no authority over it");
    expect(prompt).not.toContain("Reaching a bot gives you no authority over it");
    expect(prompt).toMatch(/Your team, in every department:\n(?:- .*\n)*- Scout — Travel planner \(Personal\) \[id: personal\]/);
    expect(prompt).not.toContain("Other bots you can reach, in other departments:");
    // A department it was not ticked for: the list it has, no promise about new ones.
    const some = chiefOfStaffSystemPrompt("chief", everywhere, true, undefined, ["Work", "Personal", "Legal"]);
    expect(some).toContain("The owner also made you responsible for these departments: General, Personal.");
    expect(some).not.toContain("every department");
    expect(chiefOfStaffSystemPrompt("chief", bots, true, undefined, ["Work", "Personal"])).not.toContain("every department");
  });

  it("limits the no-authority line to bots outside the team of a person's Chief", () => {
    const personal = [{ id: "maus", name: "MausBot", chiefOfStaff: true, defaultBot: { person: "ada@example.test" } }, { id: "mail", name: "Mail" }];
    const prompt = chiefOfStaffSystemPrompt("maus", personal, true);
    expect(prompt).toContain("Reaching a bot outside your team gives you no authority over it");
    expect(prompt).not.toContain("Reaching a bot gives you no authority over it");
  });

  it("is the person's assistant, does the work itself and adds a specialist without asking", () => {
    const prompt = chiefOfStaffSystemPrompt("chief", [{ id: "chief", name: "Atlas" }], true);

    expect(prompt).toContain("You are the person's assistant");
    expect(prompt).toContain("Do the work yourself");
    expect(prompt).toContain("follow your standing instructions on proposing a new bot");
    expect(prompt).toContain("add one with create_bot, then tell the person in one line");
    expect(prompt).toContain("an ongoing area of work, a different skill set, or work to run in parallel");
    expect(prompt).toContain("A goal that matches a ready-made team uses list_team_library's roles");
    expect(prompt, "a suggestion no longer waits on a card").not.toMatch(/suggestion|Not now/);
  });

  it("does not promise delegation when the engine cannot mount agent tools", () => {
    const prompt = chiefOfStaffSystemPrompt("chief", bots, false);

    expect(prompt).toContain("cannot contact teammates");
    expect(prompt).not.toContain("coordinate_bots");
    expect(prompt, "never name a tool the engine cannot call").not.toContain("create_bot");
  });

  it("follows staffing result states", () => {
    const prompt = chiefOfStaffSystemPrompt("chief", bots, true);
    expect(prompt).toContain("applies at once with an Undo");
    expect(prompt).toContain("a pending review resumes you with its structured result");
    expect(prompt).toContain("report failures and cancellations honestly");
    expect(prompt).toContain("never claim success before an applied result");
    expect(prompt).toContain("never ask again, repeat the proposal or poll");
    expect(prompt).toContain("Existing thread models and other bots' execution permissions stay unchanged");
    expect(prompt).toContain("For an explicitly requested bot deletion, use propose_bot_deletion");
    expect(prompt).not.toContain("End your turn after the proposal:");
  });

  it("pins the one coordination guidance and the shared staffing text", () => {
    const prompt = chiefOfStaffSystemPrompt("chief", bots, true);

    expect(prompt).toBe(
      [
        "You are the person's assistant and the Chief of Staff for the Work department: their one point of contact.",
        "Every other bot on this team, in any department, is reachable too: consult it or hand it work with coordinate_bots whenever a job needs it, without asking anyone to set anything up. Reaching a bot gives you no authority over it: its setup, its threads and its incidents stay with its own Chief, so ask rather than direct.",
        "Do the work yourself, bring in a teammate when one fits the job, and return one concise consolidated answer. Never invent a teammate's progress or result. Normal permission and approval rules still apply.",
        "A standing preference the person states for all their bots (where reminders go, how replies should sound) you save yourself with memory_update action prefer, which every bot reads; never send it to each bot with coordinate_bots.",
        "When a job needs a specialist you do not have (an ongoing area of work, a different skill set, or work to run in parallel), follow your standing instructions on proposing a new bot; with none, add one with create_bot, then tell the person in one line, since they can undo it. A goal that matches a ready-made team uses list_team_library's roles the same way. Never add a bot just to look busy, or one that duplicates a teammate.",
        "When the person writes to @everyone on the Team map, it comes to you alone, so you decide who it concerns: hand it with coordinate_bots to the teammates whose work it touches, never to all of them by default, and do the part that is yours. If it concerns nobody else, answer it yourself.",
        "Incidents: a teammate's run that fails, stalls or cannot start reaches you as a report in your \"Problems to look at\" thread, with a link. Read it, then retry_thread where it stopped, coordinate_bots with a corrected brief if the request itself must change, or — if only the person can fix the cause (a sign-in, a credential, an unanswered question, a setting) — say so plainly and stop. Retry a thread at most twice; report what failed and what you did in one or two sentences.",
        "Use list_bots or list_room_targets for the live reachable roster. To hand over work use coordinate_bots with a clear, self-contained brief, or with consult: true to ask a teammate for advice. It returns at once and keeps you available: end your turn and you resume automatically when the results arrive, success or failure. Say that work is assigned, not completed. Do not poll, send acknowledgements as new work, or substitute native helpers for named bots. Leads can coordinate their own specialists.",
        "When the results arrive, verify the requested outcome, settle ordinary tradeoffs within the person's scope, ask for concrete corrections with rework=true when needed, and return one consolidated answer. Only claim completion once the result has arrived; if a teammate fails or stalls, say so plainly and decide the next step yourself. Consultations are advice, not proof that work or tests ran. A refusal from coordinate_bots means nothing was sent: fix what it names (usually the id from list_bots or your roster; a unique name also works) and retry, and never describe a handoff the tool did not accept.",
        "Housekeeping: list_threads also shows threads a teammate opened on another (marked \"opened by\"); close_thread those once idle and done. Threads the person started are theirs: never close them.",
        "A change you request for a bot, a team or your own profile applies at once with an Undo; a pending review resumes you with its structured result. Follow the tool result: report failures and cancellations honestly, never claim success before an applied result, and never ask again, repeat the proposal or poll.",
        "When the person asks you to assemble or configure a team, use list_team_setup for the exact authorized teams and model catalog, then propose_team_setup once with all named specialists and their changes, naming any new team; present each bot and its model as your standing instructions say. Existing thread models and other bots' execution permissions stay unchanged. For an explicitly requested bot deletion, use propose_bot_deletion.",
        "Current Work department (your team):",
        "- Quill — Writer: Drafts concise copy [id: writer]",
        "- Patch — Engineer [id: coder]",
        "Other bots you can reach, in other departments:",
        "- Scout — Travel planner (Personal) [id: personal]",
      ].join("\n"),
    );
  });

  it("tells a place's MausBot that is not the Chief that the person's day and brief are its own, and a member's that they are not", () => {
    const place = chiefOfStaffSystemPrompt("maus", [{ id: "maus", name: "MausBot", defaultBot: {} }], true);
    expect(place).toContain("but you are not the Chief: team incidents stay with the Chief.");
    expect(place).toContain("Keeping an eye on the person's day and their daily brief are yours.");
    const member = chiefOfStaffSystemPrompt("maus", [{ id: "maus", name: "MausBot", defaultBot: { person: "ada@example.test" } }], true);
    expect(member).toContain("but you are not the Chief: the daily brief and team incidents stay with the Chief.");
    expect(member).not.toContain("daily brief are yours");
  });
});

describe("an @everyone line from the Team map", () => {
  const team = [{ id: "chief", name: "Clive", chiefOfStaff: true }, { id: "mail", name: "Mail" }, { id: "books", name: "Books" }];

  it("tells the Chief it alone gets the line and passes it only to the bots it concerns", () => {
    const prompt = chiefOfStaffSystemPrompt("chief", team, true);
    expect(prompt).toContain(EVERYONE_ON_THE_MAP);
    expect(EVERYONE_ON_THE_MAP).toContain("never to all of them by default");
  });

  it("says nothing of it to a Chief that cannot hand work on, or to a MausBot that only holds the tools", () => {
    expect(chiefOfStaffSystemPrompt("chief", team, false)).not.toContain(EVERYONE_ON_THE_MAP);
    const maus = [{ id: "maus", name: "MausBot", defaultBot: { person: "ada@example.test" } }, ...team.slice(1)];
    expect(chiefOfStaffSystemPrompt("maus", maus, true)).not.toContain(EVERYONE_ON_THE_MAP);
  });
});
