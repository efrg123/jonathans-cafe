// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_DATABASE_URL,
    },
  },
});

async function main() {
  console.log(`Start seeding ...`);

  // Clear all data in the correct order
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.pricingRule.deleteMany({});
  await prisma.menu.deleteMany({});
  await prisma.menuTag.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.table.deleteMany({});
  await prisma.restaurant.deleteMany({});
  console.log('Cleared previous data.');

  // Create a default Category first
  const mainCategory = await prisma.category.create({
    data: {
      id: 1, // Use a predictable ID
      name: 'Main Courses',
    },
  });
  console.log('Created main category.');

  // Create Restaurants and their Menus
  const jonathans = await prisma.restaurant.create({
    data: {
      id: 1,
      name: "Jonathan's Cafe",
      location: '123 Main St',
      menus: {
        create: [
          // CORRECTED: Added categoryId to each item
          { name: 'Classic Burger', price: 12.99, description: 'A juicy all-beef patty', categoryId: mainCategory.id },
          { name: 'Veggie Wrap', price: 9.99, description: 'Fresh veggies and hummus', categoryId: mainCategory.id },
          { name: 'Grilled Chicken Salad', price: 14.50, description: 'Healthy and delicious', categoryId: mainCategory.id },
        ],
      },
      tables: {
        create: [{ id: 1, number: 1, capacity: 4 }],
      },
    },
  });
  console.log("Created Jonathan's Cafe and its menu.");

  const alis = await prisma.restaurant.create({
    data: {
      id: 2,
      name: "Ali's Bistro",
      location: '456 Market St',
      menus: {
        create: [
          // CORRECTED: Added categoryId to each item
          { name: 'Pasta Carbonara', price: 18.00, description: 'Creamy pasta dish', categoryId: mainCategory.id },
          { name: 'Margherita Pizza', price: 15.50, description: 'Classic pizza', categoryId: mainCategory.id },
        ],
      },
    },
  });
  console.log("Created Ali's Bistro and its menu.");

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });