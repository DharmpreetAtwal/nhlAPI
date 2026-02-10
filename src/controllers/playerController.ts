import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { PlayerModel } from "../models/player";
import { Request, Response } from "express";
import { parseIntegerUndefinedParam } from "../helpers/parseNumericUndefinedParam";
import { IntegerParseError } from "../errors/numericParseError";
import { parseCountryCode } from "../helpers/parseCountryCode";
import { CountryCodeParseError } from "../errors/countryCodeParseError";

export class PlayerController {
    static getAllPlayers = async (req: Request, res: Response) => {
        try {
            let limit = parseIntegerUndefinedParam(req.query.limit, "limit")
            if(limit && limit > 20) { limit = 20 }

            const nextCursor = parseIntegerUndefinedParam(req.query.nextCursor, "nextCursor")
            const players = await PlayerModel.getAll(limit, nextCursor)
            return res.json({ success: true, data: players })
        } catch(error) {
            if (error instanceof IntegerParseError) {
                return res.status(400).json({ success: false, message: error.message })
            } else {
                // Log the actual error for debugging (in production, use a proper logger)
                console.error('Unexpected error in getAllPlayers:', error)
                return res.status(500).json({ success: false, message: "An internal server error occurred" })
            }
        }
    }

    static getPlayerById = async (req: Request, res: Response) => {
        try {
            const id = parseIntegerUndefinedParam(req.params.id, "id")
            if(!id) {
                return res.status(400).json({ success: false, message: `The parameter id must be defined.` })
            }

            const player = await PlayerModel.getByID(id)
            if(!player) {
                return res.status(404).json({ success: false, message: `The player with id='${id}' was not found.` })
            }

            return res.status(200).json({ success: true, data: player })

        } catch(error) {
            if (error instanceof IntegerParseError) {
                return res.status(400).json({ success: false, message: error.message })
            } else {
                // Log the actual error for debugging (in production, use a proper logger)
                console.error('Unexpected error in getPlayerById:', error)
                return res.status(500).json({ success: false, message: "An internal server error occurred" })
            }
        }
    }

    static getPlayersByNationality = async (req: Request, res: Response) => {
        try {
            let limit = parseIntegerUndefinedParam(req.query.limit, "limit")
            if(limit && limit > 20) { limit = 20 }

            const nextCursor = parseIntegerUndefinedParam(req.query.nextCursor, "nextCursor")
            const nation = parseCountryCode(req.params.nation, "nation")
            const players = await PlayerModel.getByNationality(nation, limit, nextCursor)
            return res.status(200).json({ success: true, data: players })
        } catch(error) {
            if (error instanceof IntegerParseError) {
                return res.status(400).json({ success: false, message: error.message })
            } else if (error instanceof CountryCodeParseError) {
                return res.status(400).json({ success: false, message: error.message })
            } else {
                // Log the actual error for debugging (in production, use a proper logger)
                console.error('Unexpected error in getPlayersByNationality:', error)
                return res.status(500).json({ success: false, message: "An internal server error occurred" })
            }
        }
    }
}
