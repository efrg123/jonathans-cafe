// src/app/admin/page.tsx
import { prisma } from "../../lib/prisma"; // relative to src/app/admin

export default async function Page() {
  const [restaurants, tables, menus, pricingRules, reservations] = await Promise.all([
    prisma.restaurant.findMany({ orderBy: { id: "asc" } }),
    prisma.table.findMany({ orderBy: { id: "asc" } }),
    prisma.menu.findMany({ orderBy: { id: "asc" } }),
    prisma.pricingRule.findMany({ orderBy: { id: "asc" } }).catch(() => []),
    prisma.reservation.findMany({ orderBy: { id: "asc" } }).catch(() => []),
  ]);

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Admin Data Viewer</h1>
      <section><h2>Restaurants</h2><pre>{JSON.stringify(restaurants, null, 2)}</pre></section>
      <section><h2>Tables</h2><pre>{JSON.stringify(tables, null, 2)}</pre></section>
      <section><h2>Menu</h2><pre>{JSON.stringify(menus, null, 2)}</pre></section>
      <section><h2>PricingRules</h2><pre>{JSON.stringify(pricingRules, null, 2)}</pre></section>
      <section><h2>Reservations</h2><pre>{JSON.stringify(reservations, null, 2)}</pre></section>
    </main>
  );
}
