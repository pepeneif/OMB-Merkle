// @vitest-environment happy-dom
import { act, createElement, createRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { MentionTextarea } from "./MentionTextarea";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => {
  document.head.innerHTML = "";
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

it("draws its words in the field's own type and padding, so the caret stays at the end of the text", async () => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  document.head.appendChild(document.createElement("style")).textContent =
    ".dock { font-size: 14px; line-height: 20px; padding: 4px 2px } .wide { font-size: 15px; line-height: 24px; padding: 4px }";
  const root = createRoot(document.body.appendChild(document.createElement("div")));
  const inputRef = createRef<HTMLTextAreaElement>();
  const show = (className: string) => act(async () => {
    root.render(createElement(MentionTextarea, { inputRef, peers: [], className, value: "asdasdasdasjashdjas", onChange: () => {} }));
  });
  const mirror = () => document.querySelector<HTMLElement>(".mention-editor-mirror")!.style;
  await show("dock");
  expect([mirror().fontSize, mirror().lineHeight, mirror().paddingLeft]).toEqual(["14px", "20px", "2px"]);
  await show("wide");
  expect([mirror().fontSize, mirror().lineHeight, mirror().paddingLeft], "and follows the field when its classes change").toEqual(["15px", "24px", "4px"]);
  act(() => root.unmount());
});

it("keeps the tail visible after the text grows, and keeps a mid-text caret where the reader is", async () => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  const root = createRoot(document.body.appendChild(document.createElement("div")));
  const inputRef = createRef<HTMLTextAreaElement>();
  const show = (value: string, className = "dock") => act(async () => {
    root.render(createElement(MentionTextarea, { inputRef, peers: [], className, value, onChange: () => {} }));
  });
  await show("line");
  const field = inputRef.current!;
  Object.defineProperty(field, "scrollHeight", { configurable: true, get: () => 200 });
  Object.defineProperty(field, "clientHeight", { configurable: true, get: () => 100 });
  field.scrollTop = 0;
  field.selectionStart = field.selectionEnd = field.value.length;
  await show("line\nline\nline\nline\nline\n263PAYLk3t3cV2ve3zkga7Hw7s6cVA1C1Hkj4J46oJsP");
  expect(field.scrollTop, "a paste that grows the box follows the caret instead of keeping the old top").toBe(100);
  field.scrollTop = 30;
  field.selectionStart = field.selectionEnd = 0;
  await show(field.value, "dock wide");
  expect(field.scrollTop, "a reader parked mid-text keeps their place when the box is re-measured").toBe(30);
  act(() => root.unmount());
});
