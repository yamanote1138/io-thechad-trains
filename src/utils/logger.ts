import { config } from '@/config'

type LogLevel = 'debug' | 'info'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
}

class Logger {
  private level: LogLevel

  constructor() {
    this.level = config.app.logLevel
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level]
  }

  debug(...args: any[]) {
    if (this.shouldLog('debug')) {
      console.log('[DEBUG]', ...args)
    }
  }

  info(...args: any[]) {
    if (this.shouldLog('info')) {
      console.log('[INFO]', ...args)
    }
  }

  warn(...args: any[]) {
    // Always show warnings
    console.warn('[WARN]', ...args)
  }

  error(...args: any[]) {
    // Always show errors
    console.error('[ERROR]', ...args)
  }
}

export const logger = new Logger()
