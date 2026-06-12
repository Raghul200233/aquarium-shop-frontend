import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  // Get image URL - handles all cases
  const getImageUrl = () => {
    if (!product.images || !product.images[0] || !product.images[0].url) {
      return null;
    }

    let imagePath = product.images[0].url;

    // If it's a base64 image (starts with data:image), use it directly
    if (imagePath.startsWith('data:image')) {
      return imagePath;
    }

    // If it's already a full HTTP URL, use it as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // For relative paths (starts with /)
    if (imagePath.startsWith('/')) {
      return imagePath;
    }

    // For filenames without path, assume they're in assets
    return `/assets/${imagePath}`;
  };

  useEffect(() => {
    const url = getImageUrl();
    setImageSrc(url);
  }, [product]);

  // Fallback emoji based on category
  const getCategoryEmoji = () => {
    const cat = (product.category || '').toLowerCase();
    if (cat.includes('fish')) return '🐟';
    if (cat.includes('medicine')) return '💊';
    if (cat.includes('tank')) return '🏠';
    if (cat.includes('filter')) return '⚙️';
    if (cat.includes('heater')) return '🔥';
    if (cat.includes('light')) return '💡';
    if (cat.includes('food')) return '🍕';
    return '🐠';
  };

  const handleImageError = () => {
    console.log(`Image failed to load for product: ${product.name}`);
    setImageError(true);
    setImageSrc(null);
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card-link">
      <div className="product-card">
        <div className="product-image-container">
          {imageSrc && !imageError ? (
            <img 
              src={imageSrc}
              alt={product.name}
              className="product-image"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="fallback-image">
              <span className="fallback-icon">{getCategoryEmoji()}</span>
              <span className="fallback-text">{product.name?.substring(0, 20)}</span>
            </div>
          )}

          {/* Badges */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="stock-badge low-stock">Low Stock</div>
          )}
          {product.stock === 0 && (
            <div className="stock-badge out-of-stock">Out of Stock</div>
          )}
          {product.isFeatured && (
            <div className="featured-badge">Featured</div>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-category">{product.category}</p>
          <div className="product-price">₹{product.price}</div>
        </div>
      </div>

      <style>{`
        .product-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
          height: 100%;
        }
        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
        }
        .product-image-container {
          position: relative;
          aspect-ratio: 1;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
          overflow: hidden;
        }
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
          display: block;
        }
        .product-card:hover .product-image {
          transform: scale(1.05);
        }
        .fallback-image {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          padding: 16px;
        }
        .fallback-icon {
          font-size: 48px;
          margin-bottom: 8px;
        }
        .fallback-text {
          font-size: 14px;
          font-weight: 500;
          word-break: break-word;
        }
        .stock-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: white;
          z-index: 2;
        }
        .low-stock { 
          background: #f59e0b; 
        }
        .out-of-stock { 
          background: #ef4444; 
        }
        .featured-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          padding: 4px 8px;
          background: #10b981;
          color: white;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          z-index: 2;
        }
        .product-info {
          padding: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .product-name {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
          color: #333;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
          min-height: 38px;
        }
        .product-category {
          font-size: 12px;
          color: #999;
          margin-bottom: 8px;
        }
        .product-price {
          font-size: 16px;
          font-weight: 700;
          color: #667eea;
          margin-top: auto;
        }
      `}</style>
    </Link>
  );
};

export default ProductCard;