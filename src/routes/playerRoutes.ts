import express from "express"
import { PlayerController } from "../controllers/playerController"
export const PlayerRouter = express.Router()

PlayerRouter.get("/nations/:nation", PlayerController.getPlayersByNationality)
PlayerRouter.get("/all", PlayerController.getAllPlayers)
PlayerRouter.get("/:id", PlayerController.getPlayerById)
