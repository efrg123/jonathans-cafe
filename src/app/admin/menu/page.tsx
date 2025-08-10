// src/app/admin/menu/page.tsx
import MenuManager from "@/components/admin/MenuManager";

export default function AdminMenuPage() {
  return (
    <main className="container mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-6">Restaurant Dashboard</h1>
      <MenuManager />
    </main>
  );
}
