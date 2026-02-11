import { PlayerModel } from "../models/player";
import { NextFunction, Request, Response } from "express";
import { parseIntegerUndefinedParam } from "../helpers/parseNumericUndefinedParam";
import { parseCountryCode } from "../helpers/parseCountryCode";

export class PlayerController {
    static getAllPlayers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let limit = parseIntegerUndefinedParam(req.query.limit, "limit")
            if(limit && limit > 20) { limit = 20 }

            const nextCursor = parseIntegerUndefinedParam(req.query.nextCursor, "nextCursor")
            const players = await PlayerModel.getAll(limit, nextCursor)
            return res.status(200).json({ success: true, data: players })
        } catch(error) {
            next(error)
        }
    }

    static getPlayerById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseIntegerUndefinedParam(req.params.id, "id")
            if(id === undefined) {
                return res.status(400).json({ success: false, message: `The parameter id must be defined.` })
            }

            const player = await PlayerModel.getByID(id)
            if(!player) {
                return res.status(404).json({ success: false, message: `The player with id='${id}' was not found.` })
            }

            return res.status(200).json({ success: true, data: player })
        } catch(error) {
            next(error)
        }
    }

    static getPlayersByNationality = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let limit = parseIntegerUndefinedParam(req.query.limit, "limit")
            if(limit && limit > 20) { limit = 20 }

            const nextCursor = parseIntegerUndefinedParam(req.query.nextCursor, "nextCursor")
            const nation = parseCountryCode(req.params.nation, "nation")
            const players = await PlayerModel.getByNationality(nation, limit, nextCursor)
            return res.status(200).json({ success: true, data: players })
        } catch(error) {
            next(error)
        }
    }
}
