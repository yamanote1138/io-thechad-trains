export type HaDomain = 'light' | 'switch'

export interface HaEntityState {
  entity_id: string
  state: string
  attributes: {
    friendly_name?: string
    brightness?: number
    supported_features?: number
    [key: string]: unknown
  }
  last_changed: string
  last_updated: string
  context: { id: string }
}

export interface HaEntity {
  entityId: string
  domain: HaDomain
  friendlyName: string
  state: 'on' | 'off' | 'unavailable'
  brightness?: number
}

export type HaConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'
