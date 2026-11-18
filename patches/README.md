# Parches de OMB-140-Merkle

Diferencias entre el fork **OMB-140-Merkle** y el original de GitHub
**OpenMausBot v0.1.140** (tag `v0.1.140`, commit `4b74b80`).

- Base limpia: `base-v0.1.140` = `4b74b80` (v0.1.140 sin parches).
- Rama de trabajo: `base-v0.1.140` + los 12 parches de esta carpeta.
- Total frente al original: **51 archivos de código (+1,372 / -411)**, en 12 parches.
  (`README-MERKLE.md`, la bitacora del fork, NO va en los parches.)
- **Cada parche aplica en orden** sobre `4b74b80`. Aplicados los 12 en secuencia, el arbol
  resultante es **identico** al fork actual (verificado: `git diff` vacio). Cada uno ya venia
  probado en alfa.

## Aplicar

```sh
cd <clone de OpenMausBot v0.1.140>
git checkout v0.1.140          # o 4b74b80
for p in 00*.patch 01*.patch; do git apply "$p"; done
```

Cada parche se genera con `git diff --binary` del commit correspondiente del fork
(`patches/` no incluye la bitacora `README-MERKLE.md`).

## Indice — parche -> mejora

| # | Parche | Que trae | Codigos | Archivos |
|---|---|---|---|---|
| 001 | `001-v140-A1-escritorio-vps-docker-over-ssh.patch` | Reponer `openssh-client` + `docker.io` en la imagen runtime (el escritorio del VPS se maneja por Docker-over-SSH) | v140-A1 (=130:0011) | `Dockerfile` |
| 002 | `002-v140-A2-A19-ui-alfa-lote-1.patch` | Rol fuera de la cabecera; markdown en los mensajes del **usuario**; narracion sin fondo; burbujas de usuario con texto largo sin recorte (incl. salas); Atelier con burbuja del usuario blanca; colapso global de "This run"; busqueda en tablas siempre; bloque de superficie (prompt del harness) compacto; borde del color del bot; sin logo de proveedor en el badge; barra superior (quita avatar/corona) | v140-A2,A3,A4,A5,A6,A7,A8,A9,A10,A16,A17 | `BotRole.tsx`, `ChatMarkdown.tsx`, `ChatView.tsx`, `GroupView.tsx`, `chat-bubble.ts`, `remark-user-format.ts`, `run-open-state.ts`, `RichTable.tsx`, `server/surface.ts`, `VerifyCard.tsx`, `ActivityRun.tsx`, `TurnNarrationRun.tsx`, `BotModelBadge.tsx`, `chat-bubble.ts`, `styles.css` |
| 003 | `003-v140-A17-A20-barra-superior-hilos-favicon.patch` | Barra superior sin avatar ni corona; desplegable de hilos con pastilla (nombre del hilo + total); favicon transparente con la cabeza al maximo; arregla el crash de A18 | v140-A18,A19,A20 | `ChatView.tsx`, `TaskPicker.tsx`, `ChatMoreMenu.tsx`, `app-icon-192.png`, `app-icon-512.png`, `app-icon.svg`, `apple-touch-icon.png` |
| 004 | `004-v140-B-ajustes-ui-lote-2.patch` | Alto de la pastilla del nombre = pastilla de hilos; fondo de tarjeta en las respuestas finales con formato; Atelier con "Color my messages" ya no tapa el texto; desplegable de hilos portado identico al de la 130 | v140-B | `ChatView.tsx`, `TaskPicker.tsx`, `styles.css` |
| 005 | `005-v140-C-this-run-colapso-global.patch` | "This run" recupera el colapso GLOBAL y durable de la 130 (localStorage, llave unica, sobrevive recargas) | v140-C (130:0032) | `VerifyCard.tsx`, `ChatView.tsx`, `run-open-state.ts` (+ prueba) |
| 006 | `006-v140-E-ajustes-ui-lote-3.patch` | Seis ajustes de sidebar/cabecera/menu: pie del rail, PhoneBar, menu de perfil, pagina de triggers y store | v140-E (A20) | `Sidebar.tsx`, `SidebarFooter.tsx`, `SidebarFooterNav.tsx`, `SidebarPhoneBar.tsx`, `SidebarProfileMenu.tsx`, `SidebarSimpleRail.tsx`, `TriggersPage.tsx`, `ChatMoreMenu.tsx`, `ChatView.tsx`, `ModelPicker.tsx`, `model-picker-open.ts`, `store.tsx` |
| 007 | `007-v140-F-ajustes-ui-lote-4.patch` | Pastilla del nombre +2 espacios; rail avanzado mas compacto; ancho de la columna colapsada igual a la simple; un Enter = una linea en el markdown del usuario con formato | v140-F | `Sidebar.tsx`, `SidebarFooter.tsx`, `SidebarFooterNav.tsx`, `ChatView.tsx`, `ChatMarkdown.tsx`, `styles.css` |
| 008 | `008-v140-G-rail-colapsado.patch` | Rail colapsado 2 px mas junto que la 130 (arriba y pie) y pastilla del bot a la derecha en modo simple | v140-G | `Sidebar.tsx`, `SidebarFooter.tsx`, `SidebarFooterNav.tsx`, `ChatView.tsx` |
| 009 | `009-v140-H-rail-avanzado-mango-burbujas.patch` | Rail avanzado colapsado a los tamanos de la 130 (2 px mas junto) y mango de ancho de burbujas (0010) portado a la 140 | v140-H (130:0010) | `BubbleResizeHandle.tsx`, `bubble-width.ts`, `ChatView.tsx`, `Sidebar.tsx`, `SidebarFooter.tsx`, `SidebarFooterNav.tsx`, `SidebarPhoneButton.tsx`, `SidebarProfileMenu.tsx`, `ChromeRailToggle.tsx`, `UpdateIndicator.tsx`, `VerifyCard.tsx`, `main.tsx`, `styles.css` |
| 010 | `010-v140-I-model-picker-compositor-130.patch` | Selector de modelos anclado al menu de 3 puntos (A21) y compositor de captura de la 130 (caja 2 renglones + emojis, sin sacar el texto de la fila) | v140-I (A13/A14/A15/A21) | `Composer.tsx`, `ComposerEmoji.tsx`, `ChatView.tsx`, `package.json`, `pnpm-lock.yaml`, `en.json` |
| 011 | `011-v140-J-reorden-bots-setup-iconos.patch` | Reorden de bots con asa de arrastre (a la 130); boton `/setup` en el compositor; iconos distintos en el menu `/` (`/goal` diana, `/learn` birrete, `/setup` libro) | v140-J (130:0014/0015) | `Sidebar.tsx`, `SidebarBotDrag.tsx`, `sidebar-bot-drop.ts`, `Composer.tsx`, `SlashCommandMenu.tsx`, `en.json` |
| 012 | `012-v140-K-asa-nombre-arrastre-rail.patch` | Asa de arrastre entre el avatar y el nombre; arrastre de bots con el rail colapsado (como la 130) | v140-K | `Sidebar.tsx` |
| 013 | `013-v153-0012-reaplicado-y-cosmeticos-emojis.patch` | Re-aplica el aislamiento de computadoras por instalacion y los cosmeticos de emojis de la barra superior y el compositor | v153 | `server/*`, `src/components/*` |
| 014 | `014-v165-fondo-sin-modelos-de-imagen.patch` | El selector de modelo de fondo y el de turno rapido ya no eligen modelos de imagen (nano-banana se colaba por el nombre); ancla `OMB_BACKGROUND_MODEL` | v165 (incidente 2026-11-17) | `server/model-kinds.ts`, `server/turn-route.ts`, `server/drivers/codex-background-text.ts` (+ pruebas) |

| 015 | `015-v165-coordinacion-sin-duplicar.patch` | Coordinacion del Chief: fusiona el parrafo de equipos con la regla del SOUL (un solo lugar para "presenta el bot y su modelo"), parte el bloque de delegacion en entrega y retorno, y quita repeticiones ("one point of contact" dos veces, el manejo del resultado del tool duplicado) | v165 (2026-11-17) | `server/chief-of-staff.ts` (+ prueba) |
| 016 | `016-v165-riel-menos-hueco-y-letra-mensajes.patch` | Riel colapsado: quita la banda muerta de 24 px del vidrio, encoge el bloque de iconos y deja 4 px entre ellos, para que quepa un avatar mas; letra de las burbujas 15/22 a 17/25 (el compositor se queda en 15 px) | v165 (2026-11-17) | `src/components/Sidebar.tsx`, `src/components/SidebarFooter.tsx`, `src/components/SidebarFooterNav.tsx`, `src/components/chat-bubble.ts`, `src/components/ChatView.tsx`, `src/components/GroupView.tsx`, `src/components/BubbleEditor.tsx`, `src/styles.css` (+ pruebas) |

| 017 | `017-v165-tablas-columnas-numericas.patch` | Tablas del chat: el boton de ordenar va antes del rotulo cuando la columna es de numeros (alineado con las cifras) y despues cuando es de texto; todas las columnas numericas comparten un ancho calculado del valor mas largo; en tablas de 2 a 4 columnas todas van iguales; y el menos tipografico (U+2212) cuenta como signo, asi una columna con -200.00 se reconoce como numerica | v165 (2026-11-17) | `src/components/RichTable.tsx`, `src/components/MarkdownTable.tsx`, `src/lib/table-data.ts` (+ pruebas) |
| 018 | `018-v165-vps-desktop-lease.patch` | Escritorio del VPS: deja de reinspeccionar el contenedor completo en cada turno. Una concesion de 3 min recuerda el estado ya verificado; a partir del minuto se comprueba con una sonda barata del driver sobre el mismo id de contenedor. Se revalida en pleno si cambia o se para el contenedor, si falla un frame o si vence la concesion. Quita 6-8 s de cada turno y deja el arranque en menos de 300 ms | v165 (2026-11-17) | `server/vps-computer.ts` (+ pruebas) |

| 019 | `019-v165-concesion-renovable.patch` | Escritorio del VPS: la concesion del 018 se renueva con cada sonda buena (antes caducaba a los 3 min y el turno siguiente pagaba los 6-8 s de la inspeccion completa). TTL de 3 a 10 min y techo duro de 30 min, que fuerza una inspeccion completa aunque la sonda responda, para que nada se apoye en una sola lectura en toda la sesion | v165 (2026-11-17) | `server/vps-computer.ts` (+ pruebas) |

| 020 | `020-v165-no-seguir-cambio-de-hilo.patch` | El cliente ya no sigue en silencio un cambio de hilo que hace el servidor (una rutina que abre su propio hilo, un hilo borrado que pasa el turno al siguiente): conserva el chat que se esta leyendo, marca el otro hilo como no leido y, si llega el brief del dia, avisa en vez de abrirselo encima. El cambio pedido a mano (`switchTask`) y el hilo que de verdad desaparecio siguen funcionando igual | v165 (2026-11-17) | `src/state/store.tsx`, `src/state/thread-move.ts`, `src/hooks/use-presence.ts`, `src/locales/{en,es}.json` (+ pruebas) |
| 021 | `021-v165-urls-como-ligas.patch` | Un URL escrito suelto (sin comillas invertidas) en el mensaje del usuario se dibuja como liga y abre en ventana nueva, igual que los del bot; en Atelier la liga dentro de la burbuja blanca recupera su tono (antes quedaba casi invisible) | v165 (2026-11-17) | `src/lib/remark-user-format.ts`, `src/styles.css` (+ prueba) |

## Notas
- El 020 va despues del 019. Toca el reducer del cliente (`src/state/store.tsx`), el nuevo
  `src/state/thread-move.ts` y la presencia; ningun otro parche toca esos archivos. La regla nueva:
  un frame o una rehidratacion que mueve `bot.threadId` sin que el cliente lo haya pedido
  (`switchingTo`) y con el hilo en pantalla todavia en la lista NO cambia el chat; el otro hilo
  queda marcado como no leido. Cambio de contrato: `snapshot-navigation.test.ts` ya no exige
  aceptar el hilo del servidor al reconectar.
- El 021 va despues del 020. Toca el formateo del texto del usuario y el CSS de Atelier; ningun
  otro parche toca esos archivos. Si otro parche cambia las ligas o el tono de la burbuja, este
  va despues.

## Despliegue del 020 y el 021 (2026-11-18)

- **Solo beta.** `beta.merkle.space` corre el bundle con los dos parches desde el 2026-11-18 00:55 UTC,
  copiado en caliente dentro del contenedor `omb-v165-omb-1` (imagen `v0.1.165-r10`), **sin parar ni
  recrear nada**: Jose pidio no reiniciar porque habia otro proceso trabajando. Los hashes del `dist`
  del contenedor son identicos a los del arbol.
- **Alfa no se toca.** `alfa.merkle.space` ya esta en la v167; los dos parches son de la linea v165.
- **Falta hornear `r11`** para que el cambio sobreviva a una recreacion del contenedor (copiar `dist` y
  `dist-server`, con `pnpm build:server` antes).
- De paso se corrigio una prueba que ya fallaba antes de estos parches: en
  `server/drivers/background-model-selection.test.ts:66` el `SmallModelFallback` del 014 se pasaba sin
  `refused` ni `onRefused`, y `tsc -b` del script `build` se detenia ahi. Los dos campos son obligatorios
  desde el commit del upstream `878e32cb9`; se agregaron al literal de la prueba.


- El 019 va despues del 018 y toca los mismos dos archivos: aplica en secuencia, no suelto.
  La sonda barata sigue siendo la misma; solo renueva la concesion y se respeta el techo de 30 min.

- El 018 va despues del 017 y solo toca `server/vps-computer.ts` y su prueba: no comparte
  archivos con ningun otro parche. La concesion solo se usa con el runner real; con un runner
  inyectado (pruebas, diagnostico) la inspeccion sigue siendo completa como antes.

- El 014 va despues del 013, no comparte archivos con los anteriores y no depende de su orden.
- El 015 solo toca `server/chief-of-staff.ts` y su prueba: no comparte archivos con ningun otro parche.
  Baja las reglas fijas de coordinacion de 4,996 a 4,109 bytes (y el bloque completo con 13 bots de 7,546 a 6,661).
- El 016 va despues del 015. Toca la barra lateral y la tipografia del chat; ninguno de esos
  archivos lo toca el 015. `ChatView.conversational.test.ts` fija `text-[17px]` y `leading-[25px]`:
  si otro parche cambia la burbuja, este va despues.
- El 017 va despues del 016. Toca las tablas (`RichTable`, `MarkdownTable`) y el lector de cifras
  (`table-data`); ningun otro parche toca esos archivos. `MarkdownTable` pide columnas iguales en
  tablas de 2 a 4 columnas: si otro parche cambia el dibujo de tablas, este va despues.
- Los parches 002, 003 y 006 tocan varios archivos en comun (`ChatView.tsx`, `ChatMoreMenu.tsx`):
  van en el mismo orden en que se hicieron, por eso aplican limpio en secuencia. Aplicarlos
  sueltos o en otro orden puede fallar.
- Las imagenes (favicon) van en binario dentro del parche 003 (`git diff --binary`).
- La bitacora completa, con el detalle de que cambio cada version, esta en `README-MERKLE.md`
  en la raiz del fork.
