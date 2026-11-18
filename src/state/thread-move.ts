// A bot's active thread lives on the server (`bot.threadId`), and the server moves it on its own: a routine's run
// opening its own thread, a deleted thread handing over to the next one. The chat on screen never follows that by
// itself; these decide when a snapshot may replace the thread the person is reading.

interface Owner {
  threadId: string;
  switchingTo?: string;
  tasks?: ReadonlyArray<{ threadId: string }>;
}

/** Whether the thread the person has open is still one of the owner's threads in the frame. */
export function threadStillKnown(known: Owner | undefined, incoming: Owner): boolean {
  if (!known?.threadId) return false;
  if (known.threadId === incoming.threadId) return true;
  if (!incoming.tasks) return true;
  return incoming.tasks.some((task) => task.threadId === known.threadId);
}

/** A snapshot moves the owner to another thread while the one on screen still exists: the person asked for the switch
 * (`switchingTo`) or it is not their turn to be moved. */
export function serverMovedThread(known: Owner | undefined, incoming: Owner): boolean {
  if (!known || !incoming.threadId || incoming.threadId === known.threadId) return false;
  if (known.switchingTo === incoming.threadId) return false;
  return threadStillKnown(known, incoming);
}
