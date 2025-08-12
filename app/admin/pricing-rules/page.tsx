// app/admin/pricing-rules/page.tsx

"use client";

import { useState, useEffect, FormEvent } from 'react';

// Define types for our objects
interface Table { id: number; number: number; }
interface Category { id: number; name: string; }
interface PricingRule {
    id: number;
    name: string | null;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    adjustmentPercent: number;
    table: Table | null;
    category: Category | null;
}

export default function PricingRulesPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [tables, setTables] = useState<Table[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [rules, setRules] = useState<PricingRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const [dropdownRes, rulesRes] = await Promise.all([
                    fetch('/api/dropdown-data'),
                    fetch('/api/pricing-rules')
                ]);

                if (dropdownRes.ok) {
                    const data = await dropdownRes.json();
                    setTables(data.tables);
                    setCategories(data.categories);
                } else { setError('Failed to load form data.'); }

                if (rulesRes.ok) {
                    const data = await rulesRes.json();
                    setRules(data);
                } else { setError('Failed to load pricing rules.'); }

            } catch (err) {
                setError('An error occurred while loading data.');
            }
            setIsLoading(false);
        }
        fetchData();
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        const formData = new FormData(event.currentTarget);
        const data = {
            name: formData.get('name') as string,
            dayOfWeek: parseInt(formData.get('dayOfWeek') as string, 10),
            startTime: formData.get('startTime') as string,
            endTime: formData.get('endTime') as string,
            adjustmentPercent: parseInt(formData.get('adjustmentPercent') as string, 10),
            tableId: formData.get('tableId') === 'any' ? null : parseInt(formData.get('tableId') as string, 10),
            categoryId: formData.get('categoryId') === 'any' ? null : parseInt(formData.get('categoryId') as string, 10),
        };
        const response = await fetch('/api/pricing-rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            const newRule = await response.json();
            setRules(currentRules => [newRule, ...currentRules]);
            setSuccess('Pricing rule created successfully!');
            (event.target as HTMLFormElement).reset();
        } else {
            const errorData = await response.json();
            setError(errorData.details || errorData.error || "Failed to create pricing rule.");
        }
    };
    
    const handleDelete = async (ruleId: number) => {
        if (!confirm('Are you sure you want to delete this pricing rule?')) { return; }
        const response = await fetch(`/api/pricing-rules?id=${ruleId}`, { method: 'DELETE' });
        if (response.ok) {
            setRules(currentRules => currentRules.filter(rule => rule.id !== ruleId));
        } else {
            const errorData = await response.json();
            setError(errorData.error || "Failed to delete the rule.");
        }
    };

    const dayOfWeekAsString = (day: number) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Pricing Rule Management</h1>
            
            <div className="mb-10 p-6 bg-white rounded-lg shadow-md max-w-lg">
                <h2 className="text-2xl font-semibold mb-4">Create a New Pricing Rule</h2>
                {isLoading ? <p>Loading form data...</p> : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Rule Name</label>
                            <input type="text" name="name" id="name" placeholder="e.g., Happy Hour" className="w-full px-4 py-2 border rounded-lg" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="dayOfWeek" className="block text-gray-700 font-medium mb-2">Day of Week</label>
                                <select name="dayOfWeek" id="dayOfWeek" className="w-full px-4 py-2 border rounded-lg" required>
                                    <option value="1">Monday</option>
                                    <option value="2">Tuesday</option>
                                    <option value="3">Wednesday</option>
                                    <option value="4">Thursday</option>
                                    <option value="5">Friday</option>
                                    <option value="6">Saturday</option>
                                    <option value="0">Sunday</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="adjustmentPercent" className="block text-gray-700 font-medium mb-2">Discount (%)</label>
                                <input type="number" name="adjustmentPercent" id="adjustmentPercent" placeholder="-20" className="w-full px-4 py-2 border rounded-lg" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="startTime" className="block text-gray-700 font-medium mb-2">Start Time</label>
                                <input type="time" name="startTime" id="startTime" className="w-full px-4 py-2 border rounded-lg" required />
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-gray-700 font-medium mb-2">End Time</label>
                                <input type="time" name="endTime" id="endTime" className="w-full px-4 py-2 border rounded-lg" required />
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="categoryId" className="block text-gray-700 font-medium mb-2">Apply to Category</label>
                                <select name="categoryId" id="categoryId" className="w-full px-4 py-2 border rounded-lg">
                                    <option value="any">Any Category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="tableId" className="block text-gray-700 font-medium mb-2">Apply to Table</label>
                                <select name="tableId" id="tableId" className="w-full px-4 py-2 border rounded-lg">
                                    <option value="any">Any Table</option>
                                    {tables.map(table => (
                                        <option key={table.id} value={table.id}>Table #{table.number}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Create Rule</button>
                        {success && <p className="text-green-600 mt-4">{success}</p>}
                        {error && <p className="text-red-500 mt-4">{JSON.stringify(error)}</p>}
                    </form>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Existing Rules</h2>
                {isLoading ? <p>Loading rules...</p> : (
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left py-2 px-2">Name</th>
                                <th className="text-left py-2 px-2">Day</th>
                                <th className="text-left py-2 px-2">Time</th>
                                <th className="text-left py-2 px-2">Adjustment</th>
                                <th className="text-left py-2 px-2">Category</th>
                                <th className="text-left py-2 px-2">Table</th>
                                <th className="text-left py-2 px-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.map((rule) => (
                                <tr key={rule.id} className="border-t">
                                    <td className="py-2 px-2">{rule.name}</td>
                                    <td className="py-2 px-2">{dayOfWeekAsString(rule.dayOfWeek)}</td>
                                    <td className="py-2 px-2">{rule.startTime} - {rule.endTime}</td>
                                    <td className="py-2 px-2">{rule.adjustmentPercent}%</td>
                                    <td className="py-2 px-2">{rule.category?.name || 'Any'}</td>
                                    <td className="py-2 px-2">{rule.table?.number ? `Table #${rule.table.number}` : 'Any'}</td>
                                    <td className="py-2 px-2">
                                        <button 
                                            onClick={() => handleDelete(rule.id)}
                                            className="bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-lg hover:bg-red-700">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                 {!isLoading && rules.length === <strong>0</strong> && <p className="text-gray-500 mt-4">No pricing rules have been created yet.</p>}
            </div>
        </div>
    );
}