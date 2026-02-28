import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import ProductCard from '../components/ProductCard';
import 'swiper/css';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState([]);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Scroll to top when component mounts or product id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);


  const fetchSimilarProducts = useCallback(async (category, currentId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/products?category=${encodeURIComponent(category)}&limit=10`
      );
      const filtered = response.data.products.filter(p => p._id !== currentId).slice(0, 6);
      setSimilarProducts(filtered);
    } catch (error) {
      console.error('Error fetching similar products:', error);
    }
  }, []);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/${id}`);
      const prod = response.data.product;
      setProduct(prod);
      fetchSimilarProducts(prod.category, id);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id, fetchSimilarProducts]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(product, quantity);
    toast.success('Added to cart!');
  };

  const getImageUrl = () => {
    if (product.images && product.images[0] && product.images[0].url) {
      return product.images[0].url;
    }
    return '/assets/placeholders/no-image.jpg';
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div>Product not found</div>;

  return (
    <>
      <Helmet>
        <title>{product.name} - Elite Aquarium</title>
      </Helmet>

      <div className="product-details-page">

        {/* ── Main Product Card ── */}
        <div className="product-details-container">
          <div className="product-image-section">
            <div className="zoom-wrapper">
              <img
                src={getImageUrl()}
                alt={product.name}
                className="product-detail-image"
                onError={(e) => {
                  e.target.src = '/assets/placeholders/no-image.jpg';
                }}
              />
            </div>
          </div>

          <div className="product-info-section">
            <h1 className="product-detail-title">{product.name}</h1>
            <p className="product-detail-category">{product.category}</p>

            <div className="product-detail-rating">
              <span className="rating-stars">
                {'★'.repeat(Math.floor(product.rating || 0))}
                {'☆'.repeat(5 - Math.floor(product.rating || 0))}
              </span>
              <span className="rating-count">({product.numReviews || 0} reviews)</span>
            </div>

            <div className="product-detail-price">₹{product.price}</div>

            <div className="product-detail-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="product-specifications">
                <h3>Specifications</h3>
                <table className="specs-table">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td className="spec-key">{key}</td>
                        <td className="spec-value">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="product-actions">
              <div className="quantity-selector">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-btn"
                >-</button>
                <span className="quantity-value">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="quantity-btn"
                  disabled={quantity >= product.stock}
                >+</button>
              </div>

              <button
                onClick={handleAddToCart}
                className="add-to-cart-btn"
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>

            <div className="stock-info">
              {product.stock > 0 ? (
                <span className="in-stock">✓ In Stock ({product.stock} available)</span>
              ) : (
                <span className="out-of-stock">✗ Out of Stock</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Similar Products ── */}
        {similarProducts.length > 0 && (
          <div className="similar-products-section">
            <div className="similar-header">
              <div>
                <h2 className="similar-title">Similar Products</h2>
                <p className="similar-subtitle">More from {product.category}</p>
              </div>
              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="similar-view-all"
              >
                View All →
              </Link>
            </div>

            <Swiper
              modules={[FreeMode]}
              spaceBetween={16}
              freeMode={true}
              breakpoints={{
                0: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              className="similar-swiper"
            >
              {similarProducts.map(p => (
                <SwiperSlide key={p._id}>
                  <ProductCard product={p} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      <style>{`
        .product-details-page {
          background: #f5f5f5;
          padding: 40px 20px;
          max-width: 1300px;
          margin: 0 auto;
          min-height: calc(100vh - 200px);
        }

        /* Main product card */
        .product-details-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.1);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          padding: 40px;
          margin-bottom: 50px;
        }

        .product-image-section {
          background: #f8f9fa;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        /* Zoom wrapper — clips the scaled image */
        .zoom-wrapper {
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 8px;
          cursor: zoom-in;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-detail-image {
          width: 100%;
          height: auto;
          max-height: 500px;
          object-fit: contain;
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      filter 0.4s ease;
          display: block;
        }

        .zoom-wrapper:hover .product-detail-image {
          transform: scale(1.18);
          filter: drop-shadow(0 8px 24px rgba(102, 126, 234, 0.25));
        }

        .product-info-section { padding: 20px; }

        .product-detail-title {
          font-size: 28px;
          color: #333;
          margin-bottom: 10px;
        }

        .product-detail-category {
          color: #667eea;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 15px;
        }

        .product-detail-rating {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .rating-stars { color: #ffc107; font-size: 18px; }
        .rating-count { color: #666; font-size: 14px; }

        .product-detail-price {
          font-size: 32px;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 20px;
        }

        .product-detail-description { margin-bottom: 30px; }

        .product-detail-description h3,
        .product-specifications h3 {
          font-size: 18px;
          color: #333;
          margin-bottom: 10px;
        }

        .product-detail-description p {
          color: #666;
          line-height: 1.6;
        }

        .specs-table { width: 100%; border-collapse: collapse; }
        .specs-table tr { border-bottom: 1px solid #eee; }
        .specs-table td { padding: 10px; }
        .spec-key { font-weight: 600; color: #333; width: 40%; }
        .spec-value { color: #666; }

        .product-actions {
          display: flex;
          gap: 20px;
          margin: 30px 0;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          border: 2px solid #e1e1e1;
          border-radius: 6px;
          overflow: hidden;
        }

        .quantity-btn {
          width: 40px;
          height: 40px;
          background: #f8f9fa;
          border: none;
          font-size: 18px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .quantity-btn:hover { background: #e9ecef; }
        .quantity-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .quantity-value {
          width: 50px;
          text-align: center;
          font-weight: 600;
        }

        .add-to-cart-btn {
          flex: 1;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102,126,234,0.3);
        }

        .add-to-cart-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .stock-info { font-size: 14px; }
        .in-stock { color: #28a745; }
        .out-of-stock { color: #dc3545; }

        /* ── Similar Products Section ── */
        .similar-products-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
        }

        .similar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .similar-title {
          font-size: 22px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .similar-subtitle {
          font-size: 14px;
          color: #6b7280;
        }

        .similar-view-all {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          padding: 8px 18px;
          border: 2px solid #667eea;
          border-radius: 30px;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .similar-view-all:hover {
          background: #667eea;
          color: white;
        }

        .similar-swiper {
          width: 100%;
        }

        .similar-swiper .swiper-slide {
          height: auto;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .product-details-page { padding: 16px; }

          .product-details-container {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 20px;
            margin-bottom: 30px;
          }

          .product-actions { flex-direction: column; }

          .quantity-selector {
            width: fit-content;
            margin: 0 auto;
          }

          .similar-products-section { padding: 20px 16px; }
          .similar-title { font-size: 18px; }
        }
      `}</style>
    </>
  );
};

export default ProductDetailsPage;