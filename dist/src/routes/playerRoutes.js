"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerRouter = void 0;
const express_1 = __importDefault(require("express"));
const playerController_1 = require("../controllers/playerController");
exports.PlayerRouter = express_1.default.Router();
exports.PlayerRouter.get("/all", playerController_1.PlayerController.getAllPlayers);
exports.PlayerRouter.get("/:id", playerController_1.PlayerController.getPlayerById);
exports.PlayerRouter.get("/nations/:nation", playerController_1.PlayerController.getPlayersByNationality);
