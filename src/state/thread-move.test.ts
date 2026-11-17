import { describe, expect, it } from "vitest";
import { serverMovedThread, threadStillKnown } from "./thread-move";

const owner = (threadId: string, tasks: string[], switchingTo?: string) => ({
  threadId, switchingTo, tasks: tasks.map((id) => ({ threadId: id })),
});

describe("the server moving a bot's active thread", () => {
  it("knows the thread on screen is still one of the bot's threads", () => {
    expect(threadStillKnown(owner("a", ["a", "b"]), owner("b", ["a", "b"]))).toBe(true);
    expect(threadStillKnown(owner("a", ["a", "b"]), owner("b", ["b"]))).toBe(false);
    expect(threadStillKnown(owner("a", ["a"]), owner("a", ["a"]))).toBe(true);
    expect(threadStillKnown(undefined, owner("b", ["b"]))).toBe(false);
  });

  it("is a move nobody on this client asked for", () => {
    expect(serverMovedThread(owner("a", ["a", "b"]), owner("b", ["a", "b"]))).toBe(true);
    expect(serverMovedThread(owner("a", ["a", "b"]), owner("a", ["a", "b"]))).toBe(false);
    expect(serverMovedThread(owner("a", ["a", "b"]), owner("b", ["b"]))).toBe(false);
  });

  it("is the person's own switch when the client is waiting for that thread", () => {
    expect(serverMovedThread(owner("a", ["a", "b"], "b"), owner("b", ["a", "b"]))).toBe(false);
  });

  it("keeps the thread when a partial frame does not list it", () => {
    // A frame that carries one thread alone says nothing about the others, so it cannot prove one is gone.
    expect(threadStillKnown(owner("a", ["a"]), { threadId: "b" })).toBe(true);
    expect(serverMovedThread(owner("a", ["a"]), { threadId: "b" })).toBe(true);
  });
});
