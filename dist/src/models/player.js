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
PlayerModel.getByNationality = async (nation, cursor, pageSize = 10) => {
    const players = await prisma_1.prisma.player_info.findMany({
        take: pageSize,
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
        next_cursor: players.length == pageSize ? players[pageSize - 1].player_id : null
    };
};
PlayerModel.getByID = async (id) => {
    return await prisma_1.prisma.player_info.findUniqueOrThrow({
        where: {
            player_id: id
        }
    });
};
PlayerModel.getAll = async () => {
    return await prisma_1.prisma.player_info.findMany({
        orderBy: {
            first_name: "asc"
        }
    });
};
