# OMB-Propio-Merkle

> **Versión propia de Merkle.Space** — instalación **independiente** de OpenMausBot, hoy en
> **v0.1.171 + parches 022–031** (imagen `v0.1.171-cos-r10`).

Repo propio de **Merkle.Space** para nuestro uso personal. **No es un fork de trabajo del upstream**:
no seguimos conectados a `milind-soni/OpenMausBot` para mandar parches. Es nuestra copia, con nuestras
modificaciones, y aquí vive la bitácora.

- **Repo:** `pepeneif/OMB-Propio-Merkle` (público, independiente).
- **Rama por defecto:** `merkle/v171-cos-r10` → `e2cc7b13b`.
- **Estado:** idéntico al árbol con el que corre **alfa** (`openmausbot:v0.1.171-cos-r10`,
  digest `3f52d5c90d26`).
- El repo `pepeneif/OMB-Merkle` es el fork histórico del upstream (v0.1.130 → 171). **Este** repo es
  el que usamos nosotros; su historia desciende de `merkle/v170-cos` (`9947747aa`) y no se reescribió.

## Ramas

- **`merkle/v171-cos-r10`** = **estado vigente**: v0.1.171 + parches 022–031. Es lo que corre alfa.
- `merkle/v170-cos` (`9947747aa`) = anterior (v0.1.170 + 022 + 023 + gate).
- `merkle/v169-cos` (`d040e854`) = v0.1.169 + parches 001–022 + cosméticos + riel. Fue alfa y beta.
- `merkle/v169-port`, `merkle/v169-mcpgate`, `merkle/v167-port`, `merkle/v165-port`, `merkle/v153-port`,
  `merkle/port-v143`, `base-v0.1.140` = etapas anteriores, conservadas como historia.

## Cómo se armó la v0.1.171 (2026-11-19 a 21)

El árbol `~/omb-171-cos` parte de `2799c92e9` (*bump version to 0.1.171*, upstream) y encima lleva:

| Commit | Qué trae |
|---|---|
| `641d7460f` | Merge de la v0.1.170 sobre el port v169 con los 21 parches del linaje |
| `ba33cb05d` | **022** — la captura del navegador no se manda al chat: se guarda en disco (`browser-frames/`) |
| `50caf81c3` | **023** — el gate lista **tres herramientas** en vez del catálogo de computer y browser |
| `9947747aa` | **022** (cierre) — la decisión vive en el módulo; `index.ts` no crece |
| `844632ca8` | Merge de la v0.1.171 sobre el port v170 (022 + 023), salas a `RoomTextMessage` |
| `d6387e7e1` | **024** — fuera la pastilla «Chat activity» del chathead; sus dos interruptores viven en Ajustes › Apariencia › Chat |
| `1a2438f2e` | **023b** — el merge de la 171 tiró el guard de `buildDirectory`; lo repone y agrega la regresión |
| `bf73427a0` | **027** — barra superior vuelve a `flex`; tooltip del selector de hilos con el título completo; prueba del gate con el schema real |
| `31db9a5bf` | **028** — p0008 en la 171: página de red a 50, ventana retenida fija en 200/600 |
| `47cf2e3f2` | **029** — cerrada, la pastilla del hilo muestra el título completo en el tooltip, no las estadísticas de caché |
| `1890c4b63` | **030** — escritorio del VPS: multiplexado SSH por línea de comandos, concesión persistida y prueba perezosa |
| `e2cc7b13b` | **031** — compactación: presupuesto del resumen de 6,000 → 24,000 bytes |

Los `.patch` uno por uno están en `versiones-omb/parches/v171/` del sitio de datos
(`data.merkle.space/reportes/versiones-omb/parches/v171/`) y en `/home/pepeneif/omb-upgrade-docs/patches/v171/`.

## Qué cambia respecto a la v169

| Parche | Efecto |
|---|---|
| 022 | Las capturas del navegador van a `browser-frames/<turno>/` en el volumen, no como imagen al hilo |
| 023 | El gate de herramientas de computer/browser expone tres herramientas, no el catálogo entero |
| 024 | Se quita la pastilla «Chat activity» de la cabecera del chat (los interruptores pasan a Ajustes) |
| 026 | Repone `&& !builtDirectory` en la config del gate privado; sin eso, todo turno con `OMB_DIRECTORY_BUILTINS` se congelaba |
| 027 | Barra superior en `flex` (nombre, lápiz, hilos, copiar, descargar) y tooltip con el título completo del hilo |
| 028 | Paginación de red a 50 y ventana retenida fija en 200/600 |
| 029 | La pastilla del hilo ya no muestra estadísticas de caché; el tooltip lleva el título completo |
| 030 | `setup.computer` de 6,035–6,537 ms a 195–906 ms: `ControlMaster` forzado en la línea de comandos, concesión persistida con sonda y prueba perezosa del escritorio |
| 031 | `MAX_SUMMARY_BYTES` 6,000 → 24,000 y `DEFAULT_REBUILD_BYTES` 24,000 → 50,000; recortes consecutivos agrupados |

## Verificación

- `tsc --noEmit` limpio en cliente y servidor; `pre-push` con **128 guards** en verde.
- Pruebas dirigidas por parche: 81 del módulo de compactación (031), 58 de `mcp-gate-config` + `mcp-gate` (026),
  33 de `TaskPicker` (029), 105 de ChatView/TaskPicker/transcript (027), 61 de la concesión (019).
- Imagen `openmausbot:v0.1.171-cos-r10` (`3f52d5c90d26`, 2.13 GB), alfa `Up (healthy)` desde el
  2026-11-21 05:44:03 UTC, health `0.1.171` con `problems: []`.
- Turno real con navegador validado: «abre example.com» → `Example Domain`, PNG en `browser-frames/`
  y **0** imágenes publicadas en el hilo.
- `context.compactAt` en alfa: **150,000**.

## Lo que hay que saber al instalar esta imagen

- **No hornea los CLI de los motores** (desde la `r5`). Viven en `<volumen>/_data/.openmausbot/tools/npm`
  (~438 MB). En un volumen que ya los tiene no hay que hacer nada; en uno vacío se instalan desde
  **Ajustes › Proveedores de modelos y cuentas** y hace falta red.
- **`compactAt` no viaja en la imagen**: es del `config.json` del volumen (beta lo tiene en 60,000).
- **La imagen no trae los ajustes del host**: Caddy, systemd, drop-ins de las PWA y túneles noVNC se
  quedan como están; el nombre del contenedor **no** cambia al subir de versión.

## Reversión

- Alfa: `/home/pepeneif/revertir-r10.sh` (compose a `r8`) y `revertir-r8.sh`.
- Beta: `/home/pepeneif/deploy-v165/docker-compose.yml.bak-pre-r3b-20261118T031927Z` → `docker compose up -d`
  (regresa a `v0.1.169-r3b`).
