// ── Layout / YAML config ─────────────────────────────────────────────────────

export interface PowerZone {
  name: string
  prefix: string  // empty string = default JMRI connection
}

// powerZones in YAML can be:
//   - PowerZone[]              → use these explicit zones
//   - { discover: true }       → auto-discover via getSystemConnections()
//   - missing / { discover: false } → single default power button (fallback)
export type PowerZonesConfig = PowerZone[] | { discover: boolean }

export interface JmriPluginConfig {
  host: string
  port: number
  secure?: boolean
  mock?: boolean
  tramPrefix?: string  // System connection prefix for tram (DC) throttles, e.g. 'D' for DCC++
  tramPwmFreq?: number // DC PWM frequency on acquire: 0=131Hz, 1=490Hz, 2=3.4kHz, 3=Supersonic (default)
  powerZones?: PowerZonesConfig
}

export interface HomeAssistantPluginConfig {
  enabled?: boolean
  url: string
  token: string
  area: string
}

// ── Widget / Dashboard types ──────────────────────────────────────────────────

export type WidgetType =
  | 'jmri-power'
  | 'jmri-throttle'
  | 'jmri-turnout'
  | 'jmri-light'
  | 'jmri-tram'
  | 'ha-entity'

export interface WidgetGridPos {
  x: number
  y: number
  w: number
  h: number
}

export interface WidgetInstance {
  id: string                         // crypto.randomUUID()
  type: WidgetType
  grid: WidgetGridPos
  config: Record<string, unknown>    // widget-specific: address, entityId, prefix, label, etc.
}

export interface TabConfig {
  id: string
  name: string
  icon: string
  widgets: WidgetInstance[]
}

// ── Stored / active config ────────────────────────────────────────────────────

export interface StoredConfig {
  version: 1
  debug?: boolean
  connections: {
    jmri?: JmriPluginConfig
    homeassistant?: HomeAssistantPluginConfig
  }
  tabs: TabConfig[]
}

// ── Legacy YAML config (used only by useLayout.ts as fallback source) ─────────

export interface LayoutConfig {
  debug?: boolean
  plugins: {
    jmri: JmriPluginConfig
    homeassistant?: HomeAssistantPluginConfig
  }
  tabs: Array<{ id: string; name: string; icon: string }>
}

