/** Personalizacion Manager (0027 / A7): el cuadro de actividades ("This run") recuerda
 *  si lo colapsaste. Una vez que el usuario lo colapsa, se queda colapsado aunque
 *  lleguen actividades nuevas; solo se reabre con su clic en el boton de expandir
 *  (o cuando una busqueda apunta a un paso de adentro). El estado de los pasos dentro
 *  de la conversacion vive aqui, en memoria del modulo, llave por corrida, para
 *  sobrevivir re-renderizados y remontajes del transcript dentro de la sesion. */
const openState = new Map<string, boolean>();

export function runOpenChoice(runId: string): boolean | undefined {
  return openState.get(runId);
}

export function setRunOpenChoice(runId: string, open: boolean): void {
  openState.set(runId, open);
  if (openState.size > 2000) {
    const first = openState.keys().next().value;
    if (first !== undefined) openState.delete(first);
  }
}

/** 0032 (A7): el colapso del cuadro "This run" (VerifyCard) es UNA SOLA preferencia
 *  GLOBAL —la misma en todos los hilos— que ademas sobrevive recargas de la PWA. Si el
 *  usuario lo cierra, se queda cerrado en todos los hilos hasta que lo abra manualmente;
 *  su eleccion siempre gana sobre el default por longitud. Se guarda en localStorage con
 *  una llave unica; `undefined` = el usuario aun no elige y cada cuadro usa su default. */
export const RUN_CARD_COLLAPSED_KEY = "omb-run-card-collapsed";

// Respaldo en memoria: si el almacenamiento esta bloqueado o ausente, la eleccion de
// esta sesion sigue mandando. Se prefiere sobre localStorage solo cuando ya se eligio.
let sessionChoice: boolean | undefined;

function storage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function runCardCollapsed(): boolean | undefined {
  if (sessionChoice !== undefined) return sessionChoice;
  try {
    const raw = storage()?.getItem(RUN_CARD_COLLAPSED_KEY);
    if (raw === "1") return true;
    if (raw === "0") return false;
  } catch {
  }
  return undefined;
}

export function setRunCardCollapsed(collapsed: boolean): void {
  sessionChoice = collapsed;
  try {
    storage()?.setItem(RUN_CARD_COLLAPSED_KEY, collapsed ? "1" : "0");
  } catch {
  }
}
