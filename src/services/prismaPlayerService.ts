import { NotFoundError } from "../errors/httpClientErrors";
import { PlayerModel } from "../models/player";
import { parseCountryCode } from "../utilities/parseCountryCode";
import { parseIntegerParam } from "../utilities/parseIntegerParam";
import { IPlayerService } from "../interfaces/iPlayerService";

export class PrismaPlayerService implements IPlayerService {
    getAllPlayers = async (limit: number, nextCursor?: number) => {
        return await PlayerModel.getAll(limit, nextCursor)
    }

    getPlayerById = async (id: string | string[]) => {
        const idNum = parseIntegerParam(id, "id")
        const player = await PlayerModel.getByID(idNum)
        if(!player) { 
            throw new NotFoundError(`The player with id='${id}' was not found.`)
        }
        return player
    }

    getPlayersByNationality = async (nation: string | string[], limit: number, nextCursor?: number) => {
        const nationCode = parseCountryCode(nation, "nation")
        const players = await PlayerModel.getByNationality(nationCode, limit, nextCursor);
        if(players.data.length === 0) {
            throw new NotFoundError(`No players with nationality='${nationCode}' was not found.`)
        }

        return players
    }
}
