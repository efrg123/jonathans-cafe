import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding (INT schema)…");

  // wipe (dev-only)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.table.deleteMany();
  await prisma.restaurant.deleteMany();

  const jon = await prisma.restaurant.create({
    data: {
      name: "Jonathan's Cafe",
      location: "Main Street",
      tables: {
        create: [
          { number: 1, capacity: 4 },
          { number: 2, capacity: 2 },
        ],
      },
      menus: {
        create: [
          { name: "Cappuccino", description: "Espresso + milk foam", price: 400 },
          { name: "Avocado Toast", description: "Sourdough, avo, feta", price: 650 },
        ],
      },
    },
  });

  const ali = await prisma.restaurant.create({
    data: {
      name: "Ali's Bistro",
      location: "Downtown",
      tables: { create: [{ number: 1, capacity: 4 }] },
      menus: {
        create: [
          { name: "Chicken Biryani", price: 800 },
          { name: "Beef Seekh Kebab", price: 750 },
        ],
      },
    },
  });

  console.log("✅ Seeded restaurants:", jon.name, "&", ali.name);
}

main().then(()=>prisma.$disconnect()).catch(async (e)=>{console.error(e); await prisma.$disconnect(); process.exit(1);});
