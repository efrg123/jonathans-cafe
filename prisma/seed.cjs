/* eslint-disable no-console */
// prisma/seed.cjs
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL } },
});

// ---- helpers ----
async function ensureRestaurant(name, location) {
  const existing = await prisma.restaurant.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.restaurant.create({ data: { name, location } });
}

async function ensureTable(restaurantId, number, capacity) {
  const existing = await prisma.table.findFirst({ where: { restaurantId, number } });
  if (existing) return existing;
  return prisma.table.create({ data: { restaurantId, number, capacity } });
}

async function ensureMenu(restaurantId, item) {
  // Your "menu items" model is Menu (name, description, price Float)
  const existing = await prisma.menu.findFirst({ where: { restaurantId, name: item.name } });
  if (existing) return existing;
  return prisma.menu.create({ data: { restaurantId, ...item } });
}

async function ensurePricingRule(rule) {
  const existing = await prisma.pricingRule.findFirst({
    where: {
      restaurantId: rule.restaurantId,
      tableId: rule.tableId ?? null,
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      isActive: true,
    },
  });
  if (existing) return existing;
  return prisma.pricingRule.create({ data: { ...rule, isActive: true } });
}

async function ensureReservation(res) {
  const existing = await prisma.reservation.findFirst({
    where: { restaurantId: res.restaurantId, tableId: res.tableId, startsAt: res.startsAt },
  });
  if (existing) return existing;
  return prisma.reservation.create({ data: res });
}

function addHours(d, h) { const x = new Date(d); x.setHours(x.getHours() + h); return x; }
function addMinutes(d, m) { const x = new Date(d); x.setMinutes(x.getMinutes() + m); return x; }

// ---- seed ----
(async () => {
  console.log("?? Seeding…");

  // Restaurants
  const jon = await ensureRestaurant("Jonathan's Cafe", "Islamabad");
  const ali = await ensureRestaurant("Ali's Bistro", "Islamabad");

  // Tables (matches Table.number + Table.capacity)
  const jt1 = await ensureTable(jon.id, 1, 4);
  const jt2 = await ensureTable(jon.id, 2, 2);
  const jt3 = await ensureTable(jon.id, 3, 4);
  await ensureTable(ali.id, 1, 2);
  await ensureTable(ali.id, 2, 4);

  // Menu items (your Menu model uses Float price)
  await ensureMenu(jon.id, { name: "House Latte",       description: "Double shot, velvety milk",  price: 650.0 });
  await ensureMenu(jon.id, { name: "Chicken Panini",     description: "Grilled chicken, pesto, mozzarella", price: 1290.0 });
  await ensureMenu(jon.id, { name: "Blueberry Pancakes", description: "Stack of 3 with maple syrup", price: 950.0 });
  await ensureMenu(ali.id, { name: "Mixed Grill",        description: "Seekh, boti, tikka — platter", price: 1990.0 });
  await ensureMenu(ali.id, { name: "Mint Lemonade",      description: "Fresh mint, lemon, soda",     price: 450.0 });

  // Yield pricing rules (Mon–Fri off-peak discount; weekend brunch surcharge; table-specific dinner premium)
  const weekdays = [1,2,3,4,5];   // Mon..Fri
  for (const dow of weekdays) {
    await ensurePricingRule({ restaurantId: jon.id, tableId: null, dayOfWeek: dow, startTime: "15:00", endTime: "17:30", adjustmentPercent: -20 });
  }
  for (const dow of [0,6]) {      // Sun, Sat
    await ensurePricingRule({ restaurantId: jon.id, tableId: null, dayOfWeek: dow, startTime: "10:00", endTime: "12:00", adjustmentPercent: +10 });
  }
  for (const dow of weekdays) {
    await ensurePricingRule({ restaurantId: jon.id, tableId: jt2.id, dayOfWeek: dow, startTime: "19:00", endTime: "21:00", adjustmentPercent: +12 });
  }

  // Prepaid reservation — 72h from now @ 15:00 (off-peak), 90 minutes
  const threeDays = addHours(new Date(), 72);
  const startsAt = new Date(threeDays.getFullYear(), threeDays.getMonth(), threeDays.getDate(), 15, 0, 0, 0);
  const endsAt   = addMinutes(startsAt, 90);

  await ensureReservation({
    restaurantId: jon.id,
    tableId: jt2.id,
    customerName: "Test Guest",
    partySize: 2,
    startsAt,
    endsAt,
    status: "confirmed",
    isPrepaid: true,
    prepaidAmount: 300.0, // same unit as Menu.price (Float)
  });

  console.log("? Seed complete");
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error("? Seed error", e);
  await prisma.$disconnect();
  process.exit(1);
});
