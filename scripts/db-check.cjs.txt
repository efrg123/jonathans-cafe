require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL } },
});

(async () => {
  try {
    const restaurants   = await prisma.restaurant.findMany({ take: 10 });
    const tables        = await prisma.table.findMany({ take: 10 });
    const menus         = await prisma.menu.findMany({ take: 10 });
    const pricingRules  = await prisma.pricingRule?.findMany?.({ take: 10 }) ?? [];
    const reservations  = await prisma.reservation?.findMany?.({ take: 10 }) ?? [];
    console.log({ restaurants, tables, menus, pricingRules, reservations });
  } catch (e) {
    console.error('Query failed:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
