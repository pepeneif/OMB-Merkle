# OMB-Propio-Merkle

Fork de trabajo propio de **Merkle.Space** sobre **OpenMausBot**. Vamos en la **v0.1.165**
de OpenMausBot. Este archivo es la bitacora de las modificaciones que aplicamos sobre el
original. Las secciones historicas de la 140 y la 143 se conservan abajo tal cual.

Ramas de trabajo:
- **`merkle/v165-port`** = estado vigente (v0.1.165 + nuestros parches; desplegado en alfa).
- `merkle/v154-port`, `merkle/v153-port`, `merkle/port-v143`, `base-v0.1.140` = etapas anteriores.

## Lista v140/A/B/C/D

### A — Parches que aplicamos a la 140
| Código | Qué es | Origen (en la 130) | Estado |
|---|---|---|---|
| v140-A1 | Reponer `openssh-client` + `docker.io` en la imagen runtime (el escritorio del VPS se maneja por Docker-over-SSH) | 0011 | APLICADO (001) + desplegado en alfa |
| v140-A2 | Ningún bot muestra su rol junto al nombre | A2 (0021) | APLICADO (en la 153, sigue en la 165) |
| v140-A3 | Formato markdown en los mensajes del USUARIO | A3 (0020) | APLICADO (en la 153, sigue en la 165) |
| v140-A4 | Narración interna: fondo transparente, 2 px menor, padding vertical a la mitad | A4 (0017/0030) | APLICADO (en la 153, sigue en la 165) |
| v140-A5 | Burbujas del usuario con texto largo sin recorte | A5 (0022) | APLICADO (en la 153, sigue en la 165) |
| v140-A6 | Tema Atelier: burbuja del usuario blanca, igual que la del bot | A6 (0023) | APLICADO (en la 153, sigue en la 165) |
| v140-A7 | Cuadro "This run" conserva el colapso (llave global, sobrevive recargas) | A7 (0032) | APLICADO (en la 153, sigue en la 165) |
| v140-A8 | Búsqueda dentro de las tablas siempre | A8 (0020) | APLICADO (en la 153, sigue en la 165) |
| v140-A9 | Bloque de superficie (prompt del harness) compacto | A15 (0037) | APLICADO (ef840d27f) + desplegado en alfa |

### B — Pendientes técnicos
| Código | Qué es | Estado |
|---|---|---|
| v140-B1 | Escritorio del VPS: construir/etiquetar la imagen de escritorio `cua-local-vm:driver-0.37.0-v8` (la 140 pide la capa v8; en el host solo hay v5/v6) | HECHO (imagen `59bff5bd748e`, capa 8) |
| v140-B2 | App iOS: por qué los hilos se despliegan distinto tras 107→130 | PENDIENTE |
| v140-B3 | Procedimiento alfa → producción (incremental vs de un jalón) | PENDIENTE |

### C — Ya ejecutadas
| Código | Qué es |
|---|---|
| v140-C1 | Fork `pepeneif/OMB-140-Merkle` creado + rama `base-v0.1.140` (v0.1.140 limpio) |
| v140-C2 | v0.1.140 desplegada en alfa (`alfa.merkle.space`) sobre un clon del dataset de producción |
| v140-C3 | Imagen `openmausbot:v0.1.140` reconstruida con el parche 001 y recreada en alfa (healthy) |

### D — Compactación / tamaño de datos
| Código | Qué es | Estado |
|---|---|---|
| v140-D1 | Compactación manual en la PWA | PENDIENTE |
| v140-D2 | `threads.eventLogMaxBytes` + `eventLogRetentionDays` | PENDIENTE |
| v140-D3 | Recortables fuera de `.openmausbot` | PENDIENTE |
| v140-D4 | `memory-journal` → wiki y podar | PENDIENTE |

## Bitácora de parches
- **v140-K (2026-11-05)**: dos ajustes de la ronda de alfa sobre el reorden de bots de v140-J. Commit `a4ca0e5c7`.
  (1) **Asa entre el avatar y el nombre**: en v140-J el asa `GripVertical` iba anclada al borde derecho de la fila
  (absoluta, `right-9` / `right-[6.25rem]`), asi que caia a media fila y costaba verla. Ahora el asa vive **en
  linea, dentro del bloque del nombre**, justo despues del avatar y antes del nombre (se dibuja al hover / foco,
  como antes); sigue siendo la unica fuente de arrastre de la fila expandida.
  (2) **Arrastrar bots con el rail colapsado (a la 130)**: en el rail de solo iconos el arrastre no funcionaba
  porque `sidebarLayoutInteractive` es `false` con densidad `icons` y el hook marcaba el reorden como no movible,
  de modo que las filas no recibian `drag.handle`. Se mantiene el reorden habilitado cuando la densidad es
  `icons` (`enabled: (sections.interactive || density === "icons") && !phone`), asi que la fila entera del rail
  vuelve a ser la fuente de arrastre, igual que en la 130.
  Toca `src/components/Sidebar.tsx` (asa en linea + `enabled` con `icons`). Prueba nueva en
  `Sidebar.departments.test.ts` ("keeps every row draggable in the icons-only rail"). Verificacion: `tsc` limpio,
  `oxlint` 0/0, pruebas dirigidas **31/31** en verde (`Sidebar.departments` + `sidebar-bot-drop`).
- **001** (v140-A1): Dockerfile — repone `openssh-client` y `docker.io` en el paso apt del runtime,
  igual que la 130. Sin ellos OMB no alcanza el daemon Docker del VPS por SSH y el escritorio del bot
  no se crea, actualiza ni ve. Verificado en alfa: `ssh`/`docker` presentes y el daemon responde por SSH.
- **Imagen de escritorio v8** (v140-B1): construida con el Dockerfile que genera el propio OMB
  (`server/container-computer.ts` → `managedImageDockerfile`), base `trycua/xfce-cua@sha256:274eb6…`.
  Queda etiquetada `localhost/openmausbot/cua-local-vm:driver-0.37.0-v8` (`59bff5bd748e`), que es la
  referencia que la 140 espera (`IMAGE_LAYER_VERSION = "8"`).

- **v140-G (2026-11-04)**: dos ajustes de la ronda de alfa, commit `2a9b765b1`.
  (1) **Rail colapsado (modo simple, iconos)**: los dos grupos que Jose vio separados quedan **2px mas
  juntos que en la 130**. En la 130 el tope (Search + New) y la columna de botones usan `gap-1` (4px) y el
  pie `gap-0.5` (2px); en la 140 quedan **2px** arriba y **0** en el pie (`gap-0`), es decir 2px menos en
  ambos. Afecta `Sidebar.tsx` (data-sidebar-top-row y data-sidebar-top-buttons) y `SidebarFooter.tsx` +
  `SidebarFooterNav.tsx` (nav de tools y apilado del pie). Pruebas dirigidas actualizadas.
  (2) **Modo simple: la pastilla del bot** pasa del centro de la barra superior a la **derecha, junto al
  icono de Bot's screen**. En `ChatView.tsx` la fila de la cabecera usa `justify-end` en modo simple y la
  identidad deja de ser columna central (`col-start-2`/`justify-self-center` solo en modo avanzado). Prueba
  nueva en `ChatView.controls.test.ts`.

## No reciclable tal cual desde la 130
Los parches que tocan la UI o el compositor (A1, A2, A8, A9, A10, A11, A13, A14, A15 y 0020–0037)
chocan porque la UI de la 140 cambió. Se rehacen sobre la 140.

### Bitácora de parches (cont.)
- **v140-B (2026-11-04)**: cuatro ajustes de UI pedidos por Jose sobre el build de alfa —
  (1) la pastilla del nombre iguala el alto (36px) de la de hilos; (2) las respuestas finales con formato
  recuperan el fondo de tarjeta (`bg-card`) que el upstream quitó en `e00a082e3`; (3) Atelier con
  "Color my messages" ya no deja el texto blanco sobre blanco (tokens de tinta oscura dentro de la
  burbuja blanca); (4) el desplegable de hilos se porta idéntico al de la 130. Commit `8e4c339fa`.

- **v140-C (2026-11-04)**: dos puntos de la ronda de alfa.
  (1) *This run* recupera el colapso **global y durable** de la 130: una sola preferencia (misma en
  todos los hilos) en `localStorage` (llave `omb-run-card-collapsed`) que sobrevive recargas; se
  reabre solo con el clic. Se copió `src/lib/run-open-state.ts` de la 130 (+ su prueba) y se quitó la
  `storeKey` por hilo de `VerifyCard.tsx`/`ChatView.tsx`. Commit `2bd8f5c48`.
  (2) El selector de hilos no plegaba las corridas de automatización porque el **clon de datos** de
  alfa había perdido la marca `routineRunId` en 49 tareas y le faltaban 44 hilos (incluido
  "Automatizaciones · Log"); no era el código (el selector es idéntico al de la 130). Se **re-clonó**
  el volumen `omb_140_data` desde `omb_prod_data` (15.2G, beta en solo-lectura), se borró el lease del
  clon y se deshabilitaron las 9 rutinas activas en alfa para no duplicar informes. Resultado:
  193 tareas, 89 con marca, hilo Log presente y sobrevive al arranque.

- **v140-E (2026-11-04)**: seis ajustes de UI de la ronda de alfa. Commit `6a53606a6`.
  (1) La pastilla del nombre del bot (arriba a la derecha) lleva más aire a la izquierda: `pl-1.5` → `pl-3`
  (era el punto donde el nombre quedaba pegado al borde). (2) Los avatares del rail/lista encogen ~10%:
  36→32, 44→40, 32→29. (3) Automations y Triggers se separan como en la 130: Automations pasa al icono de
  calendario (`CalendarDays`, `scope: "schedules"`) y Triggers al rayo (`Zap`, `scope: "triggers"`); se
  porta `scope` a `routinesFocus` (store) y el filtro/título a `TriggersPage`, también en la barra del
  teléfono. (4) Team map usa el organigrama (`Network`) y no el de personas, en el footer, el menú de cuenta
  y la barra del teléfono. (5) Los iconos de arriba y abajo del rail se acercan ~10%
  (`gap-2`→`gap-[7px]`, `gap-1`→`gap-[3.5px]`). (6) A20: elegir el modelo o la intensidad en el menú ⋯ abre
  el **selector de modelos del chat** como en la 130 (no los ajustes): se monta un `ModelPicker` oculto en la
  cabecera avanzada más un store de petición (`src/lib/model-picker-open.ts`) que lo abre; si no hay selector
  montado para el hilo, cae a los ajustes. Pruebas dirigidas en verde (salvo 2 fallos preexistentes del
  badge de motor en `Sidebar.simple-mode.test.ts`, ajenos a este trabajo; se corrigieron aparte 3 expectativas
  obsoletas del menú ⋯ que el propio A18 había dejado atrás).

- **v140-F (2026-11-04)**: refinamientos de la ronda de alfa (modo **avanzado**), commit `88b3ca3fe`.
  (1) La pastilla del nombre del bot (arriba a la derecha) suma otros 2 espacios a la izquierda:
  `pl-3` → `pl-[18px]`. (2) Rail avanzado: los iconos de la parte superior van 3px más cerca del borde
  (`pt-3.5`→`pt-[11px]`) y los de arriba y abajo quedan 1px más juntos entre sí
  (`gap-[3.5px]`→`gap-[3px]` arriba; `gap-1`→`gap-px` en la navegación inferior del pie). (3) **Ancho de la
  columna colapsada**: Avanzada y Simple miden lo mismo (`w-[80px]`→`w-[72px]` en ambas; antes la Avanzada
  era `w-[80px]` y la del rail simple `w-[92px]`), es decir 8px menos que la 130 (`avatarsWidth` 92→72).
  (4) **Formato del texto del usuario**: con markdown activo, un solo `Enter` volvía a pintar una línea en
  blanco de más; se porta el arreglo `0027 (A3 fix)` de la 130 — `.chat-md { white-space: normal }` en
  `src/styles.css`, para que el `<br>` del render no herede el `pre-wrap` de la burbuja (el render emite un
  `\n` literal tras cada `<br>`; con `pre-wrap` se pintaba como segunda línea). Prueba nueva en
  `ChatMarkdown.test.ts`. Pruebas dirigidas **265/265** y `tsc --noEmit` limpio (los 6 fallos de
  `Sidebar.simple-mode.test.ts`/`BotModelBadge.test.ts` son preexistentes, idénticos en HEAD).

- **v140-H (2026-11-05)**: dos puntos de la ronda de alfa. Commit `94b64cf52`.
  (1) **Rail avanzado colapsado**: los cuadros de los iconos se encogen a los tamanos de la 130 — arriba
  (busqueda, actividad, nuevo) y el boton de plegar de `size-[46px]` a **`size-8`** (32px) y el pie
  (automatizaciones, triggers, apps, team map, files, estado del dispositivo) de `size-[46px]`/`size-10`/
  `size-11` a los de la 130: `NavRow` iconsOnly `size-10`, telefono `size-10`, update `size-10`, perfil
  `size-10` (rail) / `size-11`, `ChromeRailToggle` `size-8`. Con los huecos ya 2px menores que la 130, los
  dos grupos quedan de verdad ~2px mas juntos. Toca `Sidebar.tsx`, `SidebarFooterNav.tsx`,
  `SidebarPhoneButton.tsx`, `SidebarProfileMenu.tsx`, `UpdateIndicator.tsx`, `ChromeRailToggle.tsx` y el pie
  de `SidebarFooter.tsx` (`gap-[3px]`→`gap-[2px]`). Pruebas de cabecera del rail actualizadas.
  (2) **Mango de ancho de burbujas (0010) portado a la 140**: se copian `src/lib/bubble-width.ts` y
  `src/components/BubbleResizeHandle.tsx` de la 130; se anade el bloque `.bbl`/`.bbl-handle` a
  `src/styles.css` (unlayered, como en la 130), el mango en `ChatView.tsx` (independiente para tus burbujas,
  las del agente) y en `VerifyCard.tsx` (la tarjeta "This run", con `bbl-run`), y `applyStoredBubbleWidths()`
  en `main.tsx`. Se guarda por dispositivo (localStorage), doble clic restablece, y en tactil se oculta.
  El ancho por defecto de "This run" en la libreria queda en 352px (22rem), su ancho de la hoja en la 140.
  `tsc --noEmit` limpio; pruebas dirigidas en verde (salvo 2 fallos PREEXISTENTES del badge de motor en
  `Sidebar.simple-mode.test.ts` y 1 en `ChatView.conversational.test.ts`, identicos en HEAD limpio).

- **v140-J (2026-11-05)**: tres puntos de la ronda de alfa. Commit `df97a9cfa`.
  (1) **Reordenar los bots como en la 130**: la 140 habia quitado el asa de arrastre y cambiado el soltar, de
  modo que el centro de una fila creaba un departamento nuevo en vez de reordenar. Se restaura el gesto de la
  130: cada fila vuelve a mostrar el asa `GripVertical` (`data-bot-drag-handle`, al hover) como unica fuente de
  arrastre, y el soltar coloca el bot **antes** (mitad superior) o **despues** (mitad inferior) de la fila bajo
  el puntero, siempre reordenando. Crear un departamento queda en el menu del bot ("New department"), que ya lo
  ofrecia. En el rail de solo iconos la fila entera sigue siendo la fuente de arrastre, sin asa. Cambia
  `src/lib/sidebar-bot-drop.ts` (`botDropPlace(offset, height)` sin `group`) y `src/components/SidebarBotDrag.tsx`
  (`BotRowDrag` separa `row` —solo destino— y `handle` —fuente—); en `Sidebar.tsx` se anade el asa y se engancha
  `drag.handle` a la fila cuando es `iconOnly`. Alt+Up/Down no cambia. Se conserva el resaltado de "nuevo
  departamento" para el menu. Pruebas de `sidebar-bot-drop` y `Sidebar.departments` actualizadas.
  (2) **Boton `/setup` en el compositor**: en modo Avanzado, en el hueco de la fila de arriba entre el nivel de
  aprobacion y "en donde corre" (columna 1, fila 1), se anade un boton con el icono de libro abierto (`BookOpen`)
  que arranca un borrador `/setup ` igual que `/learn` arranca el suyo (`setupTask`). Solo aparece cuando el bot
  soporta agentes y no es un grupo. Clave nueva `composer.setupTask` en `en.json`.
  (3) **Iconos distintos en el menu `/`**: hoy `/learn` y `/setup` compartian `BookOpen`. Ahora `/learn` usa el
  birrete (`GraduationCap`, el icono a la derecha de Goal) y `/setup` conserva el libro abierto, de modo que los
  tres comandos preconstruidos (`/goal` diana, `/learn` birrete, `/setup` libro) tienen icono propio. Toca
  `src/components/SlashCommandMenu.tsx`.
  Verificacion: `tsc` limpio; pruebas dirigidas **46/46** en verde (los 2 fallos del badge de motor en
  `Sidebar.simple-mode.test.ts` son PREEXISTENTES, identicos en HEAD limpio).

- **v140-I (2026-11-05)**: dos puntos de la ronda de alfa. Commit `bb13928c6`.
  (1) **Selector de modelos anclado al menu de 3 puntos** (A21): en modo Avanzado el menu ... abre el selector
  de modelos del chat (A20), pero su ventana abria muy a la izquierda y no parecia relacionada con el menu. El
  `ModelPicker` oculto de la cabecera se ancla ahora al borde inferior-derecho del contenedor de controles
  (`data-chathead-controls`, que pasa a `relative`; el picker va en un `div absolute right-0 top-full`), que es
  donde vive el menu ..., de modo que su popover abre pegado y alineado con ese menu. Se saca del flujo para no
  meter un hueco de `gap`.
  (2) **Compositor de captura con la caja de la 130** (0035/0036 portado): la 140 tenia un comportamiento propio
  (con poco texto la caja iba entre los iconos y al pasar de un renglon el texto se subia encima de todos los
  iconos, con `useStackedField`). Se porta el compositor NanoBot de la 130 a la 140: `ComposerEmoji.tsx` (con la
  dependencia `emoji-picker-react` 4.18.0 y su lockfile), insercion del emoji en el caret (`insertEmoji`),
  cluster izquierdo del modo Avanzado en **dos renglones** (aprobacion y lugar arriba; meta/Objetivo, learn —si
  el icono existe— y adjuntar abajo; emojis arriba de adjuntar) y la caja de texto en `rows={2}` / `min-h-14`.
  Se **quita el apilado** (`useStackedField`) de la 140: el texto ya no se sube encima de los iconos y se queda
  junto a los botones con uno o varios renglones, como en la 130. El icono de learn es opcional (emojis van
  aunque no este). Pruebas: `ComposerEmoji.test.ts` y `Composer.emoji.test.ts` nuevas; `Composer.simple.test.ts`
  (bloque del apilado reescrito) y `ChatView.controls.test.ts` (min-h-14) actualizadas. `tsc --noEmit` limpio;
  pruebas dirigidas **187/187** en verde (los fallos preexistentes —2 del badge de motor en
  `Sidebar.simple-mode.test.ts` y 1 de `bg-card` en `ChatView.conversational.test.ts`— son identicos en HEAD).

---

# Port a la v0.1.143 (rama `merkle/port-v143`) — historico

Rama **100% aparte** de la 140 (alfa sigue con la 140 intacta). Base: tag limpio
`v0.1.143` (`c8e40ffbb`). Estrategia: **una sola fusion a 3 vias** del estado parcheado
de la 140 (commit `1bb466d2a` = `base-v0.1.140` + 12 parches + bitacora) contra `v0.1.143`
(`git merge --no-commit --no-ff 1bb466d2a`; merge-base = `4b74b80` = v0.1.140).
Commit del merge: `99672b8ec`.

## Los 13 archivos con conflicto (resueltos)

Regla de resolucion: **la base 143 manda**; encima se re-aplica solo NUESTRA intencion.
`package.json` (+ `emoji-picker-react` junto a `imapflow`), `pnpm-lock.yaml` (regenerado con
`pnpm install`), `src/main.tsx` (+ `applyStoredBubbleWidths`), `TurnNarrationRun.tsx`
(titulo por corrida con `run-open-state`), `en.json` (union + `composer.emoji`),
`ChatMarkdown.tsx` (props `originals` + `underline`), `ChatView.tsx` (cabecera 143 +
ModelPicker oculto A21; `ChatHeadRole` sin `chiefOfStaffBadge`), `ChatMoreMenu.tsx`
(`UsageBars` 143 + `openModelPicker`), `Sidebar.tsx` (rail fix + panel `SidebarActiveThreads`
de la 143, sin duplicar), `SidebarFooterNav.tsx` (lucide union + `useMemo`/`ReactNode`),
`TriggersPage.tsx` (labels propios + h1 condicional 143), `Composer.tsx` (`useTallPill`; sin
`useDesktopCapabilities`/`useStackedField`, que la 143 no tiene), `GroupView.tsx`
(`borderColor` por bot + `intlLocale()`).

## Parche 012 reducido (el punto de Jose)

El parche **012 (v140-K)** traia dos mitades:
- **Mitad A (descartada en el port):** asa `GripVertical` en linea (avatar-nombre) en modo
  expandido. En la 143 **sobra**: la fila completa ya es la fuente de arrastre.
- **Mitad B (conservada, es el PR):** habilitar el arrastre con el rail **colapsado**:
  `enabled: (sections.interactive || density === "icons") && !phone`. En la 143
  `sidebarLayoutInteractive()` da `false` con `density === "icons"`, por eso en el rail
  colapsado las filas no eran arrastrables.

## Verificacion

`tsc -p tsconfig.json --noEmit` limpio. Pruebas dirigidas de los modulos tocados
**1038/1038** en verde; guards (`Sidebar*`, `sidebar-bot-drop`, ratchet de tamano) **571/571**.
Build de produccion (`vite build`) OK.

**4 pruebas actualizadas** (divergencias intencionales de nuestros parches, ya presentes en la
140 parcheada; NO eran regresiones del merge):
- `Sidebar.simple-mode.test.ts` (x2): A16 quita el logo de proveedor del avatar → ahora se
  afirma que el `model-badge` **no** aparece ni en el rail ni en Avanzado.
- `ChatView.conversational.test.ts`: el parche B pone fondo de tarjeta en la respuesta final
  con formato; en Avanzado la burbuja **si** lleva `bg-card`.
- `GroupView.message-actions.test.ts`: el parche D5/A5 deja de recortar los mensajes del
  usuario → ya no aparece "Show full message".

**Ratchet de tamano** (`scripts/testing/file-size-ratchet.test.ts`): subidos los limites de
`Sidebar.tsx` (1697), `ChatView.tsx` (1317), `GroupView.tsx` (1234), `ModelPicker.tsx` (1048)
y anadido `Composer.tsx` (1041), como ya hizo el fork de la 140 (rama privada).

## Estado

Sin desplegar. Alfa sigue con la 140. Se despliega a alfa solo si Jose lo aprueba.

---

# Port a la v0.1.165 (rama `merkle/v165-port`) — estado vigente

Estado actual del fork: **OpenMausBot v0.1.165 + nuestros parches**, desplegado en alfa
(`alfa.merkle.space`). Se parte de `merkle/v154-port` (no de la 153), asi que el salto es de
una version: fusion de la etiqueta `v0.1.165` (commit `0bf450c39`) sobre la 154 parcheada.
Merge resuelto en el commit `1768cc812`.

Commits de la rama:
- `1768cc812` — port a v0.1.165: merge resuelto sobre `merkle/v154-port`.
- `6cd0c1e23` — parches que el merge no arrastro: compositor de la 153 (orden de iconos y
  emoji), asa tactil, nocturno del CI apagado, 013 portado (aislamiento de computadoras por
  instalacion + pastillas de cabecera).
- `ad04cbe82` — 012 y 013 sincronizados con la 153.

## Los 7 archivos con conflicto (resueltos)

`Dockerfile`, `scripts/testing/file-size-ratchet.test.ts`, `src/components/ChatView.tsx`,
`src/components/GroupView.tsx`, `src/components/Sidebar.tsx`, `src/main.tsx` y
`src/state/store.tsx`. Regla: se conserva lo nuestro y se adopta lo nuevo de la 165 encima.

## Lo que conservamos

Cabecera 0010 sin pildora, selector de hilo con el titulo del hilo actual, compositor con
selector de emojis, markdown en los mensajes del usuario, borde del color del bot en
`GroupView`, rail de 72 px. Ratchet subido a `ChatView` 1351, `Sidebar` 1694, `GroupView` 1229,
`ModelPicker` 1048 y `Composer` 1059 (este ultimo porque nuestro compositor lo paso de 1,000).

## Parches que el merge no arrastro y se re-aplicaron

| Parche | Que hacia | Como quedo |
|---|---|---|
| 013 | Acomodo del compositor (libro/birrete/emoji/clip), `absoluteStrokeWidth` del emoji, pastillas de cabecera con `bg-raised/60` y **aislamiento de computadoras por instalacion** | Aplicado |
| Nocturno del CI | `schedule: cron "17 21 * * *"` apagado el 2026-11-15 | Se habia reactivado; apagado otra vez (comentado en `.github/workflows/ci.yml`) |
| Asa de arrastre | `touch:opacity-100` para que se vea en pantalla tactil | Aplicado |
| 0008 | `MESSAGE_PAGE_SIZE` de 200 a 50 | Vive ahora en `src/state/message-history.ts`; valor 50 |
| 0037 | Bloque de superficie del harness compacto | Rehecho a mano sobre el `server/surface.ts` nuevo (ahorro de 98 bytes por turno, no 478: la 165 ya habia recortado) |
| Skill de Netlify | `publish-to-netlify` apagado (`defaultEnabled: false`) y fuera del rail, barra del telefono y menu de perfil | Aplicado |

El aislamiento del 013 era el importante porque los datos se clonaron de produccion: el hash
del nombre de cada VM incluye ahora el `environment-id`. Alfa resuelve `…-52d1bced558b` y
produccion `…-83dd946e8eb8`; antes ambas caian en `…-56f06f9de0ac`.

## Verificacion

`tsc` limpio en cliente y servidor. 106 pruebas dirigidas en verde (compositor, emoji, sidebar
y selector de modelo). Bundle reconstruido y servido.

## Despliegue en alfa (2026-11-17 03:25 UTC)

- Contenedor `omb-165-omb-1`, proyecto compose `/home/pepeneif/deploy-165`, red host,
  puertos **9899** (app) y **9900** (webhooks). Imagen `openmausbot:v0.1.165-r6` (las `r1`-`r5` quedan para revertir).
- Volumen propio `omb_165_data`: copia en caliente del `omb_143_data` + delta tras parar la
  149 (`stop -t 60`, exit 0, lease liberado). `messages.db` con md5 identico al de la 153.
- Vhost de Caddy sin cambios (sigue apuntando a 9899).
- Reversion: `omb_143_data` intacto (17 GB) y `omb-149-omb-1` parado, no borrado; compose y
  `.env` de la 153 en `/home/pepeneif/bak-alfa-v153-20261117/`. Volver =
  `cd /home/pepeneif/deploy-165 && docker compose down` y luego
  `cd /home/pepeneif/deploy-149 && docker compose up -d`.
- Produccion (`omb-prod-omb-1`, 8899) no se toco.

## Pendiente

- `merkle/v154-port` tambien quedo con este README desactualizado (encabezado de la 140); no
  afecta ejecucion.
- Este archivo no se ha commiteado en la rama `merkle/v165-port`.

### Incidente 2026-11-17 04:45 UTC — el escritorio del VPS no arrancaba

Sintoma: al pedir una tarea salia "Prepare the pinned OpenMausBot Cua image on the VPS
(Driver 0.37.0)" y el panel de pantalla decia "Couldnt reach the bots screen".

Dos causas, ambas del mismo origen: las imagenes `r2`-`r4` se construian con
`.Dockerfile.dist`, que solo copiaba `dist` (el bundle web) y **no** `dist-server`. El
servidor dentro del contenedor seguia siendo el de la construccion de las 02:40, anterior al
parche 013.

1. La 165 pide la capa de imagen **9** (`cua-local-vm:driver-0.37.0-v9`), que no existia en el
   VPS; solo habia `v6` y `v8`. La capa 9 solo cambia el script de arranque del driver:
   agrega `--grant existing-profile`.
2. Sin el 013 en `dist-server`, `vpsContainerName()` calculaba el hash **sin** el
   `environment-id`, asi que alfa resolvia el contenedor de **produccion**
   (`…-56f06f9de0ac`, entorno `f4c6649a…`) en vez del suyo (`…-52d1bced558b`,
   entorno `a8ff433b…`). Por eso el `remove` respondia 409 "container OpenMausBot did not
   create".

Arreglo:
- Se construyo `localhost/openmausbot/cua-local-vm:driver-0.37.0-v9` encima de la `v8` con
  el flag y las etiquetas `cua-driver=0.37.0`, `image-layer=9`, `local-vm=1`.
- `.Dockerfile.dist` ahora copia tambien `dist-server`; se regenero el bundle con
  `pnpm build:server` y se construyo `openmausbot:v0.1.165-r6`.
- Se desplego `r6` en `deploy-165`, se retiro el escritorio viejo por la API y se aprovisiono
  de nuevo: `ready=true`, `desktopReady=true`, captura 200.

Verificado: escritorio de alfa `env=a8ff433b… layer=9 running`; produccion
(`omb-prod-omb-1` y su escritorio `…-83dd946e8eb8`) sin tocar; `beta` y `alfa` en 200.

### Parche 014 — el modelo de fondo eligió un modelo de imagen (2026-11-17)

Tras el corte a la v165 empezaron a salir llamadas a `google/gemini-nano-banana-2.1` con la llave
de OpenRouter, sin que ningún bot lo tuviera seleccionado. El selector de «modelo chico» de la 165
reconoce el modelo por nombre (`/[-.](?:luna|mini|nano)[-.]/`) y `nano-banana` califica como
pequeño, así que el motor lo eligió para todas las tareas de fondo (hilo `memory-…`): 44 llamadas,
397,090 tokens de entrada y 152,603 de salida. El registro local guarda `costUsd: null` para esas
llamadas, así que no aparecían en nuestros totales; nano-banana cobra por imagen, no por token.

El parche 014 (`patches/014-v165-fondo-sin-modelos-de-imagen.patch`):

- Añade `server/model-kinds.ts` con `isImageModel()`, que reconoce `nano-banana`, `dall-e`/`dalle`,
  `flux`, `stable-diffusion`, `sdxl`, `imagen`, `ideogram`, `recraft`, `seedream`, `midjourney` e
  `image`/`imagegen`/`text-to-image`.
- Lo aplica en **los dos** selectores: `codexBackgroundModel()` (tareas de fondo) y `fastModelFor()`
  (turno rápido). Un modelo de imagen ya no cuenta como modelo chico.
- Añade el ancla `OMB_BACKGROUND_MODEL`: si el catálogo lista ese modelo en el mismo proveedor, se
  usa tal cual. En los compose de alfa y beta va
  `OMB_BACKGROUND_MODEL: deepseek/deepseek-v4.1-flash-1017`.
- Pruebas nuevas: `server/drivers/background-model-selection.test.ts` (caso nano-banana colado como
  modelo chico) y dos casos en `turn-route.test.ts`. 73 pruebas en verde y `tsc` limpio.

Imagen `openmausbot:v0.1.165-r7` (`44d014e23df9`), desplegada en alfa y beta el 2026-11-17 12:04 y
12:07 UTC. Rollback: `r6` (`8814dd0bf64c`).

**Para el próximo upgrade:** el parche va dentro de la serie de la rama; después de cualquier
upgrade, comprobar en el uso de OpenRouter que no haya llamadas a modelos de imagen desde el hilo
`memory-…`. El detalle completo está en el expediente, documento `014-modelo-de-fondo-sin-imagenes`.
