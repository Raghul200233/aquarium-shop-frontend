import React from 'react';

const FilterSidebar = ({ categories, filters, onFilterChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold text-lg mb-4">Categories</h3>
      <div className="space-y-2">
        <button
          onClick={() => onFilterChange({ category: '' })}
          className={`block w-full text-left px-2 py-1 rounded ${
            !filters.category ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
          }`}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onFilterChange({ category })}
            className={`block w-full text-left px-2 py-1 rounded ${
              filters.category === category ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterSidebar;