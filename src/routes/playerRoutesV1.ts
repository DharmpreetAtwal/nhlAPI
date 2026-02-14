import express from "express"
import { PlayerController } from "../controllers/playerController"
export const PlayerRouterV1 = express.Router()

PlayerRouterV1.get("/all", PlayerController.getAllPlayers)
PlayerRouterV1.get("/nations/{:nation}", PlayerController.getPlayersByNationality)
PlayerRouterV1.get("/:id", PlayerController.getPlayerById)
