"use client";

import { useEffect, useMemo, useState } from "react";

const brand = {
  bg: "bg-[#f5f5ef]",       // soft off-white like your screenshot
  card: "bg-white",
  primary: "bg-[#1d7a73] text-white",               // teal button
  primaryHover: "hover:bg-[#17635e]",
  field: "bg-[#f2efe8] focus:ring-2 focus:ring-[#1d7a73] focus:outline-none",
  label: "text-[#1d7a73] font-medium",
};

type Restaurant = { id: number; name: string };
type Table = { id: number; number: number; restaurantId: number };

export default function BookPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | "">("");
  const [tableId, setTableId] = useState<number | "">("");
  const [partySize, setPartySize] = useState(2);
  const [startsAt, setStartsAt] = useState<string>(""); // local datetime
  const [name, setName] = useState("");
  const [menuPrice, setMenuPrice] = useState<number | "">("");
  const [quote, setQuote] = useState<{ basePrice: number; adjustmentPercent: number; finalPrice: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // tiny helper API we built earlier
    fetch("/api/restaurants")
      .then(r => r.json())
      .then((list: Restaurant[]) => setRestaurants(list))
      .catch(() => setRestaurants([]));
  }, []);

  // load tables when restaurant changes
  useEffect(() => {
    if (!restaurantId) { setTables([]); setTableId(""); return; }
    fetch("/api/admin-tables?restaurantId=" + restaurantId) // optional route; fallback to admin page JSON if you prefer
      .then(r => r.ok ? r.json() : [])
      .then((t: Table[]) => setTables(Array.isArray(t) ? t : []))
      .catch(() => setTables([]));
  }, [restaurantId]);

  const canQuote = useMemo(() =>
    restaurantId && tableId && startsAt && typeof menuPrice === "number", [restaurantId, tableId, startsAt, menuPrice]);

  async function onQuote() {
    if (!canQuote) return;
    setError(null);
    try {
      const res = await fetch("/api/price-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          tableId: Number(tableId),
          whenISO: new Date(startsAt).toISOString(),
          menuPrice: Number(menuPrice),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to quote");
      setQuote(data);
    } catch (e: any) {
      setQuote(null);
      setError(e.message || "Failed to quote");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          tableId: Number(tableId),
          customerName: name,
          partySize: Number(partySize),
          startsAtISO: new Date(startsAt).toISOString(),
          durationMinutes: 90,
          isPrepaid: !!quote && quote.finalPrice > 0, // demo heuristic
          prepaidAmount: quote?.finalPrice ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to book");
      setDone({ id: data?.reservation?.id ?? 0 });
    } catch (e: any) {
      setError(e.message || "Failed to book");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className={`${brand.bg} min-h-screen flex items-center justify-center p-6`}>
        <div className={`${brand.card} w-full max-w-xl rounded-2xl shadow-lg p-8 text-center`}>
          <h1 className="text-2xl font-bold text-[#1d7a73] mb-2">Reservation Confirmed</h1>
          <p className="text-slate-700 mb-6">Your booking ID: <b>{done.id}</b></p>
          <a className={`${brand.primary} ${brand.primaryHover} inline-flex items-center justify-center px-4 py-2 rounded-xl`} href="/restaurants">Back to Restaurants</a>
        </div>
      </main>
    );
  }

  return (
    <main className={`${brand.bg} min-h-screen flex items-center justify-center p-6`}>
      <form onSubmit={onSubmit} className={`${brand.card} w-full max-w-xl rounded-2xl shadow-lg p-8 space-y-5`}>
        <h1 className="text-2xl font-bold text-center text-[#1d7a73]">Book a Table</h1>

        <div className="space-y-1">
          <label className={brand.label}>Restaurant</label>
          <select value={restaurantId} onChange={e => setRestaurantId(Number(e.target.value) || "")}
                  className={`${brand.field} w-full rounded-xl px-3 py-2`}>
            <option value="">Select a restaurant…</option>
            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={brand.label}>Table</label>
            <select value={tableId} onChange={e => setTableId(Number(e.target.value) || "")}
                    className={`${brand.field} w-full rounded-xl px-3 py-2`}>
              <option value="">Select…</option>
              {tables.filter(t => !restaurantId || t.restaurantId === Number(restaurantId))
                    .map(t => <option key={t.id} value={t.id}>Table {t.number}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className={brand.label}>Party Size</label>
            <input type="number" min={1} value={partySize} onChange={e => setPartySize(Number(e.target.value))}
                   className={`${brand.field} w-full rounded-xl px-3 py-2`} />
          </div>
        </div>

        <div className="space-y-1">
          <label className={brand.label}>Date & Time</label>
          <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)}
                 className={`${brand.field} w-full rounded-xl px-3 py-2`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={brand.label}>Your Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
                   className={`${brand.field} w-full rounded-xl px-3 py-2`} placeholder="e.g., Alex" />
          </div>
          <div className="space-y-1">
            <label className={brand.label}>Menu Price (for quote)</label>
            <input type="number" step="0.01" value={menuPrice as any}
                   onChange={e => setMenuPrice(e.target.value === "" ? "" : Number(e.target.value))}
                   className={`${brand.field} w-full rounded-xl px-3 py-2`} placeholder="19.50" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onQuote} disabled={!canQuote}
                  className={`${brand.primary} ${brand.primaryHover} disabled:opacity-50 rounded-xl px-4 py-2`}>
            Get Price Quote
          </button>
          <button type="submit" disabled={!restaurantId || !tableId || !startsAt || !name || submitting}
                  className={`${brand.primary} ${brand.primaryHover} disabled:opacity-50 rounded-xl px-4 py-2 ml-auto`}>
            {submitting ? "Booking…" : "Confirm Booking"}
          </button>
        </div>

        {quote && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
            <b>Quote:</b> Base ${quote.basePrice.toFixed(2)} · Adj {quote.adjustmentPercent}% · <b>Final ${quote.finalPrice.toFixed(2)}</b>
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
            {error}
          </div>
        )}
      </form>
    </main>
  );
}
