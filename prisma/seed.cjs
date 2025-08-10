const { PrismaClient } = require('@prisma/client');

// Use the DIRECT_DATABASE_URL for seeding
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_DATABASE_URL,
    },
  },
});

async function main() {
  console.log(`Start seeding ...`);

  // --- Clear existing data to prevent duplicates ---
  await prisma.pricingRule.deleteMany({});
  console.log('Deleted records in pricingRule table');

  // When we delete all MenuTags, Prisma automatically handles disconnecting them from Menus.
  await prisma.menuTag.deleteMany({});
  console.log('Deleted records in menuTag table');

  // --- Create Restaurants and Menus (if they don't exist) ---
  const restaurant1 = await prisma.restaurant.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Jonathan's Cafe",
      location: '123 Main St',
    },
  });

  const table1 = await prisma.table.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      number: 1,
      capacity: 4,
      restaurantId: restaurant1.id,
    },
  });

  // We need to delete old menus to prevent them from piling up on each seed
  await prisma.orderItem.deleteMany({});
  await prisma.menu.deleteMany({});

  const menu1 = await prisma.menu.create({
    data: {
      name: 'Classic Burger',
      price: 12.99,
      restaurantId: restaurant1.id,
    },
  });

  const menu2 = await prisma.menu.create({
    data: {
      name: 'Veggie Wrap',
      price: 9.99,
      restaurantId: restaurant1.id,
    },
  });

  const menu3 = await prisma.menu.create({
    data: {
      name: 'Grilled Chicken Salad',
      price: 14.5,
      restaurantId: restaurant1.id,
    },
  });

  console.log('Created base restaurants, tables, and menus.');

  // --- Create MenuTags for Food Passport ---
  console.log('Creating menu tags...');
  const tagVegetarian = await prisma.menuTag.create({
    data: { name: 'Vegetarian' },
  });
  const tagHalal = await prisma.menuTag.create({
    data: { name: 'Halal' },
  });
  const tagGlutenFree = await prisma.menuTag.create({
    data: { name: 'Gluten-Free' },
  });
  console.log('Menu tags created.');

  // --- Connect Tags to Menus ---
  console.log('Connecting tags to menu items...');
  await prisma.menu.update({
    where: { id: menu2.id },
    data: {
      tags: {
        connect: { id: tagVegetarian.id },
      },
    },
  });

  await prisma.menu.update({
    where: { id: menu3.id },
    data: {
      tags: {
        connect: [{ id: tagHalal.id }, { id: tagGlutenFree.id }],
      },
    },
  });
  console.log('Tags connected.');

  // --- Create a PricingRule for Dynamic Pricing ---
  console.log('Creating pricing rules...');
  await prisma.pricingRule.create({
    data: {
      restaurantId: restaurant1.id,
      dayOfWeek: 5, // Friday
      startTime: '17:00', // 5:00 PM
      endTime: '19:00', // 7:00 PM
      adjustmentPercent: -20, // 20% discount
      isActive: true,
      name: 'Friday Happy Hour',
    },
  });
  console.log('Pricing rules created.');

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
