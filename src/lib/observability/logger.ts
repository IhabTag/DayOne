type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    requestId?: string;
    userId?: string;
    [key: string]: unknown;
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: LogContext;
}

function formatLog(entry: LogEntry): string {
    if (process.env.NODE_ENV === 'production') {
        // JSON format for production (better for log aggregation)
        return JSON.stringify(entry);
    }

    // Human-readable format for development
    const contextStr = entry.context
        ? ` ${JSON.stringify(entry.context)}`
        : '';
    return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}`;
}

function log(level: LogLevel, message: string, context?: LogContext) {
    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context,
    };

    const formatted = formatLog(entry);

    switch (level) {
        case 'debug':
            if (process.env.NODE_ENV === 'development') {
                console.debug(formatted);
            }
            break;
        case 'info':
            console.info(formatted);
            break;
        case 'warn':
            console.warn(formatted);
            break;
        case 'error':
            console.error(formatted);
            break;
    }
}

export const logger = {
    debug: (message: string, context?: LogContext) => log('debug', message, context),
    info: (message: string, context?: LogContext) => log('info', message, context),
    warn: (message: string, context?: LogContext) => log('warn', message, context),
    error: (message: string, context?: LogContext) => log('error', message, context),
};

export default logger;
