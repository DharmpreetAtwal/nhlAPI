import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { HttpClientError } from "../errors/httpClientErrors";

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if(error instanceof HttpClientError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        })
    }

    logger.error("Unexpected Error:", {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
    })

    return res.status(500).json({
        success: false, 
        message: "An internal server error occurred. "
    })
}