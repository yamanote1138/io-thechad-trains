/**
 * Check if debug logging is enabled
 */
function isDebugEnabled(): boolean {
  return localStorage.getItem('jmri-debug-enabled') === 'true'
}

/**
 * Simple logger with debug mode control
 */
export const logger = {
  debug: (...args: any[]) => {
    if (isDebugEnabled()) {
      console.log('[DEBUG]', ...args)
    }
  },
  info: (...args: any[]) => console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
}
