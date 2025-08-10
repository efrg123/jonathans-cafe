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

  // --- Clear existing data for a clean seed ---
  // FIX: Delete dependent records (Reservation) before their dependencies (Table)
  await prisma.orderItem.deleteMany({});
  await prisma.reservation.deleteMany({}); // Added this line
  await prisma.pricingRule.deleteMany({});
  await prisma.menuTag.deleteMany({});
  await prisma.menu.deleteMany({});
  await prisma.table.deleteMany({});
  await prisma.restaurant.deleteMany({});
  console.log('Cleared previous data.');

  // --- Create Jonathan's Cafe ---
  const jonathans = await prisma.restaurant.create({
    data: {
      id: 1,
      name: "Jonathan's Cafe",
      location: '123 Main St',
      tables: {
        create: [{ id: 1, number: 1, capacity: 4 }],
      },
    },
  });
  console.log("Created Jonathan's Cafe");

  const menuBurger = await prisma.menu.create({
    data: { name: 'Classic Burger', price: 12.99, restaurantId: jonathans.id },
  });
  const menuWrap = await prisma.menu.create({
    data: { name: 'Veggie Wrap', price: 9.99, restaurantId: jonathans.id },
  });
  const menuSalad = await prisma.menu.create({
    data: { name: 'Grilled Chicken Salad', price: 14.5, restaurantId: jonathans.id },
  });

  // --- Create Ali's Bistro ---
  const alis = await prisma.restaurant.create({
    data: {
      id: 2,
      name: "Ali's Bistro",
      location: '456 Market St',
    },
  });
  console.log("Created Ali's Bistro");
  await prisma.menu.create({
    data: { name: 'Pasta Carbonara', price: 18.00, restaurantId: alis.id },
  });
  await prisma.menu.create({
    data: { name: 'Margherita Pizza', price: 15.50, restaurantId: alis.id },
  });

  // --- Create McDonald's ---
  const mcdonalds = await prisma.restaurant.create({
    data: {
      id: 3,
      name: "McDonald's",
      location: '789 Fast Food Ln',
    },
  });
  console.log("Created McDonald's");
  await prisma.menu.create({
    data: { name: 'Big Mac', price: 5.99, restaurantId: mcdonalds.id },
  });
  await prisma.menu.create({
    data: { name: 'McNuggets (10pc)', price: 6.49, restaurantId: mcdonalds.id },
  });

  // --- Create MenuTags for Food Passport ---
  const tagVegetarian = await prisma.menuTag.create({ data: { name: 'Vegetarian' } });
  const tagHalal = await prisma.menuTag.create({ data: { name: 'Halal' } });
  const tagGlutenFree = await prisma.menuTag.create({ data: { name: 'Gluten-Free' } });
  console.log('Menu tags created.');

  // --- Connect Tags to Menus ---
  await prisma.menu.update({
    where: { id: menuWrap.id },
    data: { tags: { connect: { id: tagVegetarian.id } } },
  });
  await prisma.menu.update({
    where: { id: menuSalad.id },
    data: { tags: { connect: [{ id: tagHalal.id }, { id: tagGlutenFree.id }] } },
  });
  console.log('Tags connected.');

  // --- Create PricingRule for Jonathan's Cafe ---
  await prisma.pricingRule.create({
    data: {
      restaurantId: jonathans.id,
      dayOfWeek: 5, // Friday
      startTime: '17:00',
      endTime: '19:00',
      adjustmentPercent: -20,
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
