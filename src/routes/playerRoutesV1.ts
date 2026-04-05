import express from "express"
import { PlayerController } from "../controllers/playerController"
import { parsePagination } from "../middleware/parsePagination"
import { authMiddleware } from "../middleware/authMiddleware"
import { PrismaPlayerService } from "../services/prismaPlayerService"
import { RedisCacheService } from "../services/redisCacheService"
export const PlayerRouterV1 = express.Router()

const cache = new RedisCacheService(process.env.REDIS_URL ?? "redis://localhost:6379")
const playerController = new PlayerController(new PrismaPlayerService(), cache)

PlayerRouterV1.use(authMiddleware)

PlayerRouterV1.get("/all", parsePagination, playerController.getAllPlayers)
PlayerRouterV1.get("/nations/{:nation}", parsePagination, playerController.getPlayersByNationality)
PlayerRouterV1.get("/:id", playerController.getPlayerById)

