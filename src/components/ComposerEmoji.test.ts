// @vitest-environment happy-dom
// The composer's emoji button, ported from NanoBot: the picker opens above the
// button and a chosen emoji goes to the composer through onPick.
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("emoji-picker-react", () => ({
  Theme: { AUTO: "auto", LIGHT: "light", DARK: "dark" },
  SuggestionMode: { RECENT: "recent", FREQUENT: "frequent" },
  default: ({ onEmojiClick }: { onEmojiClick: (data: { emoji: string }) => void }) =>
    createElement("button", { type: "button", "data-testid": "picker", onClick: () => onEmojiClick({ emoji: "🚀" }) }, "picker"),
}));

import { ComposerEmoji } from "./ComposerEmoji";

describe("the composer emoji button", () => {
  let root: Root;
  let container: HTMLDivElement;
  const button = () => container.querySelector<HTMLButtonElement>(`button[aria-label="Emoji"]`);

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });
  afterEach(() => {
    flushSync(() => root.unmount());
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("keeps the picker closed until the button is pressed, then hands the choice to the composer", () => {
    const onPick = vi.fn();
    flushSync(() => root.render(createElement(ComposerEmoji, { onPick })));
    expect(button()).not.toBeNull();
    expect(container.querySelector('[data-testid="picker"]')).toBeNull();
    flushSync(() => button()!.click());
    expect(container.querySelector('[data-testid="picker"]')).not.toBeNull();
    flushSync(() => container.querySelector<HTMLButtonElement>('[data-testid="picker"]')!.click());
    expect(onPick).toHaveBeenCalledWith("🚀");
  });

  it("opens nothing while the composer is disabled", () => {
    flushSync(() => root.render(createElement(ComposerEmoji, { onPick: vi.fn(), disabled: true })));
    expect(button()!.disabled).toBe(true);
    flushSync(() => button()!.click());
    expect(container.querySelector('[data-testid="picker"]')).toBeNull();
  });
});
