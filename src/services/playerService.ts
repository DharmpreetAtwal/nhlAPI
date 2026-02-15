import { PlayerModel } from "../models/player";

export class PlayerService {
    static getAllPlayers = async (limit?: number, nextCursor?: number) => {
        let validatedLimit = limit
        if (validatedLimit === undefined) {
            validatedLimit = 10
        } else if(validatedLimit > 20) {
            validatedLimit = 20
        }

        return await PlayerModel.getAll(validatedLimit, nextCursor)
    }

    static getPlayerById = async (id: number) => {
        return await PlayerModel.getByID(id)
    }

    static getPlayersByNationality = async (nation: string, limit?: number, nextCursor?: number) => {
        let validatedLimit = limit
        if (validatedLimit === undefined) {
            validatedLimit = 10
        } else if(validatedLimit > 20) {
            validatedLimit = 20
        }

        return await PlayerModel.getByNationality(nation, validatedLimit, nextCursor);
    }
}
