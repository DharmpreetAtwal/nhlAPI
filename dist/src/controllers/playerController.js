"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerController = void 0;
const client_1 = require("@prisma/client/runtime/client");
const player_1 = require("../models/player");
class PlayerController {
}
exports.PlayerController = PlayerController;
_a = PlayerController;
PlayerController.getAllPlayers = async (req, res) => {
    try {
        const players = await player_1.PlayerModel.getAll();
        res.json({ success: true, data: players });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message });
        }
        else {
            res.status(500).json({ success: false, message: "Unknown error: " + error });
        }
    }
};
PlayerController.getPlayerById = async (req, res) => {
    const id = req.params.id;
    try {
        const player = await player_1.PlayerModel.getByID(parseInt(id));
        res.status(200).json({ success: true, data: player });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message });
        }
        else if (error instanceof client_1.PrismaClientKnownRequestError) {
            res.status(404).json({ success: false, message: `The player with id=${id} does not exist.` });
        }
        else {
            res.status(500).json({ success: false, message: "Unknown error: " + error });
        }
    }
};
PlayerController.getPlayersByNationality = async (req, res) => {
    const nation = req.params.nation;
    const page = req.query.page;
    const limit = req.query.limit;
    try {
        const players = await player_1.PlayerModel.getByNationality(nation.toUpperCase());
        res.status(200).json({ success: true, data: players });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message });
        }
        else {
            res.status(500).json({ success: false, message: "Unknown error: " + error });
        }
    }
};
