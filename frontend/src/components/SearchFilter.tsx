import React, { useState } from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface FilterState {
  search: string;
  city: string;
  propertyType: string;
  bedrooms: string;
  minPrice: string;
  maxPrice: string;
}

interface SearchFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    city: '',
    propertyType: '',
    bedrooms: '',
    minPrice: '',
    maxPrice: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const defaultFilters = {
      search: '',
      city: '',
      propertyType: '',
      bedrooms: '',
      minPrice: '',
      maxPrice: '',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const popularCities = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Houston', 'San Francisco', 'Seattle', 'Austin'];

  return (
    <form
      id="search-filter-form"
      onSubmit={handleApply}
      className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Full Text Search */}
        <div className="md:col-span-2 relative">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search by title, description or address..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            City
          </label>
          <select
            name="city"
            value={filters.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all cursor-pointer"
          >
            <option value="">Any City</option>
            {popularCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Type
          </label>
          <select
            name="propertyType"
            value={filters.propertyType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all cursor-pointer"
          >
            <option value="">Any Type</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Min Price ($)
          </label>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleChange}
            placeholder="No Min"
            min="0"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Max Price ($)
          </label>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="No Max"
            min="0"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all"
          />
        </div>

        {/* Bedrooms Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Bedrooms
          </label>
          <select
            name="bedrooms"
            value={filters.bedrooms}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all cursor-pointer"
          >
            <option value="">Any Bedrooms</option>
            <option value="0">Studio (0)</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
          </select>
        </div>

        {/* Actions Button */}
        <div className="flex items-end space-x-2">
          <button
            id="btn-apply-filters"
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Search</span>
          </button>
          <button
            id="btn-reset-filters"
            type="button"
            onClick={handleReset}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 px-3 rounded-lg text-sm flex items-center justify-center cursor-pointer transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchFilter;
