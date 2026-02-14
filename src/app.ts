import express from "express"
import { PlayerRouterV1 } from "./routes/playerRoutesV1"
import { requestLogger } from "./middleware/requestLogger"
import { errorHandler } from "./middleware/errorHandler"

export const app = express()

app.use(express.json())

app.use(requestLogger)

app.use("/v1/players", PlayerRouterV1)

app.use(errorHandler)