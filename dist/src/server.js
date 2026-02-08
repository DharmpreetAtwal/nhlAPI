"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const prisma_1 = require("./config/prisma");
const PORT = process.env.PORT || 3000;
app_1.app.listen(PORT, () => {
    console.log("Server running at http://localhost:" + PORT);
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
});
process.on('SIGINT', async () => {
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
