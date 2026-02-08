import 'dotenv/config'
import {app} from "./app"
import {prisma} from "./config/prisma"

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running at http://localhost:" + PORT)
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
})

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});