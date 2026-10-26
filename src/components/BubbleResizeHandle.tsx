import { useEffect, useRef, useState } from "react";

import {
  BUBBLE_DEFAULT_PX,
  BUBBLE_EDGE,
  BUBBLE_MAX_PX,
  BUBBLE_MIN_PX,
  applyBubbleWidth,
  clampBubbleWidth,
  loadBubbleWidth,
  saveBubbleWidth,
  type BubbleKind,
} from "@/lib/bubble-width";

/** Doble clic en el mango devuelve el ancho por defecto (pedido de Jose: un
 * reset claro). El ancho vive por dispositivo (localStorage) y se aplica como
 * variable CSS en :root, compartida por todas las burbujas de ese tipo. */
export function BubbleResizeHandle({ kind, className }: { kind: BubbleKind; className?: string }) {
  const [dragging, setDragging] = useState(false);
  const current = useRef<number | null>(loadBubbleWidth(kind));
  const edge = BUBBLE_EDGE[kind];

  useEffect(() => {
    if (!dragging) current.current = loadBubbleWidth(kind);
  }, [dragging, kind]);

  const commit = (px: number | null) => {
    current.current = px;
    saveBubbleWidth(kind, px);
    applyBubbleWidth(kind, px);
  };

  // Medimos contra el contenedor: el ancho util de la burbuja es la distancia
  // del puntero al borde opuesto del padre (el extremo fijo por el que se ancla).
  const widthFromPointer = (handle: HTMLElement, clientX: number): number | null => {
    const parent = handle.parentElement;
    if (!parent) return null;
    const rect = parent.getBoundingClientRect();
    return edge === "right" ? clientX - rect.left : rect.right - clientX;
  };

  return (
    <div
      role="separator"
      aria-label="Ajustar ancho (arrastra; doble clic para restablecer)"
      aria-orientation="vertical"
      aria-valuemin={BUBBLE_MIN_PX}
      aria-valuemax={BUBBLE_MAX_PX[kind]}
      aria-valuenow={clampBubbleWidth(kind, current.current ?? BUBBLE_DEFAULT_PX[kind])}
      tabIndex={0}
      data-bubble-resize={kind}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        const next = widthFromPointer(event.currentTarget, event.clientX);
        if (next === null) return;
        const clamped = clampBubbleWidth(kind, next);
        current.current = clamped;
        event.currentTarget.setAttribute("aria-valuenow", String(clamped));
        applyBubbleWidth(kind, clamped);
      }}
      onPointerUp={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        setDragging(false);
        commit(current.current);
      }}
      onPointerCancel={() => {
        setDragging(false);
        commit(current.current);
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        commit(null);
      }}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const base = current.current ?? loadBubbleWidth(kind) ?? BUBBLE_DEFAULT_PX[kind];
        // Flecha hacia "ensanchar" segun el borde libre de cada tipo.
        const grow = (event.key === "ArrowRight" && edge === "right") || (event.key === "ArrowLeft" && edge === "left");
        commit(clampBubbleWidth(kind, base + (grow ? 24 : -24)));
      }}
      className={className}
    />
  );
}
