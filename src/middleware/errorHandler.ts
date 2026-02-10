import { Request, Response, NextFunction } from "express";
import { IntegerParseError } from "../errors/numericParseError";
import { CountryCodeParseError } from "../errors/countryCodeParseError";
import { logger } from "../config/logger";

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if(error instanceof IntegerParseError || error instanceof CountryCodeParseError) {
        return res.status(400).json({
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