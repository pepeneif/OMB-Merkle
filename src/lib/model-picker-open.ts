import { useEffect, useRef } from "react";

// The model picker belongs to the chat header (Advanced) or the bot panel (Simple), but the chat's ⋯ menu can name it:
// a menu row that says the model's name opens that picker directly instead of sending the person to Settings. The
// request names its thread, so a menu left over from another chat never opens this one's picker. Nothing mounted for
// the thread answers, and the caller falls back to the plain settings link.
const requests = new Set<(threadId: string) => boolean>();

/** Opens the model picker of the chat showing this thread. Returns whether some picker took the request. */
export function requestModelPicker(threadId: string): boolean {
  let handled = false;
  for (const request of Array.from(requests)) handled = request(threadId) || handled;
  return handled;
}

/** The picker's side: opens for a request naming its thread, and answers that it did. */
export function useModelPickerOpen(threadId: string | undefined, open: () => void): void {
  const latest = useRef(open);
  latest.current = open;
  useEffect(() => {
    if (!threadId) return;
    const request = (target: string) => {
      if (target !== threadId) return false;
      latest.current();
      return true;
    };
    requests.add(request);
    return () => {
      requests.delete(request);
    };
  }, [threadId]);
}
