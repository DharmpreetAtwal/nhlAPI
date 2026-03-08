import { Response } from "express";

export const sendSuccess = (res: Response, data: any, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, result: data })
}