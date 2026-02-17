import { Request, Response, NextFunction } from "express";
import { parseIntegerUndefinedParam } from "../utilities/parseIntegerUndefinedParam";


export const parsePagination = (req: Request, res: Response, next: NextFunction) => {
    try {
        let validatedLimit = parseIntegerUndefinedParam(req.query.limit, "limit")
        if (validatedLimit === undefined) {
            validatedLimit = 10
        } else if(validatedLimit > 20) {
            validatedLimit = 20
        }

        req.pagination = {
            limit: validatedLimit,
            nextCursor: parseIntegerUndefinedParam(req.query.nextCursor, "nextCursor")
        }
        
        next()
    } catch (error) {
        next(error)
    }
    
}