"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const prisma_1 = require("./config/prisma");
const logger_1 = require("./config/logger");
const PORT = process.env.PORT || 3000;
app_1.app.listen(PORT, () => {
    logger_1.logger.info(`Server running at http://localhost:${PORT}`);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('Shutting down gracefully...');
    await prisma_1.prisma.$disconnect();
    logger_1.logger.info('Database connection closed');
    process.exit(0);
});
