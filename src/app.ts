import express from "express"
import { PlayerRouter } from "./routes/playerRoutes"

export const app = express()

app.use(express.json())
app.use("/players", PlayerRouter)