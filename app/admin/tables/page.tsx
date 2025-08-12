// app/admin/tables/page.tsx

"use client";

import { useState, useEffect, FormEvent } from 'react';

// Define types for our objects
interface Table {
    id: number;
    number: number;
    capacity: number;
}
interface EditableTableData {
    number: number;
    capacity: number;
}

export default function TableManagementPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tableNumber, setTableNumber] = useState('');
    const [capacity, setCapacity] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [modalData, setModalData] = useState<EditableTableData>({ number: 0, capacity: 0 });

    useEffect(() => {
        async function fetchTables() {
            try {
                const response = await fetch('/api/tables');
                if (response.ok) {
                    const data = await response.json();
                    setTables(data);
                } else { setError('Failed to fetch tables.'); }
            } catch (err) { setError('An error occurred while fetching tables.'); }
            setIsLoading(false);
        }
        fetchTables();
    }, []);

    const handleSubmit = async (event: FormEvent) => {
        // ... (This function is unchanged)
        event.preventDefault();
        setError(null);
        if (!tableNumber || !capacity) { setError("Table number and capacity are required."); return; }
        const response = await fetch('/api/tables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: parseInt(tableNumber, 10), capacity: parseInt(capacity, 10) }),
        });
        if (response.ok) {
            const newTable = await response.json();
            setTables(currentTables => [...currentTables, newTable].sort((a, b) => a.number - b.number));
            setTableNumber('');
            setCapacity('');
        } else {
            const errorData = await response.json();
            setError(errorData.error || "Failed to add the table.");
        }
    };

    const handleDelete = async (tableId: number) => {
        // ... (This function is unchanged)
        if (!confirm('Are you sure you want to delete this table?')) { return; }
        const response = await fetch(`/api/tables?id=${tableId}`, { method: 'DELETE' });
        if (response.ok) {
            setTables(currentTables => currentTables.filter(table => table.id !== tableId));
        } else {
            const errorData = await response.json();
            setError(errorData.error || "Failed to delete the table.");
        }
    };
    
    const handleEditClick = (table: Table) => {
        setEditingTable(table);
        setModalData({ number: table.number, capacity: table.capacity });
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingTable(null);
    };
    
    const handleModalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Ensure value is not empty before parsing to avoid NaN
        const numericValue = value === '' ? 0 : parseInt(value, 10);
        setModalData(prev => ({ ...prev, [name]: numericValue }));
    };

    // --- MODIFIED: The update function now calls our PATCH API ---
    const handleUpdateSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!editingTable) return;

        const response = await fetch('/api/tables', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: editingTable.id,
                number: modalData.number,
                capacity: modalData.capacity,
            })
        });

        if (response.ok) {
            const updatedTable = await response.json();
            // Update the list on the main page
            setTables(currentTables => 
                currentTables
                    .map(table => table.id === updatedTable.id ? updatedTable : table)
                    .sort((a, b) => a.number - b.number)
            );
            handleModalClose(); // Close the modal
        } else {
            setError("Failed to update table.");
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Table Management</h1>
            <div className="mb-10 p-6 bg-white rounded-lg shadow-md max-w-md">
                 <h2 className="text-2xl font-semibold mb-4">Add a New Table</h2>
                 <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="tableNumber" className="block text-gray-700 font-medium mb-2">Table Number</label>
                        <input type="number" id="tableNumber" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="capacity" className="block text-gray-700 font-medium mb-2">Capacity</label>
                        <input type="number" id="capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Add Table</button>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                 </form>
            </div>
             <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Existing Tables</h2>
                {isLoading ? <p>Loading tables...</p> : (
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left py-2">Table Number</th>
                                <th className="text-left py-2">Capacity</th>
                                <th className="text-left py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables.map((table) => (
                                <tr key={table.id} className="border-t">
                                    <td className="py-2">{table.number}</td>
                                    <td className="py-2">{table.capacity}</td>
                                    <td className="py-2 flex gap-2">
                                        <button onClick={() => handleEditClick(table)} className="bg-yellow-500 text-white text-xs font-bold py-1 px-3 rounded-lg hover:bg-yellow-600 transition">Edit</button>
                                        <button onClick={() => handleDelete(table.id)} className="bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-lg hover:bg-red-700 transition">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!isLoading && tables.length === 0 && <p className="text-gray-500 mt-4">No tables have been added yet.</p>}
            </div>

            {isModalOpen && editingTable && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Edit Table #{editingTable.number}</h2>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Table Number</label>
                                <input name="number" type="number" value={modalData.number} onChange={handleModalChange} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Capacity</label>
                                <input name="capacity" type="number" value={modalData.capacity} onChange={handleModalChange} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={handleModalClose} className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                                <button type="submit" className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}