/** Personalizacion Manager (0027 / A7): el cuadro de actividades ("This run") recuerda
 *  si lo colapsaste. Una vez que el usuario lo colapsa, se queda colapsado aunque
 *  lleguen actividades nuevas; solo se reabre con su clic en el boton de expandir
 *  (o cuando una busqueda apunta a un paso de adentro). El estado vive aqui, en
 *  memoria del modulo, llave por corrida, para sobrevivir re-renderizados y
 *  remontajes del transcript dentro de la sesion. */
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

/** A7: estado de colapso del cuadro "This run" (VerifyCard), por hilo. `undefined` = sin
 *  eleccion del usuario todavia; el componente decide su default por longitud. */
const cardCollapsed = new Map<string, boolean>();

export function runCardCollapsed(key: string): boolean | undefined {
  return cardCollapsed.get(key);
}

export function setRunCardCollapsed(key: string, collapsed: boolean): void {
  cardCollapsed.set(key, collapsed);
  if (cardCollapsed.size > 500) {
    const first = cardCollapsed.keys().next().value;
    if (first !== undefined) cardCollapsed.delete(first);
  }
}
