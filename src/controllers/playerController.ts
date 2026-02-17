import "../types/pagination";
import { PlayerService } from "../services/playerService";
import { NextFunction, Request, Response } from "express";
import { parseIntegerUndefinedParam } from "../utilities/parseIntegerUndefinedParam";
import { parseCountryCode } from "../utilities/parseCountryCode";
import { parseIntegerParam } from "../utilities/parseIntegerParam";

export class PlayerController {
    static getAllPlayers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, nextCursor } = req.pagination
            const players = await PlayerService.getAllPlayers(limit, nextCursor)
            return res.status(200).json({ success: true, result: players })
        } catch(error) {
            next(error)
        }
    }

    static getPlayerById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseIntegerParam(req.params.id, "id")
            const player = await PlayerService.getPlayerById(id)
            return res.status(200).json({ success: true, result: player })
        } catch(error) {
            next(error)
        }
    }

    static getPlayersByNationality = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, nextCursor } = req.pagination
            const nation = parseCountryCode(req.params.nation, "nation")
            const players = await PlayerService.getPlayersByNationality(nation, limit, nextCursor)
            return res.status(200).json({ success: true, result: players })
        } catch(error) {
            next(error)
        }
    }
}
