// @vitest-environment happy-dom
// The composer's emoji button (parche 0035, portado de NanoBot): an emoji chosen from
// the picker lands at the caret, and the box starts at two lines in the roomy composer.
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Bot } from "@/state/store";
import { restoreComposerDraft } from "@/lib/drafts";

const fixture = vi.hoisted(() => ({ advanced: true, dispatch: vi.fn() }));
vi.mock("@/state/store", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/state/store")>();
  return { ...original, useStore: () => ({
    state: { ...original.initialState, bots: [bot], instances: [{
      instanceId: "fake", driverKind: "claude", displayName: "Fake", capabilities: {},
    }] },
    dispatch: fixture.dispatch,
  }) };
});
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
vi.mock("@/lib/use-owner-or-admin", () => ({ useOwnerOrAdmin: () => true }));
vi.mock("@/lib/interface-mode", () => ({ useAdvancedMode: () => fixture.advanced, setAdvancedMode: vi.fn() }));
vi.mock("./CallView", () => ({ CallButton: () => null }));
vi.mock("./GroupCallView", () => ({ GroupCallButton: () => null }));
vi.mock("./DesktopCapabilities", async () => {
  const { initialDesktopCapabilities } = await import("@/lib/desktop");
  return { useDesktopCapabilities: () => ({ capabilities: initialDesktopCapabilities(), ready: true }) };
});
// The real picker is a large tree; stand in for it so the test drives just the wiring.
vi.mock("emoji-picker-react", () => ({
  Theme: { AUTO: "auto", LIGHT: "light", DARK: "dark" },
  SuggestionMode: { RECENT: "recent", FREQUENT: "frequent" },
  default: ({ onEmojiClick }: { onEmojiClick: (data: { emoji: string }) => void }) =>
    createElement("button", { type: "button", "data-testid": "picker", onClick: () => onEmojiClick({ emoji: "🚀" }) }, "picker"),
}));

import { Composer } from "./Composer";

const bot: Bot = {
  id: "emoji-bot", threadId: "emoji-thread", name: "Fixture", title: "", description: "",
  color: "blue", notifications: false, unread: false, busy: false, messages: [],
  modelSelection: { instanceId: "fake", model: "fake" },
};
const draftId = `bot:${bot.id}:${bot.threadId}`;

describe("the composer's emoji button", () => {
  let root: Root;
  let container: HTMLDivElement;
  const input = () => container.querySelector<HTMLTextAreaElement>("textarea")!;
  const emojiButton = () => container.querySelector<HTMLButtonElement>('button[aria-label="Emoji"]');
  const picker = () => container.querySelector<HTMLButtonElement>('[data-testid="picker"]');

  beforeEach(() => {
    fixture.advanced = true;
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    vi.spyOn(HTMLElement.prototype, "scrollIntoView").mockImplementation(() => {});
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });
  afterEach(() => {
    flushSync(() => root.unmount());
    restoreComposerDraft(draftId, { text: "", attachments: [] });
    container.remove();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("inserts the chosen emoji at the caret, not at the end", () => {
    restoreComposerDraft(draftId, { text: "AB", attachments: [] });
    flushSync(() => root.render(createElement(Composer, { bot })));
    expect(emojiButton()).not.toBeNull();
    input().setSelectionRange(1, 1);
    flushSync(() => emojiButton()!.click());
    expect(picker()).not.toBeNull();
    flushSync(() => picker()!.click());
    // Not "AB🚀": the emoji goes in where the caret was. (happy-dom does not run the
    // animation frame that re-places the caret, so only the text is asserted here.)
    expect(input().value).toBe("A🚀B");
  });

  it("starts the roomy composer at two lines", () => {
    restoreComposerDraft(draftId, { text: "", attachments: [] });
    flushSync(() => root.render(createElement(Composer, { bot })));
    const field = input();
    expect(field.getAttribute("rows")).toBe("2");
    expect(field.className.split(" ")).toContain("min-h-14");
  });

  it("lays the left cluster out in two rows, approval and place above the goal chip", () => {
    restoreComposerDraft(draftId, { text: "", attachments: [] });
    flushSync(() => root.render(createElement(Composer, { bot })));
    const attach = container.querySelector<HTMLButtonElement>('button[aria-label="Adjuntar un archivo"], button[aria-label="Attach a file"]')!;
    const emoji = emojiButton()!;
    // The cluster is a 2-row grid: attach sits on the bottom row's last column and the emoji
    // picker directly above it, while the goal chip spans the first two columns of that row.
    expect(attach.className).toContain("row-start-2");
    expect(attach.className).toContain("col-start-3");
    const emojiCell = emoji.parentElement!.parentElement!;
    expect(emojiCell.className).toContain("row-start-1");
    expect(emojiCell.className).toContain("col-start-3");
    expect(emojiCell.parentElement!.className).toContain("grid-rows-2");
  });

  it("keeps the emoji button out of Simple mode's round + composer", () => {
    fixture.advanced = false;
    restoreComposerDraft(draftId, { text: "", attachments: [] });
    flushSync(() => root.render(createElement(Composer, { bot })));
    expect(emojiButton()).toBeNull();
  });
});
