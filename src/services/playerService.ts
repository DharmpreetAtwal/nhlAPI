import { PlayerModel } from "../models/player";

export class PlayerService {
    static getAllPlayers = async (limit: number, nextCursor?: number) => {
        return await PlayerModel.getAll(limit, nextCursor)
    }

    static getPlayerById = async (id: number) => {
        return await PlayerModel.getByID(id)
    }

    static getPlayersByNationality = async (nation: string, limit: number, nextCursor?: number) => {
        return await PlayerModel.getByNationality(nation, limit, nextCursor);
    }
}
