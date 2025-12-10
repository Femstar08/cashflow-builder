/**
 * Production-ready logging utility
 * In production, integrate with error tracking service (Sentry, LogRocket, etc.)
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };

    const formatted = this.formatMessage('error', message, errorContext);
    console.error(formatted);

    // In production, send to error tracking service
    if (this.isProduction) {
      // TODO: Integrate with Sentry or similar
      // Example: Sentry.captureException(error, { extra: errorContext });
    }
  }

  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('warn', message, context);
    console.warn(formatted);

    // In production, send to monitoring service
    if (this.isProduction) {
      // TODO: Send to monitoring service
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment || this.isProduction) {
      const formatted = this.formatMessage('info', message, context);
      console.info(formatted);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const formatted = this.formatMessage('debug', message, context);
      console.debug(formatted);
    }
  }
}

export const logger = new Logger();

