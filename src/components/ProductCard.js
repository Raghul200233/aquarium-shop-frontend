import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  // Get image URL - super simple
  const getImageUrl = () => {
    if (product.images && product.images[0] && product.images[0].url) {
      return product.images[0].url;
    }
    return null;
  };

  const imageUrl = getImageUrl();

  // Fallback emoji
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
    <Link to={`/product/${product._id}`} className="product-card-link">
      <div className="product-card">
        <div className="product-image-container">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.name}
              className="product-image"
              onError={(e) => {
                console.log('Image failed:', imageUrl);
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="fallback-image">
                    <span class="fallback-icon">${getCategoryEmoji()}</span>
                    <span class="fallback-text">${product.name.substring(0, 20)}</span>
                  </div>
                `;
              }}
            />
          ) : (
            <div className="fallback-image">
              <span className="fallback-icon">{getCategoryEmoji()}</span>
              <span className="fallback-text">{product.name.substring(0, 20)}</span>
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
        }
        .product-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .product-image-container {
          position: relative;
          aspect-ratio: 1;
          background: #f5f5f5;
        }
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
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
          top: 8px;
          right: 8px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: white;
        }
        .low-stock { background: #f59e0b; }
        .out-of-stock { background: #ef4444; }
        .featured-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          padding: 4px 8px;
          background: #10b981;
          color: white;
          border-radius: 4px;
          font-size: 12px;
        }
        .product-info {
          padding: 12px;
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
          height: 40px;
        }
        .product-category {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }
        .product-price {
          font-size: 16px;
          font-weight: 700;
          color: #667eea;
        }
      `}</style>
    </Link>
  );
};

export default ProductCard;