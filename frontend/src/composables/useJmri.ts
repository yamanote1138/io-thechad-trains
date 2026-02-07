/**
 * JMRI control composable
 * Handles connection and control of JMRI model railroad system
 */

import { ref, computed, onMounted } from 'vue'
import { getJmriWsUrl, config } from '@/config'
import type { JmriState, Throttle, PowerState, Direction, Turnout } from '@/types/jmri'

import { JmriClient } from 'jmri-client'

// Singleton state
const jmriState = ref<JmriState>({
  power: 0, // PowerState.UNKNOWN
  throttles: new Map(),
  turnouts: new Map()
})

const isConnected = ref(false)
let jmriClient: any = null

/**
 * Main JMRI composable
 */
export function useJmri() {
  /**
   * Initialize JMRI client
   */
  const initialize = () => {
    if (jmriClient) {
      return
    }

    const wsUrl = getJmriWsUrl()
    console.log('Initializing JMRI client with URL:', wsUrl)
    console.log('Mock mode enabled:', config.jmri.mock.enabled)

    // Initialize jmri-client v3.0
    jmriClient = new JmriClient({
      host: config.jmri.host,
      port: config.jmri.port,
      protocol: config.jmri.protocol,
      mock: {
        enabled: config.jmri.mock.enabled,
        responseDelay: config.jmri.mock.responseDelay
      }
    })

    // Set up event handlers
    jmriClient.on('connected', () => {
      console.log('JMRI client connected')
      isConnected.value = true
    })

    jmriClient.on('disconnected', () => {
      console.log('JMRI client disconnected')
      isConnected.value = false
    })

    jmriClient.on('power:changed', (state: any) => {
      console.log('Power state changed:', state)
      jmriState.value.power = state
    })

    jmriClient.on('throttle:updated', (id: string, data: any) => {
      console.log('Throttle update:', id, data)
      const throttle: Throttle = {
        address: parseInt(id),
        name: data.name || `Loco ${id}`,
        road: data.road || '',
        number: data.number || '',
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl,
        speed: data.speed || 0,
        direction: data.forward === true,
        functions: data.functions || {}
      }
      jmriState.value.throttles.set(parseInt(id), throttle)
    })

    jmriClient.on('turnout', (data: any) => {
      console.log('Turnout update:', data)
      const turnout: Turnout = {
        name: data.name,
        state: data.state || 'unknown',
        inverted: data.inverted || false
      }
      jmriState.value.turnouts.set(data.name, turnout)
    })

    // Connect to JMRI
    jmriClient.connect()
  }

  /**
   * Set track power on/off
   */
  async function setPower(state: 'on' | 'off') {
    if (!jmriClient || !isConnected.value) {
      console.error('Cannot set power: JMRI client not connected')
      return
    }

    try {
      console.log('Setting power:', state)
      const powerState = state === 'on' ? 2 : 4
      await jmriClient.setPower(powerState)

      // Manually update state since mock mode doesn't emit power:changed events
      jmriState.value.power = powerState
      console.log('Power state updated to:', powerState)
    } catch (error) {
      console.error('Failed to set power:', error)
      throw error
    }
  }

  /**
   * Set throttle speed
   */
  async function setThrottleSpeed(address: number, speed: number) {
    if (!jmriClient || !isConnected.value) {
      console.error('Cannot set throttle speed: JMRI client not connected')
      return
    }

    try {
      console.log(`Setting throttle ${address} speed to ${speed}`)
      await jmriClient.setThrottle(address, { speed })
    } catch (error) {
      console.error('Failed to set throttle speed:', error)
      throw error
    }
  }

  /**
   * Set throttle direction
   */
  async function setThrottleDirection(address: number, direction: Direction) {
    if (!jmriClient || !isConnected.value) {
      console.error('Cannot set throttle direction: JMRI client not connected')
      return
    }

    try {
      console.log(`Setting throttle ${address} direction to ${direction}`)
      await jmriClient.setThrottle(address, { forward: direction })
    } catch (error) {
      console.error('Failed to set throttle direction:', error)
      throw error
    }
  }

  /**
   * Set throttle function
   */
  async function setThrottleFunction(address: number, fn: number, state: boolean) {
    if (!jmriClient || !isConnected.value) {
      console.error('Cannot set throttle function: JMRI client not connected')
      return
    }

    try {
      console.log(`Setting throttle ${address} function F${fn} to ${state}`)
      const functions: Record<string, boolean> = {}
      functions[`F${fn}`] = state
      await jmriClient.setThrottle(address, { functions })
    } catch (error) {
      console.error('Failed to set throttle function:', error)
      throw error
    }
  }

  /**
   * Set turnout state
   */
  async function setTurnout(name: string, state: 'closed' | 'thrown') {
    if (!jmriClient || !isConnected.value) {
      console.error('Cannot set turnout: JMRI client not connected')
      return
    }

    try {
      console.log(`Setting turnout ${name} to ${state}`)
      await jmriClient.setTurnout(name, state === 'closed' ? 2 : 4)
    } catch (error) {
      console.error('Failed to set turnout:', error)
      throw error
    }
  }

  /**
   * Fetch roster from JMRI
   */
  async function fetchRoster() {
    if (!jmriClient || !isConnected.value) {
      console.error('Cannot fetch roster: JMRI client not connected')
      return
    }

    try {
      console.log('Fetching roster from JMRI')
      const roster = await jmriClient.getRoster()

      // Process roster entries
      roster.forEach((entry: any) => {
        const address = entry.data?.address || entry.address
        const thumbnailUrl = entry.data?.name
          ? `${config.jmri.protocol}://${config.jmri.host}:${config.jmri.port}/roster/${encodeURI(entry.data.name)}/icon?maxHeight=200`
          : undefined

        const throttle: Throttle = {
          address,
          name: entry.data?.name || `Loco ${address}`,
          road: entry.data?.road || '',
          number: entry.data?.number || '',
          thumbnailUrl,
          speed: 0,
          direction: true, // Direction.FORWARD
          functions: {}
        }
        jmriState.value.throttles.set(address, throttle)
      })

      console.log(`Loaded ${roster.length} locomotives from roster`)
    } catch (error) {
      console.error('Failed to fetch roster:', error)
      throw error
    }
  }

  /**
   * Fetch turnouts from JMRI
   */
  async function fetchTurnouts() {
    if (!jmriClient || !isConnected.value) {
      console.error('Cannot fetch turnouts: JMRI client not connected')
      return
    }

    try {
      console.log('Fetching turnouts from JMRI')
      const turnouts = await jmriClient.getTurnouts()

      // Process turnout entries
      turnouts.forEach((entry: any) => {
        const turnout: Turnout = {
          name: entry.data?.name || entry.name,
          state: entry.data?.state || 'unknown',
          inverted: entry.data?.inverted || false
        }
        jmriState.value.turnouts.set(turnout.name, turnout)
      })

      console.log(`Loaded ${turnouts.length} turnouts`)
    } catch (error) {
      console.error('Failed to fetch turnouts:', error)
      throw error
    }
  }

  // Auto-initialize immediately (singleton pattern)
  if (!jmriClient) {
    console.log('First call to useJmri, initializing...')
    initialize()
  }

  return {
    // State
    jmriState,
    isConnected,

    // Computed
    throttles: computed(() => Array.from(jmriState.value.throttles.values())),
    turnouts: computed(() => Array.from(jmriState.value.turnouts.values())),
    power: computed(() => jmriState.value.power),

    // Methods
    initialize,
    setPower,
    setThrottleSpeed,
    setThrottleDirection,
    setThrottleFunction,
    setTurnout,
    fetchRoster,
    fetchTurnouts
  }
}
