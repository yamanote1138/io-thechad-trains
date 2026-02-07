/**
 * JMRI control composable
 * Handles connection and control of JMRI model railroad system
 */

import { ref, computed, onMounted } from 'vue'
import { getJmriWsUrl, config } from '@/config'
import { logger } from '@/utils/logger'
import type { JmriState, Throttle, RosterEntry, PowerState, Direction } from '@/types/jmri'

import { JmriClient } from 'jmri-client'

// Singleton state
const jmriState = ref<JmriState>({
  power: 0, // PowerState.UNKNOWN
  roster: new Map(),
  throttles: new Map()
})

const isConnected = ref(false)
let jmriClient: any = null
const throttleIds = new Map<number, string>() // address -> throttleId mapping

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
    logger.debug('Initializing JMRI client with URL:', wsUrl)
    logger.debug('Mock mode enabled:', config.jmri.mock.enabled)

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
      logger.info('JMRI client connected')
      isConnected.value = true
    })

    jmriClient.on('disconnected', () => {
      logger.info('JMRI client disconnected')
      isConnected.value = false
    })

    jmriClient.on('power:changed', (state: any) => {
      logger.info('Power state changed:', state === 2 ? 'ON' : state === 4 ? 'OFF' : 'UNKNOWN')
      jmriState.value.power = state
    })

    jmriClient.on('throttle:updated', (throttleId: string, data: any) => {
      logger.debug('Throttle update event:', throttleId, data)

      // Find address from our throttleIds map (reverse lookup)
      let address: number | undefined
      for (const [addr, tId] of throttleIds.entries()) {
        if (tId === throttleId) {
          address = addr
          break
        }
      }

      if (!address) {
        logger.error('Received update for unknown throttle:', throttleId)
        return
      }

      // Get existing throttle and merge updates
      const existing = jmriState.value.throttles.get(address)
      if (!existing) {
        logger.error('No throttle found for address:', address)
        return
      }

      // Handle function updates - functions come directly in data as F0, F1, etc.
      // Extract any function keys (F0-F28) from the data
      const functionUpdates: Record<string, any> = {}
      for (const key in data) {
        if (key.match(/^F\d+$/)) {
          // Convert boolean to function object format if needed
          functionUpdates[key] = typeof data[key] === 'boolean'
            ? { value: data[key], label: key, lockable: false }
            : data[key]
        }
      }

      // Update only the changed fields
      const updated: Throttle = {
        ...existing,
        speed: data.speed !== undefined ? data.speed : existing.speed,
        direction: data.forward !== undefined ? data.forward : existing.direction,
        functions: Object.keys(functionUpdates).length > 0
          ? { ...existing.functions, ...functionUpdates }
          : existing.functions
      }

      jmriState.value.throttles.set(address, updated)
    })

    // Connect to JMRI
    jmriClient.connect()
  }

  /**
   * Set track power on/off
   */
  async function setPower(state: 'on' | 'off') {
    if (!jmriClient || !isConnected.value) {
      logger.error('Cannot set power: JMRI client not connected')
      return
    }

    try {
      logger.info('Setting power:', state.toUpperCase())

      // If turning power off, release all acquired throttles
      if (state === 'off') {
        logger.info('Releasing all acquired throttles before turning power off')
        const addresses = Array.from(jmriState.value.throttles.keys())
        for (const address of addresses) {
          await releaseThrottle(address)
        }
      }

      const powerState = state === 'on' ? 2 : 4
      await jmriClient.setPower(powerState)
      logger.debug('Power command sent successfully')
    } catch (error) {
      logger.error('Failed to set power:', error)
      throw error
    }
  }

  /**
   * Set throttle speed
   */
  async function setThrottleSpeed(address: number, speed: number) {
    if (!jmriClient || !isConnected.value) {
      logger.error('Cannot set throttle speed: JMRI client not connected')
      return
    }

    const throttleId = throttleIds.get(address)
    if (!throttleId) {
      logger.error(`No throttle acquired for address ${address}`)
      return
    }

    try {
      logger.debug(`Setting throttle ${address} speed to ${Math.round(speed * 100)}%`)
      await jmriClient.setThrottleSpeed(throttleId, speed)
    } catch (error) {
      logger.error('Failed to set throttle speed:', error)
      throw error
    }
  }

  /**
   * Set throttle direction
   */
  async function setThrottleDirection(address: number, direction: Direction) {
    if (!jmriClient || !isConnected.value) {
      logger.error('Cannot set throttle direction: JMRI client not connected')
      return
    }

    const throttleId = throttleIds.get(address)
    if (!throttleId) {
      logger.error(`No throttle acquired for address ${address}`)
      return
    }

    try {
      logger.debug(`Setting throttle ${address} direction to ${direction ? 'FORWARD' : 'REVERSE'}`)
      await jmriClient.setThrottleDirection(throttleId, direction)
    } catch (error) {
      logger.error('Failed to set throttle direction:', error)
      throw error
    }
  }

  /**
   * Set throttle function
   */
  async function setThrottleFunction(address: number, fn: number, state: boolean) {
    if (!jmriClient || !isConnected.value) {
      logger.error('Cannot set throttle function: JMRI client not connected')
      return
    }

    const throttleId = throttleIds.get(address)
    if (!throttleId) {
      logger.error(`No throttle acquired for address ${address}`)
      return
    }

    try {
      logger.debug(`Setting throttle ${address} function F${fn} to ${state ? 'ON' : 'OFF'}`)
      await jmriClient.setThrottleFunction(throttleId, `F${fn}`, state)
    } catch (error) {
      logger.error('Failed to set throttle function:', error)
      throw error
    }
  }

  /**
   * Fetch roster from JMRI
   */
  async function fetchRoster() {
    if (!jmriClient || !isConnected.value) {
      logger.error('Cannot fetch roster: JMRI client not connected')
      return
    }

    try {
      logger.info('Fetching roster from JMRI')
      const roster = await jmriClient.getRoster()

      // Process roster entries (don't acquire yet)
      for (const entry of roster) {
        const address = entry.data?.address || entry.address
        const thumbnailUrl = entry.data?.name
          ? `${config.jmri.protocol}://${config.jmri.host}:${config.jmri.port}/roster/${encodeURI(entry.data.name)}/icon?maxHeight=200`
          : undefined

        const rosterEntry: RosterEntry = {
          address,
          name: entry.data?.name || `Loco ${address}`,
          road: entry.data?.road || '',
          number: entry.data?.number || '',
          thumbnailUrl
        }
        jmriState.value.roster.set(address, rosterEntry)
      }

      logger.info(`Loaded ${roster.length} locomotives from roster`)
    } catch (error) {
      logger.error('Failed to fetch roster:', error)
      throw error
    }
  }

  /**
   * Acquire a throttle for control
   */
  async function acquireThrottle(address: number) {
    if (!jmriClient || !isConnected.value) {
      logger.error('Cannot acquire throttle: JMRI client not connected')
      return
    }

    const rosterEntry = jmriState.value.roster.get(address)
    if (!rosterEntry) {
      logger.error(`No roster entry found for address ${address}`)
      return
    }

    try {
      logger.info(`Acquiring throttle for ${rosterEntry.name} (address ${address})`)
      const throttleId = await jmriClient.acquireThrottle({ address })
      throttleIds.set(address, throttleId)
      logger.debug(`Acquired throttle ID: ${throttleId}`)

      // Create throttle from roster entry
      const throttle: Throttle = {
        ...rosterEntry,
        speed: 0,
        direction: true, // Direction.FORWARD
        functions: {}
      }
      jmriState.value.throttles.set(address, throttle)
    } catch (error) {
      logger.error(`Failed to acquire throttle for address ${address}:`, error)
      throw error
    }
  }

  /**
   * Release a throttle
   */
  async function releaseThrottle(address: number) {
    if (!jmriClient || !isConnected.value) {
      logger.error('Cannot release throttle: JMRI client not connected')
      return
    }

    const throttleId = throttleIds.get(address)
    if (!throttleId) {
      logger.error(`No throttle acquired for address ${address}`)
      return
    }

    const throttle = jmriState.value.throttles.get(address)
    const name = throttle?.name || `Address ${address}`

    try {
      // Stop the throttle first
      logger.debug(`Stopping throttle ${name} before release`)
      await jmriClient.setThrottleSpeed(throttleId, 0)

      // Release the throttle
      logger.info(`Releasing throttle for ${name}`)
      await jmriClient.releaseThrottle(throttleId)
      throttleIds.delete(address)
      jmriState.value.throttles.delete(address)
    } catch (error) {
      logger.error(`Failed to release throttle for address ${address}:`, error)
      throw error
    }
  }

  // Auto-initialize immediately (singleton pattern)
  if (!jmriClient) {
    logger.debug('First call to useJmri, initializing...')
    initialize()
  }

  return {
    // State
    jmriState,
    isConnected,

    // Computed
    roster: computed(() => Array.from(jmriState.value.roster.values())),
    throttles: computed(() => Array.from(jmriState.value.throttles.values())),
    power: computed(() => jmriState.value.power),

    // Methods
    initialize,
    setPower,
    setThrottleSpeed,
    setThrottleDirection,
    setThrottleFunction,
    fetchRoster,
    acquireThrottle,
    releaseThrottle
  }
}
