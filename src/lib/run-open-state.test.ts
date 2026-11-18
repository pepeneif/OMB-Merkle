// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  };
}

let local: ReturnType<typeof memoryStorage>;

beforeEach(() => {
  vi.resetModules();
  local = memoryStorage();
  vi.stubGlobal("localStorage", local);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("run card collapse preference (A7)", () => {
  it("has no choice until the user sets one", async () => {
    const state = await import("./run-open-state");
    expect(state.runCardCollapsed()).toBeUndefined();
  });

  it("persists the choice globally and survives a reload", async () => {
    let state = await import("./run-open-state");
    state.setRunCardCollapsed(true);
    expect(local.getItem(state.RUN_CARD_COLLAPSED_KEY)).toBe("1");
    expect(state.runCardCollapsed()).toBe(true);

    // a fresh module instance (a PWA reload) reads the same single global key
    vi.resetModules();
    state = await import("./run-open-state");
    expect(state.runCardCollapsed()).toBe(true);
    state.setRunCardCollapsed(false);
    vi.resetModules();
    state = await import("./run-open-state");
    expect(state.runCardCollapsed()).toBe(false);
  });

  it("applies the same collapse to every thread (one global choice)", async () => {
    const state = await import("./run-open-state");
    // Collapsing once must hold everywhere: the reader takes no thread/run key,
    // so a run started in a different thread reads the same value.
    state.setRunCardCollapsed(true);
    expect(state.RUN_CARD_COLLAPSED_KEY).toBe("omb-run-card-collapsed");
    expect(state.runCardCollapsed()).toBe(true);
  });

  it("keeps the choice usable when storage is blocked or missing", async () => {
    Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw new Error("blocked"); } });
    const state = await import("./run-open-state");
    expect(state.runCardCollapsed()).toBeUndefined();
    state.setRunCardCollapsed(true);
    expect(state.runCardCollapsed()).toBe(true);
  });

  it("still remembers the per-run activity collapse in memory", async () => {
    const state = await import("./run-open-state");
    expect(state.runOpenChoice("run-1")).toBeUndefined();
    state.setRunOpenChoice("run-1", true);
    expect(state.runOpenChoice("run-1")).toBe(true);
    state.setRunOpenChoice("run-1", false);
    expect(state.runOpenChoice("run-1")).toBe(false);
  });
});
