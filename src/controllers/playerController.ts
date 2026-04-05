import "../types/pagination";
import { NextFunction, Request, Response } from "express";
import { IPlayerService } from "../interfaces/iPlayerService";
import { ICacheService } from "../interfaces/iCacheService";
import { sendSuccess } from "../utilities/sendSucess";
import { player_info } from "@prisma/client";

const TTL_PLAYER = 300;   // 5 minutes for single player lookups
const TTL_LIST   = 120;   // 2 minutes for paginated lists

export class PlayerController {
    private readonly playerService: IPlayerService;
    private readonly cache: ICacheService;

    constructor(playerService: IPlayerService, cache: ICacheService) {
        this.playerService = playerService;
        this.cache = cache;
    }

    getAllPlayers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, nextCursor } = req.pagination;
            const cacheKey = `players:all:${limit}:${nextCursor ?? "start"}`;

            const cached = await this.cache.get<{ data: player_info[]; nextCursor: number | null }>(cacheKey);
            if (cached) return sendSuccess(res, cached);

            const players = await this.playerService.getAllPlayers(limit, nextCursor);
            await this.cache.set(cacheKey, players, TTL_LIST);
            return sendSuccess(res, players);
        } catch (error) {
            next(error);
        }
    };

    getPlayerById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const cacheKey = `player:${id}`;

            const cached = await this.cache.get<player_info>(cacheKey);
            if (cached) return sendSuccess(res, cached);

            const player = await this.playerService.getPlayerById(id);
            await this.cache.set(cacheKey, player, TTL_PLAYER);
            return sendSuccess(res, player);
        } catch (error) {
            next(error);
        }
    };

    getPlayersByNationality = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, nextCursor } = req.pagination;
            const nation = req.params.nation;
            const cacheKey = `players:nation:${nation}:${limit}:${nextCursor ?? "start"}`;

            const cached = await this.cache.get<{ data: player_info[]; nextCursor: number | null }>(cacheKey);
            if (cached) return sendSuccess(res, cached);

            const players = await this.playerService.getPlayersByNationality(nation, limit, nextCursor);
            await this.cache.set(cacheKey, players, TTL_LIST);
            return sendSuccess(res, players);
        } catch (error) {
            next(error);
        }
    };
}
