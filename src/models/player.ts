import { prisma } from "../config/prisma"

export class PlayerModel {
    static getAllNations = async () => {
        return await prisma.player_info.findMany({
            select: {
                nationality: true
            }, 

            distinct: ['nationality']
        })
    }

    static getByNationality = async (nation: string, limit: number, cursor?: number) => {
        const players = await prisma.player_info.findMany({
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { player_id: cursor } : undefined,
            where: {
                nationality: nation
            },

            orderBy: {
                player_id: "asc"
            }
        })

        return {
            data: players,
            nextCursor: players.length == limit ? players[players.length - 1].player_id : null
        }
    }

    static getByID = async (id: number) => {
        return await prisma.player_info.findUnique({
            where: {
                player_id: id
            }
        })
    }

    static getAll = async (limit: number, cursor?: number) => {
        const players = await prisma.player_info.findMany({
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { player_id: cursor } : undefined,
            orderBy: {
                player_id: "asc"
            }
        })

        return {
            data: players,
            nextCursor: players.length == limit ? players[players.length - 1].player_id : null
        }
    }
}