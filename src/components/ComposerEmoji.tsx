import { useEffect, useRef, useState } from "react";
import EmojiPicker, { Theme as EmojiTheme, SuggestionMode, type EmojiClickData } from "emoji-picker-react";
import { Smile } from "lucide-react";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";

/** The composer's emoji button, ported from NanoBot (bot.merkle.space): the same
 *  emoji-picker-react picker, anchored above the button. A click inserts the emoji
 *  at the caret through `onPick`; the picker keeps its own recent list. Like
 *  NanoBot, it is a desktop control and is not shown on a phone. */
export function ComposerEmoji({ onPick, disabled, simple = false }: {
  onPick: (emoji: string) => void;
  disabled?: boolean;
  simple?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const holderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (holderRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={holderRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={disabled}
        aria-label={t("composer.emoji")}
        title={t("composer.emoji")}
        aria-expanded={open}
        className={cn(
          "flex shrink-0 items-center justify-center",
          simple
            ? "size-7 rounded-full bg-ink/[0.05] ring-[0.5px] ring-inset ring-ink/[0.07] text-ink-tertiary hover:bg-ink/[0.09] hover:text-ink"
            : "size-8 rounded-full text-ink-secondary hover:bg-control hover:text-ink",
          open && !simple && "bg-control text-ink",
        )}
      >
        <Smile size={simple ? 16 : 18} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-40 mb-2">
          <EmojiPicker
            width={360}
            height={430}
            searchDisabled={false}
            skinTonesDisabled
            previewConfig={{ showPreview: false }}
            suggestedEmojisMode={SuggestionMode.RECENT}
            lazyLoadEmojis
            theme={EmojiTheme.AUTO}
            onEmojiClick={(emojiData: EmojiClickData) => onPick(emojiData.emoji)}
            customEmojis={[]}
          />
        </div>
      )}
    </div>
  );
}
