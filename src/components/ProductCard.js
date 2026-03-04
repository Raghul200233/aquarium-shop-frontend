import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
  // Reset states
  setImageError(false);
  setImgLoaded(false);

  console.log('========== PRODUCT CARD DEBUG ==========');
  console.log('🎯 Product name:', product.name);
  console.log('📦 Full product object:', JSON.stringify(product, null, 2));
  
  if (product.images) {
    console.log('🖼️ Images array:', product.images);
    if (product.images[0]) {
      console.log('🖼️ First image object:', product.images[0]);
      if (product.images[0].url) {
        console.log('🖼️ Image URL:', product.images[0].url);
      } else {
        console.log('❌ First image has no URL property');
      }
    } else {
      console.log('❌ Images array is empty');
    }
  } else {
    console.log('❌ No images array on product');
  }

  if (product.images && product.images[0] && product.images[0].url) {
    let url = product.images[0].url;
    console.log('✅ Found URL:', url);

    // Build the full image URL
    let fullImageUrl;

    // Case 1: Base64 image
    if (url.startsWith('data:image')) {
      fullImageUrl = url;
      console.log('✅ Using base64 image');
    }
    // Case 2: Already a full URL
    else if (url.startsWith('http')) {
      fullImageUrl = url;
      console.log('✅ Using full URL:', fullImageUrl);
    }
    // Case 3: Path starting with /assets/ - ADD FRONTEND DOMAIN
    else if (url.includes('/assets/')) {
      fullImageUrl = `https://aquarium-shop-frontend.vercel.app${url}`;
      console.log('✅ Added frontend domain:', fullImageUrl);
    }
    // Case 4: Plain filename (no slashes)
    else if (!url.includes('/')) {
      // Determine folder based on category
      let folder = 'fish_foods';
      const cat = product.category?.toLowerCase() || '';
      
      if (cat.includes('medicine')) folder = 'fish_medicine';
      else if (cat.includes('planted')) folder = 'aquarium_lights';
      else if (cat.includes('light')) folder = 'aquarium_lights';
      else if (cat.includes('live fish')) folder = 'live_fishes';
      else if (cat.includes('filter')) folder = 'filters';
      else if (cat.includes('heater')) folder = 'heaters';
      else if (cat.includes('accessories')) folder = 'aquarium_accessories';
      else if (cat.includes('stone') || cat.includes('sand')) folder = 'aquarium_accessories';
      else if (cat.includes('tank')) folder = 'aquarium_tanks';
      
      fullImageUrl = `https://aquarium-shop-frontend.vercel.app/assets/${folder}/${url}`;
      console.log('✅ Generated with folder:', fullImageUrl);
    }
    // Case 5: Any other path
    else {
      fullImageUrl = `https://aquarium-shop-frontend.vercel.app${url}`;
      console.log('✅ Added domain to path:', fullImageUrl);
    }

    console.log('🎯 Setting image source to:', fullImageUrl);
    setImageSrc(fullImageUrl);
    
  } else {
    console.log('❌ No valid image found for:', product.name);
    console.log('❌ Setting imageError to true');
    setImageError(true);
  }
  console.log('=======================================');
}, [product]);

  // Handle image load error
  const handleImageError = () => {
    console.log('❌ Image failed to load:', imageSrc);
    setImageError(true);
  };

  // Category-based display emoji for the fallback tile
  const getCategoryEmoji = () => {
    const cat = (product.category || '').toLowerCase();
    if (cat.includes('live fish')) return '🐟';
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
          <div className="image-wrapper">
            {imageError ? (
              <div className="fallback-image">
                <span className="fallback-icon">{getCategoryEmoji()}</span>
                <span className="fallback-text">{product.name?.substring(0, 30)}</span>
                <span className="fallback-category">{product.category}</span>
              </div>
            ) : (
              <>
                {!imgLoaded && <div className="img-skeleton" />}
                <img
                  src={imageSrc}
                  alt={product.name}
                  className={`product-image ${isHovered ? 'hovered' : ''} ${imgLoaded ? 'img-fade-in' : 'img-hidden'}`}
                  onError={handleImageError}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', imageSrc);
                    setImgLoaded(true);
                  }}
                  loading="lazy"
                />
              </>
            )}

            <div className={`image-overlay ${isHovered ? 'visible' : ''}`}>
              <span className="zoom-icon">🔍</span>
            </div>
          </div>

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
              <span className="in-stock">
                <span className="stock-indicator"></span>
                In Stock ({product.stock})
              </span>
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
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          border: 1px solid transparent;
        }

        .product-card.hovered {
          transform: translateY(-8px);
          box-shadow: 0 20px 30px rgba(102, 126, 234, 0.2);
          border-color: #667eea;
        }

        .product-image-container {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
          aspect-ratio: 1 / 1;
        }

        .image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .product-image.hovered {
          transform: scale(1.1);
        }

        .img-hidden {
          opacity: 0;
        }

        .img-fade-in {
          opacity: 1;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .img-skeleton {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .fallback-image {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0f4ff 0%, #e8ecf8 100%);
          color: #555;
          text-align: center;
          padding: 20px;
        }

        .fallback-icon {
          font-size: 44px;
          margin-bottom: 8px;
          filter: grayscale(20%);
        }

        .fallback-text {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
          color: #444;
        }

        .fallback-category {
          font-size: 11px;
          opacity: 0.7;
          color: #667eea;
          font-weight: 500;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          backdrop-filter: blur(2px);
        }

        .image-overlay.visible {
          opacity: 1;
        }

        .zoom-icon {
          color: white;
          font-size: 32px;
          transform: scale(0.8);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .image-overlay.visible .zoom-icon {
          transform: scale(1);
        }

        .stock-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          z-index: 2;
        }

        .low-stock {
          background: #ff6b6b;
          color: white;
          box-shadow: 0 4px 10px rgba(255, 107, 107, 0.3);
        }

        .out-of-stock {
          background: #dc3545;
          color: white;
          box-shadow: 0 4px 10px rgba(220, 53, 69, 0.3);
        }

        .featured-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          z-index: 2;
          box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
        }

        .product-info {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          background: white;
          transition: background 0.3s ease;
        }

        .product-card.hovered .product-info {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        }

        .product-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 6px;
          line-height: 1.4;
          transition: color 0.3s ease;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-card.hovered .product-name {
          color: #667eea;
        }

        .product-category {
          font-size: 13px;
          color: #999;
          margin-bottom: 12px;
          transition: color 0.3s ease;
        }

        .product-card.hovered .product-category {
          color: #764ba2;
        }

        .product-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .product-price {
          font-size: 20px;
          font-weight: 700;
          color: #667eea;
          transition: transform 0.3s ease;
          display: inline-block;
        }

        .product-card.hovered .product-price {
          transform: scale(1.05);
          color: #764ba2;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #f8f9fa;
          padding: 4px 8px;
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .product-card.hovered .product-rating {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .rating-star {
          color: #ffc107;
          font-size: 14px;
          transition: color 0.3s ease;
        }

        .product-card.hovered .rating-star {
          color: white;
        }

        .rating-value {
          color: #666;
          font-size: 13px;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .product-card.hovered .rating-value {
          color: white;
        }

        .product-stock {
          margin-top: auto;
          font-size: 13px;
        }

        .in-stock {
          color: #28a745;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stock-indicator {
          width: 8px;
          height: 8px;
          background: #28a745;
          border-radius: 50%;
          display: inline-block;
          animation: blink 2s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Link>
  );
};

export default ProductCard;