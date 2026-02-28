import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category, customIcon: CustomIcon }) => {
  // Map category names to CSS classes
  const getBgClass = (name) => {
    const map = {
      'Fish Medicines': 'bg-fish-medicines',
      'Aquarium Tanks': 'bg-aquarium-tanks',
      'Filters': 'bg-filters',
      'Heaters': 'bg-heaters',
      'Fish Foods': 'bg-fish-foods',
      'Aquarium Lights': 'bg-aquarium-lights',
      'Planted Tank Lights': 'bg-planted-lights',
      'Live Fishes': 'bg-live-fishes',
      'Aquarium Accessories': 'bg-aquarium-accessories',
      'Aquarium Stones and Sands': 'bg-aquarium-stones'
    };
    return map[name] || 'bg-fish-medicines';
  };

  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.name)}`}
      className={`category-card ${getBgClass(category.name)}`}
    >
      <div className="category-content">
        {CustomIcon ? (
          <div className="category-custom-icon">
            <CustomIcon size={40} color="white" />
          </div>
        ) : (
          <span className="category-icon">{category.icon}</span>
        )}
        <h3 className="category-name">{category.name}</h3>
        <p className="category-description-small">{category.description}</p>
        <span className="category-shop-link">Shop Now →</span>
      </div>
    </Link>
  );
};

export default CategoryCard;