import { useEffect, useRef } from "react";
import { t } from "@/lib/i18n";
import { useLanguageChoice } from "@/lib/language-preference";
import { duePing, openTarget, presenceBody, shownLanguage } from "@/lib/presence-client";
import { useShowThreads } from "@/lib/thread-preferences";
import { existingThreadTarget } from "@/lib/thread-target";
import { openThread } from "@/state/thread-navigation";
import { api, type Action, type AppState } from "@/state/store";

const ACTIVITY = ["focus", "pointerdown", "keydown"] as const;

function selection(state: AppState): string {
  const bot = state.bots.find((candidate) => candidate.id === state.selectedId);
  const threadId = bot ? bot.switchingTo ?? bot.threadId : state.groups.find((group) => group.id === state.selectedId)?.threadId;
  return `${state.selectedId}\n${threadId ?? ""}`;
}

/** The bot conversation open in front of the person, if one is. */
function openChat(state: AppState): string | undefined {
  const bot = state.bots.find((candidate) => candidate.id === state.selectedId);
  return bot ? bot.switchingTo ?? bot.threadId : undefined;
}

/** Tells the server the person is here and which chat they have open, and opens the chat the answer names: the brief the
 * Chief posted for this arrival. Never out of a conversation being read: there the brief waits, marked, with a line
 * saying where it is. */
export function usePresence(state: AppState, dispatch: (action: Action) => void): void {
  const showThreads = useShowThreads();
  const lastPing = useRef<number | null>(null);
  const language = shownLanguage(state.config?.language, useLanguageChoice());
  const latest = useRef({ state, dispatch, showThreads, language });
  latest.current = { state, dispatch, showThreads, language };
  const sentLanguage = useRef(language);
  const pingNow = useRef<() => void>(() => {});
  useEffect(() => {
    if (!state.hydrated) return;
    const ping = (force = false) => {
      const now = Date.now();
      if (!force && !duePing(lastPing.current, now)) return;
      lastPing.current = now;
      const sentFrom = selection(latest.current.state);
      sentLanguage.current = latest.current.language;
      const body = presenceBody(Intl.DateTimeFormat().resolvedOptions().timeZone, sentLanguage.current, openChat(latest.current.state));
      void api("/api/presence/active", { method: "POST", body: JSON.stringify(body) }).then((answer) => {
        const live = latest.current;
        const target = existingThreadTarget(openTarget(answer), live.state);
        if (!target || selection(live.state) !== sentFrom) return;
        // The brief takes the screen only when it is the chat already open, or when no chat is being read.
        const reading = live.state.activeView === "chat" ? openChat(live.state) : undefined;
        if (!reading || reading === target.threadId) { openThread(live.dispatch, target, live.state, live.showThreads); return; }
        const bot = live.state.bots.find((candidate) => candidate.id === target.botId);
        const task = bot?.tasks?.find((candidate) => candidate.threadId === target.threadId);
        live.dispatch({ type: "botPatched", bot: { ...bot!, unread: true,
          tasks: (bot!.tasks ?? []).map((candidate) => candidate.threadId === target.threadId ? { ...candidate, unread: true } : candidate) } });
        live.dispatch({ type: "notice", notice: { kind: "note", botName: null, text: t("chat.briefWaiting", { title: task?.title ?? bot?.name ?? "" }) } });
      }, () => {});
    };
    const onActivity = () => ping();
    const onVisible = () => { if (document.visibilityState === "visible") ping(); };
    pingNow.current = () => ping(true);
    onVisible();
    for (const name of ACTIVITY) window.addEventListener(name, onActivity, { passive: true });
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      pingNow.current = () => {};
      for (const name of ACTIVITY) window.removeEventListener(name, onActivity);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [state.hydrated]);
  useEffect(() => {
    if (language !== sentLanguage.current) pingNow.current();
  }, [language]);
}
