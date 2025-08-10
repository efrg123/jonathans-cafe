// src/components/MenuFilter.tsx
"use client";

import { useState, useEffect } from 'react';

// Define the structure of our data
interface MenuTag {
  name: string;
}
interface MenuItem {
  id: number;
  name: string;
  price: number;
  tags: MenuTag[];
}
interface Restaurant {
  id: number;
  name: string;
}

// A custom hook to manage state with localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
}


export default function MenuFilter() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [fullMenu, setFullMenu] = useState<MenuItem[]>([]);
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const [selectedTags, setSelectedTags] = useLocalStorage<string[]>('foodPassportPrefs', []);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch restaurants on initial load
  useEffect(() => {
    async function fetchRestaurants() {
      const res = await fetch('/api/restaurants');
      const data = await res.json();
      setRestaurants(data);
      if (data.length > 0) {
        setSelectedRestaurantId(data[0].id.toString());
      }
    }
    fetchRestaurants();
  }, []);

  // 2. Fetch menu with tags when restaurant changes
  useEffect(() => {
    if (!selectedRestaurantId) return;

    async function fetchMenu() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/menu-with-tags?restaurantId=${selectedRestaurantId}`);
        if (!res.ok) throw new Error('Failed to fetch menu');
        const data: MenuItem[] = await res.json();
        setFullMenu(data);

        const allTags = new Set<string>();
        data.forEach(item => item.tags.forEach(tag => allTags.add(tag.name)));
        setAvailableTags(Array.from(allTags).sort());

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchMenu();
  }, [selectedRestaurantId]);

  // 3. Re-filter the menu whenever the full menu or selected tags change
  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredMenu(fullMenu);
      return;
    }
    const filtered = fullMenu.filter(item => 
      selectedTags.every(selectedTag => 
        item.tags.some(itemTag => itemTag.name === selectedTag)
      )
    );
    setFilteredMenu(filtered);
  }, [fullMenu, selectedTags]);

  // THIS IS THE FIX:
  const handleTagChange = (tagName: string) => {
    const newTags = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName) // If tag exists, remove it
      : [...selectedTags, tagName];             // If tag doesn't exist, add it
    setSelectedTags(newTags); // Pass the new array directly
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Food Passport Menu</h2>

      <div className="mb-4">
        <label htmlFor="res-select" className="block text-sm font-medium text-gray-700 mb-1">Select Restaurant</label>
        <select
          id="res-select"
          value={selectedRestaurantId}
          onChange={e => setSelectedRestaurantId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Filter by Preference</h3>
        <div className="flex flex-wrap gap-4">
          {availableTags.map(tag => (
            <label key={tag} className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => handleTagChange(tag)}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-600">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="my-4"/>

      <div>
        {isLoading && <p>Loading menu...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <ul className="space-y-3">
            {filteredMenu.map(item => (
              <li key={item.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <div className="flex gap-2 mt-1">
                    {item.tags.map(tag => (
                      <span key={tag.name} className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="font-medium text-gray-700">${item.price.toFixed(2)}</p>
              </li>
            ))}
            {filteredMenu.length === 0 && fullMenu.length > 0 && (
              <p className="text-center text-gray-500 py-4">No menu items match your selected filters.</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
