import { describe, expect, it } from "vitest";

import type { ModelCatalog } from "../contracts.ts";
import { codexBackgroundModel, codexBackgroundRoute, pinnedBackgroundModel } from "./codex-background-text.ts";
import { isImageModel } from "../model-kinds.ts";

const openrouter: ModelCatalog = {
  default: "openrouter::deepseek/deepseek-v4.1-flash-1017",
  options: [
    { id: "openrouter::deepseek/deepseek-v4.1-flash-1017", label: "DeepSeek V4.1 Flash", provider: "openrouter" },
    { id: "openrouter::google/gemini-nano-banana-2.1", label: "google/gemini-nano-banana-2.1 (OpenRouter)", provider: "openrouter" },
    { id: "openrouter::openai/gpt-5.4-mini", label: "GPT 5.4 Mini", provider: "openrouter" },
  ],
};

describe("isImageModel", () => {
  it.each([
    "openrouter::google/gemini-nano-banana-2.1",
    "google/gemini-nano-banana-2.1 (OpenRouter)",
    "google/nano-banana-pro",
    "openai/gpt-image-1",
    "black-forest-labs/flux-1.1-pro",
    "stabilityai/stable-diffusion-3.5",
  ])("recognises an image model: %s", (name) => {
    expect(isImageModel(name)).toBe(true);
  });

  it.each(["openrouter::openai/gpt-5.4-mini", "anthropic/claude-haiku-5.5", "google/gemini-4-flash", "deepseek/deepseek-v4.1-flash-1017"])(
    "leaves a text model alone: %s",
    (name) => {
      expect(isImageModel(name)).toBe(false);
    },
  );
});

describe("background model selection over OpenRouter", () => {
  it("skips the image model whose name carries a quick word", () => {
    expect(codexBackgroundModel(openrouter, new Set(), "openrouter")).toBe("openrouter::openai/gpt-5.4-mini");
  });

  it("returns nothing when every small-looking model draws pictures", () => {
    const onlyImage: ModelCatalog = {
      default: "openrouter::deepseek/deepseek-v4.1-flash-1017",
      options: openrouter.options.filter((option) => !option.id.includes("mini")),
    };
    expect(codexBackgroundModel(onlyImage, new Set(), "openrouter")).toBeNull();
  });
});

describe("pinned background model", () => {
  it("takes the pin when the catalog lists it on the same provider", () => {
    expect(pinnedBackgroundModel(openrouter, "deepseek/deepseek-v4.1-flash-1017", "openrouter")).toBe("openrouter::deepseek/deepseek-v4.1-flash-1017");
    expect(pinnedBackgroundModel(openrouter, "openrouter::deepseek/deepseek-v4.1-flash-1017", "openrouter")).toBe("openrouter::deepseek/deepseek-v4.1-flash-1017");
  });

  it("ignores a pin the catalog does not list, or one on another provider", () => {
    expect(pinnedBackgroundModel(openrouter, "nope/nope", "openrouter")).toBeNull();
    expect(pinnedBackgroundModel(openrouter, "deepseek/deepseek-v4.1-flash-1017", "openai")).toBeNull();
    expect(pinnedBackgroundModel(openrouter, undefined, "openrouter")).toBeNull();
  });

  it("uses the pin ahead of the small-model search", () => {
    const previous = process.env.OMB_BACKGROUND_MODEL;
    process.env.OMB_BACKGROUND_MODEL = "deepseek/deepseek-v4.1-flash-1017";
    try {
      expect(codexBackgroundRoute(openrouter, true, { model: "openrouter::deepseek/deepseek-v4.1-flash-1017", refused: new Set<string>(), onRefused: () => {} }))
        .toEqual({ model: "openrouter::deepseek/deepseek-v4.1-flash-1017" });
    } finally {
      if (previous === undefined) delete process.env.OMB_BACKGROUND_MODEL;
      else process.env.OMB_BACKGROUND_MODEL = previous;
    }
  });
});
