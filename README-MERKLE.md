> **Versión propia de Merkle.Space** — fork de trabajo sobre **OpenMausBot v0.1.169**.
> Repo: `pepeneif/OMB-Propio-Merkle` · Bitácora de parches: este archivo.

# OMB-Propio-Merkle

Fork de trabajo propio de **Merkle.Space** sobre **OpenMausBot**. Vamos en la **v0.1.169**.
Este archivo es la bitácora de las modificaciones que aplicamos sobre el original. Las
secciones históricas de la 140, la 143, la 153 y la 165 se conservan en las ramas
`merkle/v153-port` y `merkle/v165-port`.

Ramas de trabajo:
- **`merkle/v169-cos`** = estado vigente (v0.1.169 + parches 001–022 + cosméticos + riel). Desplegado en alfa y beta.
- `merkle/v169-port` = port funcional de la v169 (sin cosméticos ni riel).
- `merkle/v167-port`, `merkle/v165-port`, `merkle/v154-port`, `merkle/v153-port`, `merkle/port-v143`, `base-v0.1.140` = etapas anteriores.

## Cómo se armó la v169 (2026-11-17 / 18)

El árbol `~/omb-169-cos5` (rama `merkle/v169-cos`) parte del upstream `b832de78c`
("chore(release): bump version to 0.1.169") y encima lleva cuatro commits:

| Commit | Qué trae |
|---|---|
| `a75a29d47` | Port del diff de la v167: 001 (Dockerfile), 0012/013 (aislamiento de computadoras), 014 (modelo de fondo sin modelos de imagen), 017 (tablas: columnas numéricas y el menos tipográfico), 018/019 (concesión del escritorio del VPS) y los topes de líneas |
| `180e0daae` | 020 (el cliente no sigue en silencio un cambio de hilo), 021 rehecho (URLs sueltas como ligas) y topes de líneas |
| `7160e653f` | Cosméticos 002–013 de la v165 sobre el port funcional: selector de emojis, pastilla de cabecera, asa de arrastre, riel, burbujas, Atelier, búsqueda en tablas, "This run" y copiar/descargar |
| `c30c62d52` | Riel de la ronda de alfa del 2026-11-18 (detalle abajo) |

**Los 12 `.patch` sueltos no aplican tal cual en la v169** (están escritos contra la v140/v165 y la UI cambió):
se portaron a mano, archivo por archivo, comparando contra la rama de beta.

## Riel — ajustes de la ronda de alfa (2026-11-18, commit `c30c62d52`)

Modo avanzado con la columna colapsada (densidad `icons`):

1. **Ancho de la barra**: 92/80 px → **72 px**; filas de 46 px → **32 px**; `gap` 8 px → **2 px**.
2. **Avatares más chicos**: 36/44 px → **32/40 px**; en hilos 32 → 29; fila simple 36 → 32.
3. **Botón del riel y lupa**: `size-[46px] rounded-xl` → `size-8 rounded-md`.
4. **Hueco de la cabecera** (search/+): 8 px → 7 px; tope de la columna de íconos: 8 px → 2 px.
5. **Calendario separado de Triggers**: vuelve el `scope` (`all | schedules | triggers`) en `routinesFocus`.
   Automatizaciones = `CalendarDays` con `scope: "schedules"`; Triggers = `Zap` con `scope: "triggers"`.
   La página de Triggers filtra solo webhooks y apps, se titula "Disparadores" y oculta el conmutador lista/calendario.
6. **Ícono de organigrama** de vuelta: `UsersRound` → `Network` en riel, barra del teléfono y menú de cuenta.
7. **Published apps fuera del riel**: quitado el ítem del riel, de la barra del teléfono y del menú de cuenta.
   La página (`PublishedAppsPage`) y el endpoint `/api/published-apps` siguen existiendo; solo se quitó el acceso,
   que es reversible con una línea.

Archivos: `SidebarFooterNav.tsx`, `SidebarPhoneBar.tsx`, `SidebarProfileMenu.tsx`, `TriggersPage.tsx`,
`state/store.tsx`, `ChromeRailToggle.tsx` (+ sus pruebas).

## Verificación

- `tsc --noEmit` limpio en cliente y servidor.
- **738** pruebas verdes en 62 archivos de Sidebar/Triggers/Routine; **378** en 16 de cosméticos.
- Imagen `openmausbot:v0.1.169-r3b`, desplegada en alfa (`omb-alfa165-omb-1`) y beta (`omb-v165-omb-1`),
  las dos `healthy`.
- Bundle servido `App-9pCETxrj.js` y `styles-739GG_kJ.css`, con sha256 idéntico en alfa y beta.
  Trae `nav-triggers` y ya no la fila de Published apps (las 4 menciones que quedan son la ruta interna
  `activeView === "published-apps"` y las llamadas a `/api/published-apps`, no un acceso visible).
- Escritorio del VPS: `configured/available true`, `problem: null` en las dos.

## Reversión

- Alfa: `/home/pepeneif/deploy-alfa165/docker-compose.yml.bak-pre-r3b-*` → `docker compose up -d`.
- Beta: `/home/pepeneif/deploy-v165/docker-compose.yml.bak-pre-r3b-20261118T031927Z` → `docker compose up -d`
  (regresa a `v0.1.165-r10`).
