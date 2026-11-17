import { botOwner, nameFromEmail } from "../shared/bot-owner.ts";
import { canManage, hasAuthority, inChargeOfEvery, peerName, renderRoster, reachablePeers, type RosterMember, type TeamPrompt } from "./peer-roster.ts"; import { chiefLevel } from "./chief-level.ts";
import type { TaskRecord } from "./store.ts";

export type ChiefTeamMember = RosterMember;

/** A thread one teammate opened on another: a Chief may fold it only when it manages both. */
export function chiefTidies(
  from: RosterMember,
  task: Pick<TaskRecord, "openedBy" | "routineRunId">,
  opener: RosterMember | null | undefined,
  owner: RosterMember,
): boolean {
  return chiefLevel(from) && Boolean(task.openedBy) && !task.routineRunId &&
    opener != null && canManage(from, opener) && canManage(from, owner);
}

const ROSTER_MAX_BOTS = 40;
const OTHERS_MIN_BOTS = 8;

const SPECIALISTS = "When a job needs a specialist you do not have (an ongoing area of work, a different skill set, or work to run in parallel), follow your standing instructions on proposing a new bot; with none, add one with create_bot, then tell the person in one line, since they can undo it. A goal that matches a ready-made team uses list_team_library's roles the same way. Never add a bot just to look busy, or one that duplicates a teammate.";

/** Split out of the old single delegation paragraph so the hand-off and its return are read as the two steps they are. */
const HAND_OVER = "Use list_bots or list_room_targets for the live reachable roster. To hand over work use coordinate_bots with a clear, self-contained brief, or with consult: true to ask a teammate for advice. It returns at once and keeps you available: end your turn and you resume automatically when the results arrive, success or failure. Say that work is assigned, not completed. Do not poll, send acknowledgements as new work, or substitute native helpers for named bots. Leads can coordinate their own specialists.";

const WHEN_THEY_RETURN = "When the results arrive, verify the requested outcome, settle ordinary tradeoffs within the person's scope, ask for concrete corrections with rework=true when needed, and return one consolidated answer. Only claim completion once the result has arrived; if a teammate fails or stalls, say so plainly and decide the next step yourself. Consultations are advice, not proof that work or tests ran. A refusal from coordinate_bots means nothing was sent: fix what it names (usually the id from list_bots or your roster; a unique name also works) and retry, and never describe a handoff the tool did not accept.";

const INCIDENTS = "Incidents: a teammate's run that fails, stalls or cannot start reaches you as a report in your \"Problems to look at\" thread, with a link. Read it, then retry_thread where it stopped, coordinate_bots with a corrected brief if the request itself must change, or — if only the person can fix the cause (a sign-in, a credential, an unanswered question, a setting) — say so plainly and stop. Retry a thread at most twice; report what failed and what you did in one or two sentences.";

/** Shared by every proposal flow (profile, team, staffing): one statement of what a tool result means. */
const TOOL_RESULT = "A change you request for a bot, a team or your own profile applies at once with an Undo; a pending review resumes you with its structured result. Follow the tool result: report failures and cancellations honestly, never claim success before an applied result, and never ask again, repeat the proposal or poll.";

const STAFFING = "When the person asks you to assemble or configure a team, use list_team_setup for the exact authorized teams and model catalog, then propose_team_setup once with all named specialists and their changes, naming any new team; present each bot and its model as your standing instructions say. Existing thread models and other bots' execution permissions stay unchanged. For an explicitly requested bot deletion, use propose_bot_deletion.";

const sectionKey = (section?: string): string => section?.trim() || "";

/** Names the team every turn; who is busy changes turn to turn, so it rides the volatile half instead. */
/** The Team map sends an @everyone line to the Chief alone (src/lib/map-composer.ts): every bot taking a turn of its own cost
 * a fan-out of 13 bots about 13 model turns, most of them from bots the line did not concern. */
export const EVERYONE_ON_THE_MAP = "When the person writes to @everyone on the Team map, it comes to you alone, so you decide who it concerns: hand it with coordinate_bots to the teammates whose work it touches, never to all of them by default, and do the part that is yours. If it concerns nobody else, answer it yourself.";

export function chiefOfStaffSystemPrompt(...args: Parameters<typeof chiefOfStaffPrompt>): string {
  const { rules, roster } = chiefOfStaffPrompt(...args);
  return `${rules}\n${roster}`;
}

export function chiefOfStaffPrompt(
  chiefId: string,
  bots: ChiefTeamMember[],
  canDelegate: boolean,
  also?: (bot: ChiefTeamMember) => boolean,
  departments?: readonly string[],
): TeamPrompt {
  const chief = bots.find((bot) => bot.id === chiefId);
  const chiefSection = sectionKey(chief?.section);
  const sectionName = peerName(chiefSection) || "General";
  const owner = chief ? botOwner(chief) : null;
  const person = owner ? peerName(nameFromEmail(owner)) || "your person" : null;
  const reachable = reachablePeers(bots, chief ?? { id: chiefId, name: "" }, also);
  const team = chief ? reachable.filter((bot) => hasAuthority(chief, bot)) : reachable;
  const others = chief ? reachable.filter((bot) => !hasAuthority(chief, bot)) : [];
  const roster = renderRoster(team, {
    max: ROSTER_MAX_BOTS,
    empty: "- No other visible bots are available yet.",
    about: true,
    department: chiefSection,
  });
  const othersRoster = others.length ? renderRoster(others, {
    max: Math.max(ROSTER_MAX_BOTS - team.length, OTHERS_MIN_BOTS),
    empty: "",
    about: false,
    department: chiefSection,
  }) : "";

  const delegation = canDelegate
    ? HAND_OVER
    : "Your current engine cannot contact teammates. Be honest about that limitation and ask the user to choose a delegation-compatible engine before promising coordinated work.";

  const isChief = !chief?.defaultBot || chief.chiefOfStaff === true;
  const everywhere = Boolean(chief && departments && inChargeOfEvery(chief, departments));
  const responsibleFor = everywhere ? "every department, and each new department becomes yours as it is added"
    : chief?.managedSections?.length ? `these departments: ${chief.managedSections.map(s => peerName(s) || "General").join(", ")}` : "";
  const rules = [
    isChief
      ? person
        ? `You are ${person}'s assistant and Chief of Staff, and their one point of contact: the bots that report to ${person}, in every department, are your team — you direct their work and their incidents come to you.`
        : `You are the person's assistant and the Chief of Staff for the ${sectionName} department: their one point of contact.`
      : chief?.defaultBot?.person
        ? `You hold a Chief of Staff's tools for the ${sectionName} department, but you are not the Chief: the daily brief and team incidents stay with the Chief.`
        : `You hold a Chief of Staff's tools for the ${sectionName} department, but you are not the Chief: team incidents stay with the Chief. Keeping an eye on the person's day and their daily brief are yours.`,
    responsibleFor
      ? `The owner also made you responsible for ${responsibleFor}. You supervise their bots and may propose setup changes there. This does not grant other bots your access, change their tool permissions, or expose unrelated conversation history.`
      : "",
    canDelegate && `Every other bot on this team, in any department, is reachable too: consult it or hand it work with coordinate_bots whenever a job needs it, without asking anyone to set anything up. Reaching a bot${responsibleFor || person ? " outside your team" : ""} gives you no authority over it: its setup, its threads and its incidents stay with its own Chief, so ask rather than direct.`,
    "Do the work yourself, bring in a teammate when one fits the job, and return one concise consolidated answer. Never invent a teammate's progress or result. Normal permission and approval rules still apply.",
    canDelegate && "A standing preference the person states for all their bots (where reminders go, how replies should sound) you save yourself with memory_update action prefer, which every bot reads; never send it to each bot with coordinate_bots.",
    canDelegate ? SPECIALISTS : "",
    canDelegate && isChief ? EVERYONE_ON_THE_MAP : "",
    canDelegate && isChief ? INCIDENTS : "",
    delegation,
    canDelegate ? WHEN_THEY_RETURN : "",
    canDelegate ? "Housekeeping: list_threads also shows threads a teammate opened on another (marked \"opened by\"); close_thread those once idle and done. Threads the person started are theirs: never close them." : "",
    canDelegate ? TOOL_RESULT : "",
    canDelegate ? STAFFING : "",
  ].filter(Boolean).join("\n");
  const listed = [
    person ? `Bots that report to ${person} (your team):` : everywhere ? "Your team, in every department:" : chief?.managedSections?.length ? "Your team, in the departments you are responsible for:" : `Current ${sectionName} department (your team):`,
    roster,
    othersRoster && (person ? "Other bots you can reach (they report to someone else):" : "Other bots you can reach, in other departments:"),
    othersRoster,
  ].filter(Boolean).join("\n");
  return { rules, roster: listed };
}
