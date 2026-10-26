import type { Message } from "../store.ts";

const MESSAGE_PAGE_MAX = 200;

/** undefined = absent, null = present but unusable (the caller answers 400). */
export function pageSize(raw: string | null): number | null | undefined {
  if (raw === null) return undefined;
  const size = Number(raw);
  if (!Number.isInteger(size) || size < 0) return null;
  return Math.min(size, MESSAGE_PAGE_MAX);
}

export function slimMessage(message: Message): Message | Record<string, unknown> {
  // Personalizacion Manager (0008): recorta name/input/output de los activity
  // largos para que el arranque de un hilo no arrastre payloads enormes.
  if (message.kind === "activity" && message.tool && typeof message.tool === "object") {
    const tool = message.tool as Record<string, unknown>;
    const cut = (v: unknown, n: number) =>
      typeof v === "string" && v.length > n ? v.slice(0, n) + "\u2026[recortado]" : v;
    return {
      ...message,
      tool: { ...tool, name: cut(tool.name, 300), input: cut(tool.input, 1000), output: cut(tool.output, 1000) },
    };
  }
  if (message.kind !== "screen" || !message.png) return message;
  const { png: _png, ...rest } = message;
  return { ...rest, hasImage: true };
}
