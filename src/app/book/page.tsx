"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const brand = {
  bg: "bg-[#f5f5ef]", // soft off-white like your screenshot
  card: "bg-white",
  primary: "bg-[#1d7a73] text-white", // teal button
  primaryHover: "hover:bg-[#17635e]",
  field: "bg-[#f2efe8] focus:ring-2 focus:ring-[#1d7a73] focus:outline-none",
  label: "text-[#1d7a73] font-medium",
};

type Restaurant = { id: number; name: string };
type Table = { id: number; number: number; restaurantId: number };

type Quote = {
  basePrice: number;
  adjustmentPercent: number;
  finalPrice: number;
};

type ReservationResponse = {
  reservation?: { id?: number };
  error?: string;
};

type QuoteResponse = {
  basePrice?: number;
  adjustmentPercent?: number;
  finalPrice?: number;
  error?: string;
};

export default function BookPage() {
  // form state
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [tableId, setTableId] = useState<string>("");
  const [partySize, setPartySize] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [startsAt, setStartsAt] = useState<string>("");
  const [menuPrice, setMenuPrice] = useState<string>("");

  // ui state
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [done, setDone] = useState<{ id: number } | null>(null);

  // load restaurants (public list)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/api/restaurants", { cache: "no-store" });
        const data = (await res.json()) as { restaurants?: Restaurant[]; error?: string };
        if (!ignore) {
          if (!res.ok || !data.restaurants) throw new Error(data.error || "Failed to load restaurants");
          setRestaurants(data.restaurants);
        }
      } catch {
        if (!ignore) setRestaurants([]);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // when restaurant changes, load its tables
  useEffect(() => {
    let ignore = false;
    if (!restaurantId) {
      setTables([]);
      setTableId("");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/tables?restaurantId=${encodeURIComponent(restaurantId)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as { tables?: Table[]; error?: string };
        if (!ignore) {
          if (!res.ok || !data.tables) throw new Error(data.error || "Failed to load tables");
          setTables(data.tables);
          setTableId("");
        }
      } catch {
        if (!ignore) {
          setTables([]);
          setTableId("");
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [restaurantId]);

  const canQuote = useMemo(() => {
    if (!restaurantId || !tableId || !startsAt) return false;
    if (menuPrice === "") return true;
    const n = Number(menuPrice);
    return !Number.isNaN(n) && n >= 0;
  }, [restaurantId, tableId, startsAt, menuPrice]);
  const missing: string[] = [];
if (!restaurantId) missing.push("restaurant");
if (!tableId) missing.push("table");
if (!name) missing.push("name");
if (!partySize || Number.isNaN(Number(partySize)) || Number(partySize) <= 0) missing.push("party size");
if (!startsAt) missing.push("date & time");

const canBook =
  missing.length === 0;


  async function onQuote() {
    if (!canQuote) return;
    setError(null);
    setQuote(null);
    try {
      const res = await fetch("/api/price-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          tableId: Number(tableId),
          whenISO: new Date(startsAt).toISOString(),
          menuPrice: menuPrice === "" ? null : Number(menuPrice),
        }),
      });
      const data = (await res.json()) as QuoteResponse;
      if (!res.ok || data.error || data.finalPrice == null || data.basePrice == null || data.adjustmentPercent == null) {
        throw new Error(data.error || "Failed to quote");
      }
      setQuote({
        basePrice: data.basePrice,
        adjustmentPercent: data.adjustmentPercent,
        finalPrice: data.finalPrice,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to quote";
      setError(message);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setDone(null);
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
          isPrepaid: !!quote && quote.finalPrice > 0,
          prepaidAmount: quote?.finalPrice ?? null,
        }),
      });
      const data = (await res.json()) as ReservationResponse;
      if (!res.ok || data.error) throw new Error(data.error || "Failed to book");
      const id = data.reservation?.id ?? 0;
      setDone({ id });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to book";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className={`${brand.bg} min-h-screen p-6`}>
        <div className="mx-auto max-w-xl rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-2xl font-semibold text-emerald-700">Reservation Confirmed 🎉</h1>
          <p className="text-slate-700">
            Your reservation ID is <span className="font-semibold">#{done.id}</span>. We’ve sent a confirmation to your
            email/phone if provided.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl px-4 py-2 font-medium text-white"
            style={{ backgroundColor: "#1d7a73" }}
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`${brand.bg} min-h-screen p-6`}>
      <form
        onSubmit={onSubmit}
        className="mx-auto grid max-w-2xl gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <header className="mb-2">
          <h1 className="text-2xl font-semibold text-slate-900">Book a Table</h1>
          <p className="text-slate-600">Pick a restaurant, table, date & time. Get a quote, then confirm.</p>
        </header>

        {/* Restaurant */}
        <div className="grid gap-2">
          <label className={brand.label} htmlFor="restaurant">
            Restaurant
          </label>
          <select
            id="restaurant"
            value={restaurantId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRestaurantId(e.target.value)}
            className={`${brand.field} w-full rounded-xl px-3 py-2`}
          >
            <option value="">Select a restaurant…</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="grid gap-2">
          <label className={brand.label} htmlFor="table">
            Table
          </label>
          <select
            id="table"
            value={tableId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTableId(e.target.value)}
            className={`${brand.field} w-full rounded-xl px-3 py-2`}
            disabled={!restaurantId}
          >
            <option value="">{restaurantId ? "Select a table…" : "Choose a restaurant first"}</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                Table #{t.number}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div className="grid gap-2">
          <label className={brand.label} htmlFor="name">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className={`${brand.field} w-full rounded-xl px-3 py-2`}
            placeholder="Guest name"
          />
        </div>

        {/* Party size */}
        <div className="grid gap-2">
          <label className={brand.label} htmlFor="party">
            Party Size
          </label>
          <input
            id="party"
            type="number"
            min={1}
            value={partySize}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPartySize(e.target.value)}
            className={`${brand.field} w-full rounded-xl px-3 py-2`}
            placeholder="2"
          />
        </div>

        {/* Date/time */}
        <div className="grid gap-2">
          <label className={brand.label} htmlFor="when">
            Date & Time
          </label>
          <input
            id="when"
            type="datetime-local"
            value={startsAt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartsAt(e.target.value)}
            className={`${brand.field} w-full rounded-xl px-3 py-2`}
          />
        </div>

        {/* Menu price (optional, used for quote adjustments) */}
        <div className="grid gap-2">
          <label className={brand.label} htmlFor="menuPrice">
            Menu Price (optional, for prepaid quote)
          </label>
          <input
            id="menuPrice"
            type="number"
            step="0.01"
            value={menuPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMenuPrice(e.target.value)}
            className={`${brand.field} w-full rounded-xl px-3 py-2`}
            placeholder="19.50"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onQuote}
            disabled={!canQuote || submitting}
            className={`rounded-xl px-4 py-2 font-medium text-white disabled:opacity-50 ${brand.primary} ${brand.primaryHover}`}
          >
            Get Quote
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              !restaurantId ||
              !tableId ||
              !name ||
              !partySize ||
              !startsAt ||
              Number.isNaN(Number(partySize)) ||
              Number(partySize) <= 0
            }
            className={`rounded-xl px-4 py-2 font-medium text-white disabled:opacity-50 ${brand.primary} ${brand.primaryHover}`}
          >
            {submitting ? "Booking…" : "Book Now"}
          </button>

          <span className="text-sm text-slate-500">
            {quote
              ? `Quoted: $${quote.finalPrice.toFixed(2)} (base $${quote.basePrice.toFixed(
                  2
                )}, adj ${quote.adjustmentPercent}%)`
              : "No quote yet"}
          </span>
        </div>

        {quote && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
            <b>Quote:</b> Base ${quote.basePrice.toFixed(2)} · Adj {quote.adjustmentPercent}% ·{" "}
            <b>Final ${quote.finalPrice.toFixed(2)}</b>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">{error}</div>
        )}
      </form>
    </main>
  );
}
