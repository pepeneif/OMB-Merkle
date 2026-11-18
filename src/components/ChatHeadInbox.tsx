// The Inbox button in the chat's top bar, between the computer and the ⋯ menu. It opens the same panel the
// sidebar's row opens, without the activity dot and without the Active Threads section inside the panel.
import { Inbox } from "lucide-react";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { closeInbox, openInbox, useInboxPanel, useInboxSupport, useInboxView } from "@/state/inbox";
import { useTeamPeople } from "@/state/team-people";
import { inboxFixes, waitingCount } from "./inbox/inbox-view";

export function ChatHeadInboxButton() {
  const support = useInboxSupport();
  const view = useInboxView();
  const team = useTeamPeople();
  const { open } = useInboxPanel();
  if (support === "no") return null;
  const count = waitingCount(view) + inboxFixes(team?.needsYou, view).length;
  const shown = count > 9 ? "9+" : String(count);
  const label = count > 0 ? t("inbox.row.count", { count }) : t("inbox.panel.title");
  const toggle = () => {
    if (open) closeInbox();
    else openInbox();
  };
  return (
    <button
      type="button"
      data-chathead-inbox={count}
      aria-label={label}
      title={label}
      aria-pressed={open}
      onClick={toggle}
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-raised",
        open ? "bg-raised text-accent" : "text-ink-secondary hover:text-ink",
      )}
    >
      <Inbox size={18} strokeWidth={1.5} aria-hidden="true" />
      {count > 0 && (
        <span aria-hidden="true" data-inbox-count className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-warning px-0.5 text-[10px] font-semibold leading-4 text-panel">
          {shown}
        </span>
      )}
    </button>
  );
}
