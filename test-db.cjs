const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const restaurants = await prisma.restaurant.findMany({
    include: { menus: true, tables: true }
  });
  console.log("Restaurants in DB:", JSON.stringify(restaurants, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
