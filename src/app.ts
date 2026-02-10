import express from "express"
import { PlayerRouter } from "./routes/playerRoutes"
import { requestLogger } from "./middleware/requestLogger"

export const app = express()

app.use(express.json())
app.use(requestLogger)
app.use("/players", PlayerRouter)