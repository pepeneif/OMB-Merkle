import { useMemo, useState } from "react";
import type { Message } from "@/state/store";

/** Advanced mode's "Chat activity": whether routine updates and finished tool entries show in the chat, kept on this device. */
export interface ChatActivity {
  routines: boolean;
  tools: boolean;
  toggleRoutines(): void;
  toggleTools(): void;
}

function useVisibility(key: string) {
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem(key) !== "hide"; }
    catch { return true; }
  });
  const toggle = () => {
    setVisible(!visible);
    try { localStorage.setItem(key, visible ? "hide" : "show"); }
    catch { /* Keep the preference for this visit. */ }
  };
  return [visible, toggle] as const;
}

export function useChatActivity(): ChatActivity {
  const [routines, toggleRoutines] = useVisibility("omb-advanced-chat-automation");
  const [tools, toggleTools] = useVisibility("omb-advanced-chat-tools");
  // One object per pair of choices, so the chat's filtered list changes only when a switch does.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- each toggle is fresh exactly when its value changes
  return useMemo(() => ({ routines, tools, toggleRoutines, toggleTools }), [routines, tools]);
}

/** The messages the chat draws: everything outside Advanced mode; there, without what the person hid. Anything that
 * still needs the person (a pending approval, a waiting or failed run) always stays. */
export function chatActivityMessages(messages: Message[], advanced: boolean, activity: ChatActivity, pinnedMessageId?: string): Message[] {
  if (!advanced || (activity.routines && activity.tools)) return messages;
  return messages.filter((message) => {
    if (message.role !== "bot" || message.id === pinnedMessageId) return true;
    const approval = message.kind === "options" && message.card?.requestId && message.card.tool ? message.card : undefined;
    if (approval && !approval.answered && !approval.dismissed && !approval.expired) return true;
    if (approval && !activity.tools) return false;
    if (activity.routines) return true;
    if (message.kind === "routine.run") return message.routineRun?.status === "waiting" || message.routineRun?.status === "failed";
    return !message.automation || Boolean(message.automation.needsYou || message.automation.failed || message.automation.partial || message.automation.copyOf);
  });
}
