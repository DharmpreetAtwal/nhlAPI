import { Request, Response, NextFunction } from "express";
import { parseIntegerUndefinedParam } from "../utilities/parseNumericUndefinedParam";


export const parsePagination = (req: Request, res: Response, next: NextFunction) => {
    try {
        req.pagination = {
            limit: parseIntegerUndefinedParam(req.query.limit, "limit"),
            nextCursor: parseIntegerUndefinedParam(req.query.nextCursor, "nextCursor")
        }
        next()
    } catch (error) {
        next(error)
    }
    
}