import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { PlayerModel } from "../models/player";
import { Request, Response } from "express";
import { parseNumericParam } from "../helpers/parseNumericParam";
import { NumericParseError } from "../errors/numericParseError";

export class PlayerController {
    static getAllPlayers = async (req: Request, res: Response) => {
        try {
            const players = await PlayerModel.getAll()
            res.json({ success: true, data: players })
        } catch(error) {
            if (error instanceof Error) {
                res.status(500).json({ success: false, message: error.message })
            } else {
                res.status(500).json({ success: false, message: "Unknown error: " + error })
            }
        }
    }

    static getPlayerById = async (req: Request, res: Response) => {
        const id = req.params.id as string

        try {
            if (isNaN(Number(id))) {
                res.status(400).json({ success: false, message: `The id='${id}' is an invalid player_id`})
            } else {
                const player = await PlayerModel.getByID(parseInt(id))
                res.status(200).json({ success: true, data: player })   
            }

        } catch(error) {
            if (error instanceof PrismaClientKnownRequestError) {
                res.status(404).json({ success: false, message: `The player with id=${id} does not exist.`})
            } else if (error instanceof Error) {
                res.status(500).json({ success: false, message: error.message })
            } else {
                res.status(500).json({ success: false, message: "Unknown error: " + error })
            }
        }
    }

    static getPlayersByNationality = async (req: Request, res: Response) => {
        const nation = req.params.nation as string
        const limit = req.query.limit as string | undefined
        const nextCursor = req.query.nextCursor as string | undefined
        
        try {       
            let limitNum = parseNumericParam(limit, "limit")
            let nextCursorNum = parseNumericParam(nextCursor, "nextCursor")
            if (!nation.match(/^[A-Za-z]{3}$/)) {
                return res.status(400).json({ success: false, message: `The parameter nation='${nation}' must be 3 letters` })
            }

            const players = await PlayerModel.getByNationality(nation.toUpperCase(), limitNum, nextCursorNum)
            res.status(200).json({ success: true, data: players })
        } catch(error) {
            if (error instanceof NumericParseError) {
                res.status(400).json({ success: false, message: error.message })
            } else if (error instanceof Error) {
                res.status(500).json({ success: false, message: error.message })
            } else {
                res.status(500).json({ success: false, message: "Unknown error: " + error })
            }
        }
    }
}
