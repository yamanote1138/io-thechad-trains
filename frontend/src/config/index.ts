// Load environment variables with defaults
export const config = {
  jmri: {
    host: import.meta.env.VITE_JMRI_HOST || 'raspi-jmri.local',
    port: parseInt(import.meta.env.VITE_JMRI_PORT) || 12080,
    protocol: import.meta.env.VITE_JMRI_PROTOCOL || 'ws',
    mock: {
      enabled: import.meta.env.VITE_JMRI_MOCK_ENABLED === 'true',
      responseDelay: parseInt(import.meta.env.VITE_JMRI_MOCK_DELAY) || 50,
    },
  },
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'Trains Over the Interwebs',
  },
} as const

// Computed WebSocket URL
export const getJmriWsUrl = () => {
  const { host, port, protocol } = config.jmri
  return `${protocol}://${host}:${port}/json`
}
