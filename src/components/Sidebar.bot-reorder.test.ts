// @vitest-environment happy-dom
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { AppState, Bot, InstanceInfo, Task } from "@/state/store";

vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
vi.mock("@/lib/cloud-guest", () => ({ useCanWriteIn: () => true }));
vi.mock("./DesktopCapabilities", async (importOriginal) => ({
  ...await importOriginal<typeof import("./DesktopCapabilities")>(),
  useDesktopCapabilities: () => ({ capabilities: { dictation: { available: false }, host: { packaged: true, platform: "other" }, localComputer: { available: false } }, ready: true }),
}));

const { Sidebar } = await import("./Sidebar");
const { BotEditorStore, initialState } = await import("@/state/store");
const { setLocale } = await import("@/lib/i18n");

const thread = (threadId: string): Task =>
  ({ threadId, title: threadId, createdAt: 1, updatedAt: 1, busy: false, activity: "idle", modelSelection: { instanceId: "test", model: "m" }, approvalMode: "ask" });
const profile = (id: string, extra: Partial<Bot> = {}): Bot => ({
  id, threadId: `${id}-t`, name: id, title: "", description: "", color: "green", notifications: true,
  unread: false, busy: false, messages: [], modelSelection: { instanceId: "test", model: "m" }, tasks: [thread(`${id}-t`)], ...extra,
});

// Three loose bots share one roster (reorderable); Solo sits alone in its department (nothing to reorder).
let state: AppState = {
  ...initialState,
  connected: true,
  selectedId: "atlas",
  activeView: "chat",
  bots: [profile("atlas"), profile("scout"), profile("pepper"), profile("solo", { section: "Solo" })],
  sections: ["Solo"],
  instances: [{ instanceId: "test", driverKind: "codex", displayName: "Test", snapshot: { state: "available" } } as InstanceInfo],
};
const dispatch = vi.fn();
let root: Root;
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
async function draw() {
  const value = { state, dispatch, flushBotPatches: async () => null, refreshInstances: async () => {}, refreshModels: async () => {} };
  flushSync(() => root.render(createElement(BotEditorStore, { value, children: createElement(Sidebar, { open: true, onClose: () => {} }) })));
  await settle();
}
const row = (id: string) => document.querySelector<HTMLElement>(`[data-sidebar-bot-row="${id}"]`);
const handle = (id: string) => document.querySelector<HTMLElement>(`[data-bot-drag-handle="${id}"]`);
function drag(type: string, target: HTMLElement, init: { dataTransfer?: DataTransfer; clientY?: number; altKey?: boolean } = {}) {
  const event = new DragEvent(type, { bubbles: true, cancelable: true, clientY: init.clientY ?? 10, altKey: init.altKey ?? false });
  // happy-dom drops dataTransfer from the DragEvent init, so it is defined directly.
  Object.defineProperty(event, "dataTransfer", { value: init.dataTransfer ?? new DataTransfer() });
  // happy-dom also drops altKey from the init, so it is defined directly.
  Object.defineProperty(event, "altKey", { value: init.altKey ?? false });
  target.dispatchEvent(event);
  return event;
}

beforeAll(async () => {
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true, json: async () => ({ botIds: [] }) })));
  setLocale("en");
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await draw();
});
afterAll(() => { root.unmount(); vi.unstubAllGlobals(); setLocale("en"); });

describe("bot roster reorder", () => {
  it("draws the drag handle on rows that can be reordered, and none on a roster of one", () => {
    for (const id of ["atlas", "scout", "pepper"]) expect(handle(id), id).not.toBeNull();
    expect(handle("solo")).toBeNull();
  });

  it("does not make the expanded row body a drag source on its own", () => {
    // Only the grip (or Alt on the row) starts a drag, so a sloppy click-drag on the row cannot reorder it.
    expect(row("atlas")?.getAttribute("draggable")).toBeNull();
    expect(handle("atlas")?.getAttribute("draggable")).toBe("true");
  });

  it("reorders and persists only when a drag starts on the handle", async () => {
    dispatch.mockClear();
    const transfer = new DataTransfer();
    drag("dragstart", handle("atlas")!, { dataTransfer: transfer });
    drag("dragover", row("scout")!, { dataTransfer: transfer, clientY: 10 });
    drag("drop", row("scout")!, { dataTransfer: transfer, clientY: 10 });
    await settle();
    const ordered = dispatch.mock.calls.map(([action]) => action).find((action) => action.type === "botsOrdered");
    expect(ordered).toEqual({ type: "botsOrdered", botIds: ["scout", "atlas", "pepper"] });
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1) as [string, { method: string; body: string }];
    expect(url).toBe("/api/bots/order");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).toEqual({ botIds: ["scout", "atlas", "pepper"] });
  });

  it("leaves the roster alone for a plain drag on the row body", async () => {
    dispatch.mockClear();
    const transfer = new DataTransfer();
    drag("dragstart", row("atlas")!, { dataTransfer: transfer });
    drag("dragover", row("scout")!, { dataTransfer: transfer, clientY: 10 });
    drag("drop", row("scout")!, { dataTransfer: transfer, clientY: 10 });
    await settle();
    expect(dispatch.mock.calls.map(([action]) => action).find((action) => action.type === "botsOrdered")).toBeUndefined();
  });

  it("does not reorder across rosters", async () => {
    dispatch.mockClear();
    const transfer = new DataTransfer();
    drag("dragstart", handle("atlas")!, { dataTransfer: transfer });
    drag("dragover", row("solo")!, { dataTransfer: transfer, clientY: 10 });
    drag("drop", row("solo")!, { dataTransfer: transfer, clientY: 10 });
    await settle();
    expect(dispatch.mock.calls.map(([action]) => action).find((action) => action.type === "botsOrdered")).toBeUndefined();
  });

  it("allows Alt+click-and-drag on the row body itself", async () => {
    dispatch.mockClear();
    const transfer = new DataTransfer();
    drag("dragstart", row("scout")!, { dataTransfer: transfer, altKey: true });
    drag("dragover", row("pepper")!, { dataTransfer: transfer, clientY: 10 });
    drag("drop", row("pepper")!, { dataTransfer: transfer, clientY: 10 });
    await settle();
    const ordered = dispatch.mock.calls.map(([action]) => action).find((action) => action.type === "botsOrdered");
    expect(ordered).toEqual({ type: "botsOrdered", botIds: ["atlas", "pepper", "scout"] });
  });
});
