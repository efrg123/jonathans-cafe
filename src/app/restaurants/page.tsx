// src/app/restaurants/page.tsx
export default function RestaurantsPage() {
  const demos = [
    { name: "Jonathan's Cafe", slug: "jonathans-cafe" },
    { name: "Ali's Bistro", slug: "alis-bistro" },
    { name: "McDonald's (Demo)", slug: "mcdonalds-demo" },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Select a restaurant</h2>
      <ul className="space-y-2">
        {demos.map(d => (
          <li key={d.slug}>
            <a className="underline" href={`/r/${d.slug}`}>{d.name}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
