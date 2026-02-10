import { Request, Response, NextFunction } from 'express'
import { logger } from '../config/logger'

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now()

    // Log the incoming request
    logger.info(`${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent')
    })

    // Log the response when it's finished
    res.on('finish', () => {
        const duration = Date.now() - startTime
        const logLevel = res.statusCode >= 400 ? 'error' : 'info'

        logger.log(logLevel, `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`, {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`
        })
    })

    next()
}
