import { NotFoundError } from "../errors/httpClientErrors";
import { PlayerModel } from "../models/player";
import { parseCountryCode } from "../utilities/parseCountryCode";
import { parseIntegerParam } from "../utilities/parseIntegerParam";

export class PlayerService {
    static getAllPlayers = async (limit: number, nextCursor?: number) => {
        return await PlayerModel.getAll(limit, nextCursor)
    }

    static getPlayerById = async (id: string | string[]) => {
        const idNum = parseIntegerParam(id, "id")
        const player = await PlayerModel.getByID(idNum)
        if(!player) { 
            throw new NotFoundError(`The player with id='${id}' was not found.`)
        }
        return player
    }

    static getPlayersByNationality = async (nation: string | string[], limit: number, nextCursor?: number) => {
        const nationCode = parseCountryCode(nation, "nation")
        const players = await PlayerModel.getByNationality(nationCode, limit, nextCursor);
        if(players.data.length === 0) {
            throw new NotFoundError(`No players with nationality='${nationCode}' was not found.`)
        }

        return players
    }
}
