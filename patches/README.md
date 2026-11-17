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

## Notas

- El 014 va despues del 013, no comparte archivos con los anteriores y no depende de su orden.
- Los parches 002, 003 y 006 tocan varios archivos en comun (`ChatView.tsx`, `ChatMoreMenu.tsx`):
  van en el mismo orden en que se hicieron, por eso aplican limpio en secuencia. Aplicarlos
  sueltos o en otro orden puede fallar.
- Las imagenes (favicon) van en binario dentro del parche 003 (`git diff --binary`).
- La bitacora completa, con el detalle de que cambio cada version, esta en `README-MERKLE.md`
  en la raiz del fork.
