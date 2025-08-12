// app/admin/menu/page.tsx

"use client";

import { useState, useEffect, FormEvent } from 'react';

// Define the type for a menu item for type safety
interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
}

export default function MenuAdminPage() {
    // Corrected typo here: useState now has a space
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Fetch initial menu items when the component mounts
    useEffect(() => {
        async function fetchMenuItems() {
            // This GET endpoint does not exist yet, so we will wrap it in a try/catch
            try {
                const response = await fetch('/api/menu'); 
                if (response.ok) {
                    const data = await response.json();
                    setMenuItems(data);
                }
            } catch (e) {
                console.error("Could not fetch menu items. This is expected if the GET endpoint isn't created yet.");
            }
            setIsLoading(false);
        }
        fetchMenuItems();
    }, []);

    // Handle form submission for adding an item
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        if (!name || !price) {
            setError("Name and price are required.");
            return;
        }

        const response = await fetch('/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, price: parseFloat(price), categoryId: 1 }),
        });

        if (response.ok) {
            const newItem = await response.json();
            setMenuItems(currentItems => [...currentItems, newItem]);
            setName('');
            setDescription('');
            setPrice('');
        } else {
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || "An unknown error occurred.";
            } catch (e) {
                errorMessage = `Request failed: ${response.status} (${response.statusText})`;
            }
            setError(errorMessage);
        }
    };

    // Handle deleting an item
    const handleDelete = async (itemId: number) => {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }

        const response = await fetch(`/api/menu?id=${itemId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            // Remove the item from the list to update the UI instantly
            setMenuItems(currentItems => currentItems.filter(item => item.id !== itemId));
        } else {
            setError("Failed to delete item. Please check the server logs.");
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Restaurant Dashboard</h1>
            <div className="mb-10 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Add a New Menu Item</h2>
                <form onSubmit={handleSubmit}>
                     <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Item Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description</label>
                        <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="price" className="block text-gray-700 font-medium mb-2">Price ($)</label>
                        <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required step="0.01" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300">Add Item</button>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </form>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Menu Management</h2>
                {isLoading ? <p>Loading menu...</p> : (
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left py-2">Name</th>
                                <th className="text-left py-2">Price</th>
                                <th className="text-left py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuItems.map((item) => (
                                <tr key={item.id} className="border-t">
                                    <td className="py-2">{item.name}</td>
                                    <td className="py-2">${item.price.toFixed(2)}</td>
                                    <td className="py-2">
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-lg hover:bg-red-700 transition duration-300">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}