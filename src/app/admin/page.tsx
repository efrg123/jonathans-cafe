export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "../../lib/prisma";
import AutoRefresh from "../../components/AutoRefresh";

function fmt(dt: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(dt);
}

export default async function AdminPage() {
  // Load dashboard counts
  const [restaurants, tables, menus, pricingRules, reservations] = await Promise.all([
    prisma.restaurant.findMany({ orderBy: { id: "asc" } }),
    prisma.table.findMany({ orderBy: { id: "asc" } }),
    prisma.menu.findMany({ orderBy: { id: "asc" } }),
    prisma.pricingRule.findMany({ orderBy: { id: "asc" } }),
    prisma.reservation.findMany({
      orderBy: { startsAt: "desc" },
      take: 50,
      include: { restaurant: true, table: true },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#f5f5ef] p-6">
      {/* auto refresh every 5s so new bookings show up during the demo */}
      <AutoRefresh seconds={5} />

      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1d7a73]">Admin</h1>
          <div className="text-sm text-slate-600">
            Auto-refreshing every 5s
          </div>
        </header>

        {/* KPIs */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Restaurants", value: restaurants.length },
            { label: "Tables", value: tables.length },
            { label: "Menu Items", value: menus.length },
            { label: "Pricing Rules", value: pricingRules.length },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="text-slate-500 text-sm">{k.label}</div>
              <div className="text-2xl font-semibold">{k.value}</div>
            </div>
          ))}
        </section>

        {/* Bookings list */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Bookings</h2>
            <a
              href="/book"
              className="px-3 py-1.5 rounded-xl bg-[#1d7a73] text-white hover:bg-[#17635e] text-sm"
            >
              Create Booking
            </a>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2">
              <thead className="text-left text-sm text-slate-600">
                <tr>
                  {[
                    "ID",
                    "Guest",
                    "Restaurant",
                    "Table",
                    "Party",
                    "Starts",
                    "Ends",
                    "Status",
                    "Prepaid",
                  ].map((h) => (
                    <th key={h} className="px-3 py-1">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className="bg-[#f8f7f3]">
                    <td className="px-3 py-2 font-medium">{r.id}</td>
                    <td className="px-3 py-2">{r.customerName}</td>
                    <td className="px-3 py-2">{r.restaurant?.name ?? r.restaurantId}</td>
                    <td className="px-3 py-2">Table {r.table?.number ?? r.tableId}</td>
                    <td className="px-3 py-2">{r.partySize}</td>
                    <td className="px-3 py-2">{fmt(r.startsAt)}</td>
                    <td className="px-3 py-2">{fmt(r.endsAt)}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-xl px-2 py-0.5 bg-slate-900 text-white text-xs">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {r.isPrepaid ? (
                        <span className="rounded-xl px-2 py-0.5 bg-emerald-600 text-white text-xs">
                          ${Number(r.prepaidAmount ?? 0).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}

                {!reservations.length && (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-slate-500">
                      No reservations yet. Create one via <a className="underline" href="/book">/book</a>.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
