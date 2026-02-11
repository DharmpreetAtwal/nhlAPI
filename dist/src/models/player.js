"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerModel = void 0;
const prisma_1 = require("../config/prisma");
class PlayerModel {
}
exports.PlayerModel = PlayerModel;
_a = PlayerModel;
PlayerModel.getAllNations = async () => {
    return await prisma_1.prisma.player_info.findMany({
        select: {
            nationality: true
        },
        distinct: ['nationality']
    });
};
PlayerModel.getByNationality = async (nation, limit = 10, cursor) => {
    const players = await prisma_1.prisma.player_info.findMany({
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { player_id: cursor } : undefined,
        where: {
            nationality: nation
        },
        orderBy: {
            player_id: "asc"
        }
    });
    return {
        data: players,
        nextCursor: players.length == limit ? players[players.length - 1].player_id : null
    };
};
PlayerModel.getByID = async (id) => {
    return await prisma_1.prisma.player_info.findUnique({
        where: {
            player_id: id
        }
    });
};
PlayerModel.getAll = async (limit = 10, cursor) => {
    const players = await prisma_1.prisma.player_info.findMany({
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { player_id: cursor } : undefined,
        orderBy: {
            player_id: "asc"
        }
    });
    return {
        data: players,
        nextCursor: players.length == limit ? players[players.length - 1].player_id : null
    };
};
