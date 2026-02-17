import { NotFoundError } from "../errors/httpClientErrors";
import { PlayerModel } from "../models/player";

export class PlayerService {
    static getAllPlayers = async (limit: number, nextCursor?: number) => {
        return await PlayerModel.getAll(limit, nextCursor)
    }

    static getPlayerById = async (id: number) => {
        const player = await PlayerModel.getByID(id)
        if(!player) { 
            throw new NotFoundError(`The player with id='${id}' was not found.`)
        }
        return player
    }

    static getPlayersByNationality = async (nation: string, limit: number, nextCursor?: number) => {
        return await PlayerModel.getByNationality(nation, limit, nextCursor);
    }
}
