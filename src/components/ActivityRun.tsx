import { useEffect, useState } from "react";
import { ChevronRight, Check } from "lucide-react";
import type { Message } from "@/state/store";
import { describeRun } from "@/lib/activity-runs";
import { t } from "@/lib/i18n";
import { useAdvancedMode } from "@/lib/interface-mode";
import { toolStepLabel } from "@/lib/tool-step-label";
import { runOpenChoice, setRunOpenChoice } from "@/lib/run-open-state";

export function ActivityRun({
  messages,
  forceOpen = false,
  children,
}: {
  messages: Message[];
  forceOpen?: boolean;
  children: React.ReactNode;
}) {
  // 0027 (A7): recuerda el colapso por corrida. Una vez que el usuario lo colapsa, se
  // queda colapsado aunque lleguen pasos nuevos; solo se reabre con su clic.
  const runId = messages[0]?.id ?? "";
  const [open, setOpen] = useState(() => runOpenChoice(runId) ?? forceOpen);
  const advanced = useAdvancedMode();
  const summary = advanced ? describeRun(messages) : describeRun(messages, toolStepLabel);
  useEffect(() => {
    if (forceOpen) { setOpen(true); setRunOpenChoice(runId, true); }
  }, [forceOpen, runId]);
  const setOpenP = (value: boolean) => { setOpen(value); setRunOpenChoice(runId, value); };
  if (open) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex min-w-0 justify-start">
          <button
            type="button"
            onClick={() => setOpenP(false)}
            aria-expanded
            className="flex min-w-0 max-w-full items-center gap-2 rounded-full border border-hairline/40 bg-transparent px-3 py-1.5 text-[13px] text-ink-secondary hover:bg-control"
          >
            <ChevronRight size={13} className="shrink-0 rotate-90" />
            <span className="min-w-0 truncate font-medium leading-5">{summary}</span>
          </button>
        </div>
        {children}
      </div>
    );
  }
  return (
    <div className="flex min-w-0 justify-start">
      <button
        type="button"
        onClick={() => setOpenP(true)}
        aria-expanded={false}
        title={t("chat.run.showSteps")}
        className="flex min-w-0 max-w-full items-center gap-2 rounded-full border border-hairline/40 bg-transparent px-3 py-1.5 text-[13px] text-ink-secondary hover:bg-control"
      >
        <Check size={13} className="shrink-0 text-success" />
        <span className="min-w-0 max-w-[480px] truncate font-medium leading-5">{summary}</span>
        <ChevronRight size={13} className="shrink-0" />
      </button>
    </div>
  );
}
