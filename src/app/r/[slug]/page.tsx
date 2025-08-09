// src/app/r/[slug]/page.tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // Next 15 types expect Promise here
  const title = decodeURIComponent(slug).replace(/-/g, " ");

  return (
    <section className="space-y-4" style={{ padding: 24 }}>
      <h2 className="text-xl font-semibold capitalize">{title}</h2>
      <p>Menu listing goes here… (we’ll wire real data next)</p>
      <a className="underline" href="/restaurants">
        ← Back
      </a>
    </section>
  );
}
