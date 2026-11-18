// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { requestModelPicker, useModelPickerOpen } from "./model-picker-open";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });

function Picker({ threadId, open }: { threadId: string | undefined; open: () => void }) {
  useModelPickerOpen(threadId, open);
  return null;
}

it("answers false when nothing holds a picker for the thread", () => {
  expect(requestModelPicker("side")).toBe(false);
});

it("opens the mounted picker for its own thread, and leaves other threads alone", async () => {
  const open = vi.fn();
  await act(async () => root.render(createElement(Picker, { threadId: "side", open })));
  expect(requestModelPicker("other")).toBe(false);
  expect(open).not.toHaveBeenCalled();
  expect(requestModelPicker("side")).toBe(true);
  expect(open).toHaveBeenCalledTimes(1);
});

it("stops answering once the picker unmounts", async () => {
  const open = vi.fn();
  await act(async () => root.render(createElement(Picker, { threadId: "side", open })));
  await act(async () => root.render(createElement(Picker, { threadId: undefined, open })));
  expect(requestModelPicker("side")).toBe(false);
});
