import 'dotenv/config'
import {app} from "./app"
import {prisma} from "./config/prisma"
import {logger} from "./config/logger"

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`)
})

process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  logger.info('Database connection closed');
  process.exit(0);
});