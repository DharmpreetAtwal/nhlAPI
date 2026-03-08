import "../types/pagination";
import { NextFunction, Request, Response } from "express";
import { IPlayerService } from "../interfaces/iPlayerService";
import { sendSuccess } from "../utilities/sendSucess";

export class PlayerController {
    private readonly playerService: IPlayerService;
    constructor(playerService: IPlayerService) {
        this.playerService = playerService
    }

    getAllPlayers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, nextCursor } = req.pagination
            const players = await this.playerService.getAllPlayers(limit, nextCursor)
            return sendSuccess(res, players)
        } catch(error) {
            next(error)
        }
    }

    getPlayerById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id
            const player = await this.playerService.getPlayerById(id)
            return sendSuccess(res, player)
        } catch(error) {
            next(error)
        }
    }

    getPlayersByNationality = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, nextCursor } = req.pagination
            const nation = req.params.nation
            const players = await this.playerService.getPlayersByNationality(nation, limit, nextCursor)
            return sendSuccess(res, players)
        } catch(error) {
            next(error)
        }
    }
}
