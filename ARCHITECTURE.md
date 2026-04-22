# YardBird — Modular Architecture Plan

## Goal

Refactor YardBird from a hard-coded single-page app into a composable, plugin-driven interface. Users define tab views by assembling entity widgets surfaced by enabled integrations.

The Tram tab is the reference implementation — it's already this pattern, just hard-coded. The goal is to generalise it.

---

## Decisions Made

### Repo structure: stay monorepo
Separate repos only make sense if plugins are published as npm packages for third parties. This is a personal tool. One repo, clean directory structure, no monorepo tooling overhead.

### Plugins are compile-time
No runtime dynamic loading. Adding an integration means editing code and rebuilding the Docker image. Acceptable workflow for the primary user.

### LCC is not a separate plugin
JMRI manages LCC entities (turnouts, lights) natively. The JMRI plugin surfaces them. No direct LCC integration needed.

### View composition: config file first
Start with a JSON config file rather than a drag-and-drop admin UI. If a visual editor becomes worthwhile later, the config schema is already defined.

### Config storage split
| What | Where | Rationale |
|------|-------|-----------|
| Connection credentials (host, port, tokens) | `localStorage` | Device-specific, per-browser is correct |
| Layout config (tabs, widgets, plugin settings) | Volume-mounted JSON file in Docker container | Shared across devices/browsers |

The config file is served as a static JSON file by Caddy and written back via a small endpoint in `docker-entrypoint.sh`. No database needed.

---

## Plugin Architecture

### Directory structure
```
src/
  plugins/
    jmri/
      index.ts          ← plugin definition + useJmri composable
      entities.ts       ← entity types surfaced by JMRI
      components/       ← widget components (ThrottleWidget, TurnoutWidget, etc.)
    dccex/
      index.ts
      components/
    homeassistant/
      index.ts
      components/
  core/
    useRegistry.ts      ← aggregates entities across all enabled plugins
    useLayout.ts        ← manages tab/widget config (reads/writes config file)
    types.ts            ← shared entity type contracts
```

### Plugin interface

```typescript
interface Plugin {
  id: string
  name: string
  icon: string

  // Called at app init with the plugin's config block
  connect(config: PluginConfig): Promise<void>
  disconnect(): Promise<void>

  // Reactive entity list — updated live from the connection
  entities: Ref<Entity[]>
}
```

### Entity types (shared contract)

```typescript
type EntityType = 'throttle' | 'power' | 'turnout' | 'light' | 'scene'

interface Entity {
  id: string           // e.g. "jmri:throttle:1234"
  pluginId: string
  type: EntityType
  label: string
  component: Component // Vue widget component for this entity
  data: unknown        // plugin-specific reactive state
}
```

The view layer only knows about entity types — not which plugin owns them.

### Plugin registry

`useRegistry` is a singleton composable that:
- Holds all registered plugins
- Aggregates their entity lists into a single reactive collection
- Provides lookup by entity ID and filtering by type

---

## Config File Format

Stored at a path like `/data/yardbird.json` (volume-mounted into the Docker container).

```json
{
  "plugins": {
    "jmri": {
      "enabled": true,
      "host": "raspi-jmri.local",
      "port": 12080,
      "secure": false
    },
    "dccex": {
      "enabled": true,
      "host": "192.168.1.231",
      "port": 2560
    },
    "homeassistant": {
      "enabled": true,
      "url": "http://homeassistant.local:8123",
      "token": "...",
      "area": "train_room"
    }
  },
  "tabs": [
    {
      "id": "throttles",
      "name": "Throttles",
      "icon": "i-mdi-train",
      "widgets": [
        { "entityId": "jmri:throttle:3", "label": "Loco 3" },
        { "entityId": "jmri:throttle:30", "label": "Inner Loop" }
      ]
    },
    {
      "id": "layout",
      "name": "Layout",
      "icon": "i-mdi-switch",
      "widgets": [
        { "entityId": "jmri:turnout:NT1" },
        { "entityId": "jmri:light:NL1" }
      ]
    },
    {
      "id": "room",
      "name": "Room",
      "icon": "i-mdi-home",
      "widgets": [
        { "entityId": "ha:scene:train_room_lights" }
      ]
    }
  ]
}
```

---

## DCC-EX: Simplification Path

The current proxy is the most painful part of the stack. Two options, in order of preference:

### Option A — Native WebSocket (preferred)
EX-CommandStation firmware 5.x+ includes a built-in WebSocket server. If the CommandStation is running this firmware, the browser can connect directly — no proxy, no Docker dependency for DCC-EX. The `dccex` plugin becomes a simple `useWebSocket` composable.

**Next step:** confirm the running firmware version supports WebSocket. Check against [DCC-EX releases](https://github.com/DCC-EX/EX-CommandStation/releases).

### Option B — Route trams through JMRI
JMRI supports DCC-EX as a command station. Tram throttles (addresses 30/31) become normal JMRI roster entries. The direct DCC-EX connection and proxy disappear entirely.

**Trade-off:** the `<F cab DCFREQ n>` PWM frequency command is DCC-EX-native and JMRI has no equivalent. Would need to be set once in firmware config rather than from the UI. Acceptable if the alternative is maintaining the proxy.

### Current proxy problems (for reference)
- Two TCP connections per client (DCC-EX locks protocol on first character)
- WiThrottle for throttles, native `<` protocol for power and PWM
- Runs in Docker container, requires `DCCEX_HOST` env var
- Adds latency, complexity, and a server-side dependency to an otherwise pure frontend app

---

## JMRI Entities — Current and Future

**Currently used:** roster/throttles, turnouts, lights, power

**Not yet used (parking lot):**
- Routes — trigger multi-turnout sequences from one button. High value, fits the widget model naturally.
- Panels — JMRI serves layout panels as HTML/SVG via its HTTP server, not through the JSON WebSocket API. Possible as an iframe embed but messy. Parked for now.
- Block occupancy, signal heads, consists — future consideration.

---

## Open Questions

1. **DCC-EX WebSocket support** — does the running firmware expose a WebSocket endpoint? This determines whether Option A is viable.

2. **Config file write path** — should the app be able to write layout changes back to the config file from the browser (via a lightweight API in the entrypoint), or is hand-editing the file acceptable for now?

3. **Tab editor UI** — eventually a visual "edit mode" for composing tabs would be nice. The config file schema is the right first step; the UI can be layered on top.

4. **Tram addresses filtered from roster** — currently addresses 30 and 31 are excluded from the main throttle roster. In the plugin model, the config file should declare which addresses belong to the DCC-EX plugin so the JMRI plugin knows to skip them.

---

## Migration Path

The existing code maps cleanly onto this model:

| Current | Plugin model equivalent |
|---------|------------------------|
| `useJmri.ts` | `plugins/jmri/index.ts` |
| `useDccEx.ts` | `plugins/dccex/index.ts` |
| `ThrottleCard.vue` | `plugins/jmri/components/ThrottleWidget.vue` |
| `TurnoutList.vue` | `plugins/jmri/components/TurnoutWidget.vue` |
| `LightList.vue` | `plugins/jmri/components/LightWidget.vue` |
| `TramControl.vue` | `plugins/dccex/components/TramWidget.vue` |
| `RoomControl.vue` | `plugins/homeassistant/components/SceneWidget.vue` |
| `PowerControl.vue` | shared by jmri + dccex plugins |
| Hard-coded tabs in `App.vue` | `useLayout.ts` reading from config file |

No rewrite required — it's a reorganisation with a registry layer added on top.
