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

  // --- CORRECTED: Clear all data in the correct order ---
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({}); // Added
  await prisma.reservation.deleteMany({});
  await prisma.pricingRule.deleteMany({});
  await prisma.menu.deleteMany({}); // Must be before Category and Restaurant
  await prisma.menuTag.deleteMany({});
  await prisma.category.deleteMany({}); // Added
  await prisma.table.deleteMany({});
  await prisma.restaurant.deleteMany({});
  console.log('Cleared previous data.');

  // --- Create Category First ---
  const mainCategory = await prisma.category.create({
    data: {
      id: 1, // Explicitly set ID for predictability
      name: 'Main Courses',
    },
  });
  console.log('Created main category.');

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

  // --- Create Menus for Jonathan's Cafe ---
  const menuBurger = await prisma.menu.create({
    data: {
      name: 'Classic Burger',
      description: 'A juicy all-beef patty with lettuce, tomato, and our special sauce.',
      price: 12.99,
      restaurant: { connect: { id: jonathans.id } },
      category: { connect: { id: mainCategory.id } },
    },
  });

  const menuWrap = await prisma.menu.create({
    data: {
      name: 'Veggie Wrap',
      price: 9.99,
      restaurant: { connect: { id: jonathans.id } }, // Corrected
      category: { connect: { id: mainCategory.id } }, // Corrected
    },
  });

  const menuSalad = await prisma.menu.create({
    data: {
      name: 'Grilled Chicken Salad',
      price: 14.5,
      restaurant: { connect: { id: jonathans.id } }, // Corrected
      category: { connect: { id: mainCategory.id } }, // Corrected
    },
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
    data: {
      name: 'Pasta Carbonara',
      price: 18.0,
      restaurant: { connect: { id: alis.id } }, // Corrected
      category: { connect: { id: mainCategory.id } }, // Corrected
    },
  });

  await prisma.menu.create({
    data: {
      name: 'Margherita Pizza',
      price: 15.5,
      restaurant: { connect: { id: alis.id } }, // Corrected
      category: { connect: { id: mainCategory.id } }, // Corrected
    },
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
    data: {
      name: 'Big Mac',
      price: 5.99,
      restaurant: { connect: { id: mcdonalds.id } }, // Corrected
      category: { connect: { id: mainCategory.id } }, // Corrected
    },
  });
  await prisma.menu.create({
    data: {
      name: 'McNuggets (10pc)',
      price: 6.49,
      restaurant: { connect: { id: mcdonalds.id } }, // Corrected
      category: { connect: { id: mainCategory.id } }, // Corrected
    },
  });
  console.log('All menus created.');

  // --- Create and Connect MenuTags ---
  const tagVegetarian = await prisma.menuTag.create({ data: { name: 'Vegetarian' } });
  const tagHalal = await prisma.menuTag.create({ data: { name: 'Halal' } });
  console.log('Menu tags created.');

  await prisma.menu.update({
    where: { id: menuWrap.id },
    data: { tags: { connect: { id: tagVegetarian.id } } },
  });
  await prisma.menu.update({
    where: { id: menuSalad.id },
    data: { tags: { connect: { id: tagHalal.id } } },
  });
  console.log('Tags connected.');

  // --- Create PricingRule ---
  await prisma.pricingRule.create({
    data: {
      name: 'Friday Happy Hour',
      dayOfWeek: 5, // Friday
      startTime: '17:00',
      endTime: '19:00',
      adjustmentPercent: -20,
      isActive: true,
      restaurant: { connect: { id: jonathans.id } }, // Use connect for consistency
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