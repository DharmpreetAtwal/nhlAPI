import express from "express"
import { PlayerRouter } from "./routes/playerRoutes"
import { requestLogger } from "./middleware/requestLogger"
import { errorHandler } from "./middleware/errorHandler"

export const app = express()

app.use(express.json())

app.use(requestLogger)

app.use("/players", PlayerRouter)

app.use(errorHandler)