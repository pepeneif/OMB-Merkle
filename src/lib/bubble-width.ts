// Personalizacion Manager: ancho de las burbujas ajustable por el usuario.
//
// Cada categoria tiene su propia variable CSS y su propio ancho persistido por
// dispositivo (localStorage), igual que la barra lateral. El ancho se aplica
// como max-width de la burbuja; el mango de arrastre vive en el borde libre
// (derecha en las del bot, izquierda en las del usuario y en "This run").

export type BubbleKind = "bot" | "user" | "run";

export const BUBBLE_CSS_VAR: Record<BubbleKind, string> = {
  bot: "--bubble-bot",
  user: "--bubble-user",
  run: "--bubble-run",
};

export const BUBBLE_DEFAULT_PX: Record<BubbleKind, number> = {
  bot: 900,
  user: 900,
  run: 720,
};

export const BUBBLE_MIN_PX = 320;
// Personalizacion Manager (2026-10-14): tope de arrastre mas alto, y aun mas
// para la tarjeta "This run". El limite efectivo en pantalla sigue siendo el
// porcentaje de styles.css (90% general, 95% para "This run").
export const BUBBLE_MAX_PX: Record<BubbleKind, number> = {
  bot: 1800,
  user: 1800,
  run: 2200,
};

const STORAGE_KEY: Record<BubbleKind, string> = {
  bot: "omb-bubble-width-bot",
  user: "omb-bubble-width-user",
  run: "omb-bubble-width-run",
};

/** Borde libre de cada burbuja: el del bot es el derecho; los otros, el izquierdo. */
export const BUBBLE_EDGE: Record<BubbleKind, "left" | "right"> = {
  bot: "right",
  user: "left",
  run: "left",
};

function storage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function clampBubbleWidth(kind: BubbleKind, px: number): number {
  if (!Number.isFinite(px)) return BUBBLE_DEFAULT_PX[kind];
  return Math.max(BUBBLE_MIN_PX, Math.min(BUBBLE_MAX_PX[kind], Math.round(px)));
}

/** Ancho guardado, o null si el usuario nunca lo ajusto (usa el default). */
export function loadBubbleWidth(kind: BubbleKind): number | null {
  try {
    const raw = storage()?.getItem(STORAGE_KEY[kind]);
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? clampBubbleWidth(kind, n) : null;
  } catch {
    return null;
  }
}

export function saveBubbleWidth(kind: BubbleKind, px: number | null): void {
  try {
    if (px == null) storage()?.removeItem(STORAGE_KEY[kind]);
    else storage()?.setItem(STORAGE_KEY[kind], String(clampBubbleWidth(kind, px)));
  } catch {
    // storage bloqueado: el ancho vale para esta sesion, no persiste.
  }
}

/** Escribe la variable CSS; con null vuelve al default de la hoja de estilos. */
export function applyBubbleWidth(kind: BubbleKind, px: number | null): void {
  try {
    const root = globalThis.document?.documentElement;
    if (!root) return;
    if (px == null) root.style.removeProperty(BUBBLE_CSS_VAR[kind]);
    else root.style.setProperty(BUBBLE_CSS_VAR[kind], `${clampBubbleWidth(kind, px)}px`);
  } catch {
    // sin DOM (SSR/tests): nada que aplicar.
  }
}

/** Aplica lo guardado al arrancar; se llama una vez desde el modulo de chat. */
export function applyStoredBubbleWidths(): void {
  (Object.keys(BUBBLE_CSS_VAR) as BubbleKind[]).forEach((kind) => applyBubbleWidth(kind, loadBubbleWidth(kind)));
}
