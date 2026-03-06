import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get image URL - simplified
  const getImageUrl = () => {
    if (!product.images || !product.images[0] || !product.images[0].url) {
      return null;
    }
    
    let url = product.images[0].url;
    
    // If it's already a full URL, use it
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it's a data URL, use it
    if (url.startsWith('data:')) {
      return url;
    }
    
    // For /assets/ paths, just use the path - browser will add domain
    return url;
  };

  const imageUrl = getImageUrl();
  const hasImage = !imageError && imageUrl;

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

  return (
    <Link
      to={`/product/${product._id}`}
      className="product-card-link"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`product-card ${isHovered ? 'hovered' : ''}`}>
        <div className="product-image-container">
          {hasImage ? (
            <img
              src={imageUrl}
              alt={product.name}
              className={`product-image ${isHovered ? 'hovered' : ''}`}
              onError={() => setImageError(true)}
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

          <div className="product-price-row">
            <span className="product-price">₹{product.price}</span>
            <div className="product-rating">
              <span className="rating-star">★</span>
              <span className="rating-value">{product.rating || 0}</span>
            </div>
          </div>

          <div className="product-stock">
            {product.stock > 0 ? (
              <span className="in-stock">In Stock ({product.stock})</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>
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
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
          border: 1px solid #eee;
        }

        .product-card.hovered {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12);
          border-color: #667eea;
        }

        .product-image-container {
          position: relative;
          aspect-ratio: 1 / 1;
          background: #f5f5f5;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          display: block;
        }

        .product-image.hovered {
          transform: scale(1.1);
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
          padding: 20px;
        }

        .fallback-icon {
          font-size: 48px;
          margin-bottom: 8px;
        }

        .fallback-text {
          font-size: 14px;
          font-weight: 600;
        }

        .stock-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .low-stock {
          background: #f59e0b;
        }

        .out-of-stock {
          background: #ef4444;
        }

        .featured-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 4px 8px;
          background: #10b981;
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .product-info {
          padding: 16px;
          flex: 1;
        }

        .product-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
          min-height: 44px;
        }

        .product-category {
          font-size: 13px;
          color: #666;
          margin-bottom: 12px;
        }

        .product-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .product-price {
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .rating-star {
          color: #fbbf24;
          font-size: 14px;
        }

        .rating-value {
          color: #666;
          font-size: 13px;
          font-weight: 600;
        }

        .product-stock {
          font-size: 13px;
        }

        .in-stock {
          color: #10b981;
        }

        .out-of-stock {
          color: #ef4444;
        }

        @media (max-width: 640px) {
          .product-name {
            font-size: 14px;
            min-height: 38px;
          }
          .product-price {
            font-size: 16px;
          }
        }
      `}</style>
    </Link>
  );
};

export default ProductCard;