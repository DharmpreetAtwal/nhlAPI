import winston from 'winston'

const { combine, timestamp, printf, colorize, errors } = winston.format

// Define custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`
})

// Create the Winston logger instance
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        errors({ stack: true }), // Log the full stack trace
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    
    transports: [
        // Console transport for development
        new winston.transports.Console({
            format: combine(
                colorize(),
                logFormat
            )
        }),

        // File transport for errors
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            )
        }),

        // File transport for all logs
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            )
        })
    ],

    // Don't exit on uncaught errors
    exitOnError: false
})

// If we're not in production, log to the console with more verbose output
if (process.env.NODE_ENV !== 'production') {
    logger.debug('Logger initialized in development mode')
}
