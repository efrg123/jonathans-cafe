export default function Home() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Jonathan&apos;s Cafe</h1>
      <p className="text-sm opacity-80">
        Starter is live. Use the links below to explore.
      </p>
      <ul className="list-disc pl-6">
        <li><a className="underline" href="/restaurants">Restaurants</a></li>
        <li><a className="underline" href="/admin">Admin</a></li>
      </ul>
    </section>
  );
}


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


type Props = { params: { slug: string } };

export default function RestaurantPage({ params }: Props) {
  const title = params.slug.replaceAll("-", " ");
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold capitalize">{title}</h2>
      <p>Menu listing goes here… (we’ll wire real data next)</p>
      <a className="underline" href="/restaurants">← Back</a>
    </section>
  );
}


export default function AdminPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      <p>Revenue, orders, inventory, refunds — coming soon.</p>
      <a className="underline" href="/">← Home</a>
    </section>
  );
}
