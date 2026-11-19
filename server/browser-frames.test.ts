import { mkdtempSync, rmSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const root = mkdtempSync(join(tmpdir(), "omb-browser-frames-"));
process.env.OMB_DATA_DIR = root;
const { KEPT_TURNS, MAX_AGE_MS, browserFrameDir, listBrowserFrames, pruneBrowserFrames, saveBrowserFrame } =
  await import("./browser-frames.ts");

const PNG = "iVBORw0KGgoAAAANSUhEUg==";

describe("browser frames", () => {
  beforeEach(() => { rmSync(browserFrameDir("thread-1"), { recursive: true, force: true }); });
  afterEach(() => { rmSync(browserFrameDir("thread-1"), { recursive: true, force: true }); });

  it("saves a capture on disk instead of publishing it", () => {
    saveBrowserFrame("thread-1", "turn-a", PNG);
    expect(listBrowserFrames("thread-1")).toHaveLength(1);
    expect(listBrowserFrames("thread-1")[0]).toContain("turn-a");
  });

  it("lists the newest capture first", () => {
    saveBrowserFrame("thread-1", "turn-a", PNG, 1_000);
    saveBrowserFrame("thread-1", "turn-b", PNG, 2_000);
    const files = listBrowserFrames("thread-1");
    expect(files[0]).toContain("turn-b");
  });

  it("keeps the last two turns and drops the ones before", () => {
    for (const [turn, at] of [["turn-a", 1_000], ["turn-b", 2_000], ["turn-c", 3_000], ["turn-d", 4_000]] as const) {
      saveBrowserFrame("thread-1", turn, PNG, at);
    }
    const removed = pruneBrowserFrames("thread-1", 4_100);
    expect(removed).toHaveLength(2);
    const left = listBrowserFrames("thread-1").map((file) => file.split("-").at(-1)?.replace(".png", ""));
    expect(left.sort()).toEqual(["c", "d"]);
    expect(KEPT_TURNS).toBe(2);
  });

  it("drops every capture older than a day, even inside the last two turns", () => {
    const now = 10 * MAX_AGE_MS;
    const old = saveBrowserFrame("thread-1", "turn-a", PNG, now - MAX_AGE_MS - 1_000);
    const recent = saveBrowserFrame("thread-1", "turn-b", PNG, now - 1_000);
    // Age is the file's own date, the one a restart keeps.
    utimesSync(old, new Date(now - MAX_AGE_MS - 1_000), new Date(now - MAX_AGE_MS - 1_000));
    utimesSync(recent, new Date(now - 1_000), new Date(now - 1_000));
    const removed = pruneBrowserFrames("thread-1", now);
    expect(removed).toHaveLength(1);
    expect(listBrowserFrames("thread-1")).toHaveLength(1);
  });

  it("keeps several captures of the same turn together", () => {
    saveBrowserFrame("thread-1", "turn-a", PNG, 1_000);
    saveBrowserFrame("thread-1", "turn-a", PNG, 1_100);
    saveBrowserFrame("thread-1", "turn-b", PNG, 2_000);
    expect(pruneBrowserFrames("thread-1", 2_100)).toHaveLength(0);
    expect(listBrowserFrames("thread-1")).toHaveLength(3);
  });

  it("removes the folder once nothing is left, and tolerates a thread with no captures", () => {
    expect(pruneBrowserFrames("thread-1", 1_000)).toEqual([]);
    const file = saveBrowserFrame("thread-1", "turn-a", PNG, 1_000);
    utimesSync(file, new Date(1_000), new Date(1_000));
    pruneBrowserFrames("thread-1", 2 * MAX_AGE_MS);
    expect(listBrowserFrames("thread-1")).toEqual([]);
  });
});
