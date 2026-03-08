import "../types/pagination";
import { PlayerService } from "../services/playerService";
import { NextFunction, Request, Response } from "express";

const sendSuccess = (res: Response, data: any, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, result: data })
}

export class PlayerController {
    static getAllPlayers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, nextCursor } = req.pagination
            const players = await PlayerService.getAllPlayers(limit, nextCursor)
            return sendSuccess(res, players)
        } catch(error) {
            next(error)
        }
    }

    static getPlayerById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id
            const player = await PlayerService.getPlayerById(id)
            return sendSuccess(res, player)
        } catch(error) {
            next(error)
        }
    }

    static getPlayersByNationality = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, nextCursor } = req.pagination
            const nation = req.params.nation
            const players = await PlayerService.getPlayersByNationality(nation, limit, nextCursor)
            return sendSuccess(res, players)
        } catch(error) {
            next(error)
        }
    }
}
