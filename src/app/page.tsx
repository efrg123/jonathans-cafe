// src/app/page.tsx
export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Jonathan’s Café</h1>
      <p>
        Go to <a href="/admin">/admin</a> to view data, or{" "}
        <a href="/restaurants">/restaurants</a> to explore.
      </p>
    </main>
  );
}
