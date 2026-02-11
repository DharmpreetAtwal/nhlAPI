"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerController = void 0;
const player_1 = require("../models/player");
const parseNumericUndefinedParam_1 = require("../helpers/parseNumericUndefinedParam");
const parseCountryCode_1 = require("../helpers/parseCountryCode");
class PlayerController {
}
exports.PlayerController = PlayerController;
_a = PlayerController;
PlayerController.getAllPlayers = async (req, res, next) => {
    try {
        let limit = (0, parseNumericUndefinedParam_1.parseIntegerUndefinedParam)(req.query.limit, "limit");
        if (limit && limit > 20) {
            limit = 20;
        }
        const nextCursor = (0, parseNumericUndefinedParam_1.parseIntegerUndefinedParam)(req.query.nextCursor, "nextCursor");
        const players = await player_1.PlayerModel.getAll(limit, nextCursor);
        return res.status(200).json({ success: true, data: players });
    }
    catch (error) {
        next(error);
    }
};
PlayerController.getPlayerById = async (req, res, next) => {
    try {
        const id = (0, parseNumericUndefinedParam_1.parseIntegerUndefinedParam)(req.params.id, "id");
        if (id === undefined) {
            return res.status(400).json({ success: false, message: `The parameter id must be defined.` });
        }
        const player = await player_1.PlayerModel.getByID(id);
        if (!player) {
            return res.status(404).json({ success: false, message: `The player with id='${id}' was not found.` });
        }
        return res.status(200).json({ success: true, data: player });
    }
    catch (error) {
        next(error);
    }
};
PlayerController.getPlayersByNationality = async (req, res, next) => {
    try {
        let limit = (0, parseNumericUndefinedParam_1.parseIntegerUndefinedParam)(req.query.limit, "limit");
        if (limit && limit > 20) {
            limit = 20;
        }
        const nextCursor = (0, parseNumericUndefinedParam_1.parseIntegerUndefinedParam)(req.query.nextCursor, "nextCursor");
        const nation = (0, parseCountryCode_1.parseCountryCode)(req.params.nation, "nation");
        const players = await player_1.PlayerModel.getByNationality(nation, limit, nextCursor);
        return res.status(200).json({ success: true, data: players });
    }
    catch (error) {
        next(error);
    }
};
