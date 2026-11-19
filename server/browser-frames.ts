// 022 (Merkle): the browser's screenshots stay out of the chat. The poller still captures, so the panel and an express
// request can show one, but instead of becoming a message the PNG lands in a per-thread folder. The folder keeps the
// last two turns and nothing older than a day: a thread that goes quiet is cleaned without anyone asking.
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { DATA_DIR } from "./config.ts";

/** Turns kept on disk: the one that just ended, the one before it, and the current one still writing. */
export const KEPT_TURNS = 2;
export const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function browserFrameDir(threadId: string): string {
  return join(DATA_DIR, "browser-frames", threadId.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 80) || "thread");
}

/** One PNG per capture, named so a listing reads in order: turn then time. */
export function saveBrowserFrame(threadId: string, turnId: string | undefined, png: string, at = Date.now()): string {
  const dir = browserFrameDir(threadId);
  mkdirSync(dir, { recursive: true });
  const turn = (turnId ?? "no-turn").replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 40);
  const name = `${String(at).padStart(16, "0")}-${turn}.png`;
  const file = join(dir, name);
  writeFileSync(file, Buffer.from(png, "base64"));
  return file;
}

/** Newest first, so an express request names the latest one without a clock. */
export function listBrowserFrames(threadId: string): string[] {
  const dir = browserFrameDir(threadId);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => name.endsWith(".png")).sort().reverse().map((name) => join(dir, name));
}

/**
 * Deletes what the policy says is stale: every frame older than a day, and every frame from a turn older than the
 * last `KEPT_TURNS` distinct turns. A thread with no frames loses its folder. Returns what it removed.
 */
export function pruneBrowserFrames(threadId: string, now = Date.now()): string[] {
  const dir = browserFrameDir(threadId);
  if (!existsSync(dir)) return [];
  const names = readdirSync(dir).filter((name) => name.endsWith(".png")).sort();
  const removed: string[] = [];
  const fresh: string[] = [];
  for (const name of names) {
    const file = join(dir, name);
    let old = false;
    try { old = now - statSync(file).mtimeMs > MAX_AGE_MS; } catch { old = true; }
    if (old) { rmSync(file, { force: true }); removed.push(file); } else fresh.push(file);
  }
  // Turns in order of appearance, newest last; keep only the tail.
  const turns: string[] = [];
  for (const file of fresh) {
    const turn = turnOf(file);
    if (turns.at(-1) !== turn) turns.push(turn);
  }
  const keep = new Set(turns.slice(-KEPT_TURNS));
  for (const file of fresh) {
    if (keep.has(turnOf(file))) continue;
    rmSync(file, { force: true });
    removed.push(file);
  }
  if (!readdirSync(dir).length) rmSync(dir, { recursive: true, force: true });
  return removed;
}

/** `0000001732...-turn-abc.png` → `turn-abc`. */
function turnOf(file: string): string {
  const name = file.slice(file.lastIndexOf("/") + 1);
  return name.slice(name.indexOf("-") + 1, -".png".length);
}
