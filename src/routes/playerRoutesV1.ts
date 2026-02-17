import express from "express"
import { PlayerController } from "../controllers/playerController"
import { parsePagination } from "../middleware/parsePagination"
export const PlayerRouterV1 = express.Router()

PlayerRouterV1.get("/all", parsePagination, PlayerController.getAllPlayers)
PlayerRouterV1.get("/nations/{:nation}", parsePagination, PlayerController.getPlayersByNationality)
PlayerRouterV1.get("/:id", PlayerController.getPlayerById)
