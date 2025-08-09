import { prisma } from "../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({ orderBy: { id: "asc" } });

  return (
    <main className="min-h-screen bg-[#f5f5ef] p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-[#1d7a73]">Select a Restaurant</h1>
          <p className="text-slate-600 mt-1">Start a booking or browse menus.</p>
        </header>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map((r) => {
            const slug = r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            return (
              <li key={r.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900">{r.name}</h3>
                <p className="text-sm text-slate-600">{r.location ?? "—"}</p>
                <div className="mt-4 flex gap-2">
                  <a href={`/r/${slug}`} className="px-3 py-1.5 rounded-xl bg-[#1d7a73] text-white hover:bg-[#17635e] text-sm">
                    View
                  </a>
                  <a href={`/book`} className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm">
                    Book
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
