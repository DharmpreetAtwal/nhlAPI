import express from "express"
import { PlayerController } from "../controllers/playerController"
import { parsePagination } from "../middleware/parsePagination"
import { PrismaPlayerService } from "../services/prismaPlayerService"
export const PlayerRouterV1 = express.Router()

const playerController = new PlayerController(new PrismaPlayerService())

PlayerRouterV1.get("/all", parsePagination, playerController.getAllPlayers)
PlayerRouterV1.get("/nations/{:nation}", parsePagination, playerController.getPlayersByNationality)
PlayerRouterV1.get("/:id", playerController.getPlayerById)
