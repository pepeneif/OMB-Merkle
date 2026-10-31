// Providers such as Grok narrate before tools.
import { useEffect, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { runOpenChoice, setRunOpenChoice } from "@/lib/run-open-state";

export function TurnNarrationRun({
  label,
  title,
  forceOpen = false,
  children,
}: {
  label: string;
  title?: string;
  forceOpen?: boolean;
  children: React.ReactNode;
}) {
  // 0027 (A7): conserva el colapso de la narracion por corrida (llave = etiqueta + primer paso).
  const runId = `narration:${label}`;
  const [open, setOpen] = useState(() => runOpenChoice(runId) ?? forceOpen);
  useEffect(() => {
    if (forceOpen) { setOpen(true); setRunOpenChoice(runId, true); }
  }, [forceOpen, runId]);
  const toggle = () => { setOpen((v) => { const next = !v; setRunOpenChoice(runId, next); return next; }); };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-start">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          title={title ?? (open ? "Hide progress messages" : "Show progress messages")}
          className="ui-pill"
        >
          <Check size={13} className="text-success" />
          <span>{label}</span>
          <ChevronRight size={13} className={open ? "rotate-90" : undefined} />
        </button>
      </div>
      {open && children}
    </div>
  );
}
