export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "../../../lib/prisma";

type Props = { params: Promise<{ slug: string }> };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const all = await prisma.restaurant.findMany();
  const found = all.find((r) => slugify(r.name) === slug);
  if (!found) {
    return (
      <main className="min-h-screen bg-[#f5f5ef] p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-8">
            <h1 className="text-xl font-semibold text-rose-700">Restaurant not found</h1>
            <a className="underline mt-2 inline-block" href="/restaurants">← Back to restaurants</a>
          </div>
        </div>
      </main>
    );
  }

  const [menu, tables] = await Promise.all([
    prisma.menu.findMany({ where: { restaurantId: found.id }, orderBy: { id: "asc" } }),
    prisma.table.findMany({ where: { restaurantId: found.id }, orderBy: { number: "asc" } }),
  ]);

  return (
    <main className="min-h-screen bg-[#f5f5ef] p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1d7a73]">{found.name}</h1>
            <p className="text-sm text-slate-600">{found.location ?? "—"}</p>
          </div>
          <a href="/book" className="px-4 py-2 rounded-xl bg-[#1d7a73] text-white hover:bg-[#17635e]">Book a Table</a>
        </header>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-3">Menu</h2>
          <ul className="space-y-2">
            {menu.length ? menu.map((m) => (
              <li key={m.id} className="flex items-center justify-between">
                <span>{m.name}</span>
                <span className="font-medium">${Number(m.price).toFixed(2)}</span>
              </li>
            )) : <li className="text-slate-500">No menu items yet.</li>}
          </ul>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-3">Tables</h2>
          <div className="flex flex-wrap gap-2">
            {tables.length ? tables.map(t => (
              <span key={t.id} className="px-3 py-1.5 rounded-xl bg-[#f2efe8] text-slate-700">
                Table {t.number} · {t.capacity} ppl
              </span>
            )) : <span className="text-slate-500">No tables yet.</span>}
          </div>
        </section>
      </div>
    </main>
  );
}
