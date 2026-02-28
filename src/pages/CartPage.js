import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import ProductCard from '../components/ProductCard';
import 'swiper/css';

// Category complement map — for each cart category, suggest these categories
const COMPLEMENT_MAP = {
  'Live Fishes': ['Fish Foods', 'Fish Medicines', 'Aquarium Tanks'],
  'Fish Foods': ['Live Fishes', 'Fish Medicines', 'Filters'],
  'Fish Medicines': ['Live Fishes', 'Fish Foods', 'Filters'],
  'Aquarium Tanks': ['Filters', 'Heaters', 'Aquarium Lights'],
  'Filters': ['Heaters', 'Aquarium Lights', 'Planted Tank Lights'],
  'Heaters': ['Filters', 'Aquarium Lights', 'Aquarium Tanks'],
  'Aquarium Lights': ['Planted Tank Lights', 'Filters', 'Heaters'],
  'Planted Tank Lights': ['Aquarium Lights', 'Filters', 'Heaters'],
};

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getItemCount
  } = useCart();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [complementaryProducts, setComplementaryProducts] = useState([]);
  const [complementaryLabel, setComplementaryLabel] = useState('');

  useEffect(() => {
    if (cartItems.length === 0) {
      setComplementaryProducts([]);
      return;
    }

    const cartCategories = [...new Set(cartItems.map(i => i.category).filter(Boolean))];
    // Pick complement categories not already in cart
    const suggestedCategories = cartCategories
      .flatMap(cat => COMPLEMENT_MAP[cat] || [])
      .filter((cat, idx, arr) => arr.indexOf(cat) === idx) // dedupe
      .filter(cat => !cartCategories.includes(cat));

    if (suggestedCategories.length === 0) {
      setComplementaryProducts([]);
      return;
    }

    // Pick the first suggested category and fetch its products
    const targetCategory = suggestedCategories[0];
    setComplementaryLabel(`Complete Your Setup — ${targetCategory}`);
    fetchComplementary(targetCategory);
  }, [cartItems]);

  const fetchComplementary = async (category) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/products?category=${encodeURIComponent(category)}&limit=8`
      );
      setComplementaryProducts(res.data.products || []);
    } catch (err) {
      console.error('Error fetching complementary products:', err);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>Shopping Cart - AquaWorld</title>
      </Helmet>

      <div className="cart-page">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p className="cart-count">{getItemCount()} items</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/products" className="continue-shopping-btn">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-container">
            {/* Cart Items Section */}
            <div className="cart-items-section">
              {cartItems.map((item) => (
                <div key={item.product} className="cart-item">
                  <div className="item-image">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                      }}
                    />
                  </div>

                  <div className="item-details">
                    <Link to={`/product/${item.product}`} className="item-name">
                      {item.name}
                    </Link>
                    <p className="item-price">₹{item.price.toLocaleString()}</p>

                    <div className="item-actions">
                      <div className="quantity-control">
                        <button
                          onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                          className="quantity-btn"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                          className="quantity-btn"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="item-total">
                    <p>Item Total</p>
                    <p className="total-price">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Section */}
            <div className="order-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal ({getItemCount()} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="free-shipping">FREE</span>
                ) : (
                  <span>₹{shipping}</span>
                )}
              </div>

              {shipping > 0 && (
                <div className="shipping-note">
                  <p>Add ₹{(999 - subtotal).toLocaleString()} more for FREE shipping</p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min((subtotal / 999) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="summary-total">
                <span>Total</span>
                <span className="total-amount">₹{total.toLocaleString()}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="checkout-btn"
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </button>

              <Link to="/products" className="continue-shopping-link">
                ← Continue Shopping
              </Link>

              <div className="payment-icons">
                <span className="payment-icon">💳</span>
                <span className="payment-icon">🏦</span>
                <span className="payment-icon">📱</span>
                <span className="payment-text">Secure Checkout</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Complementary Products ── */}
        {complementaryProducts.length > 0 && (
          <div className="complementary-section">
            <div className="complementary-header">
              <div>
                <span className="complementary-badge">🛍️ You might also need</span>
                <h2 className="complementary-title">{complementaryLabel}</h2>
              </div>
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
              className="complementary-swiper"
            >
              {complementaryProducts.map(product => (
                <SwiperSlide key={product._id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      <style>{`
        .cart-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
          min-height: 60vh;
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }

        .cart-header h1 {
          font-size: 32px;
          color: #333;
        }

        .cart-count {
          font-size: 18px;
          color: #666;
          background: #f5f5f5;
          padding: 5px 15px;
          border-radius: 20px;
        }

        /* Empty Cart */
        .empty-cart {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .empty-cart-icon {
          font-size: 80px;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .empty-cart h2 {
          font-size: 24px;
          color: #333;
          margin-bottom: 10px;
        }

        .empty-cart p {
          color: #666;
          margin-bottom: 30px;
        }

        .continue-shopping-btn {
          display: inline-block;
          padding: 15px 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .continue-shopping-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        /* Cart with Items */
        .cart-container {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 30px;
        }

        /* Cart Items */
        .cart-items-section {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 120px 1fr auto;
          gap: 20px;
          padding: 20px;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.3s;
        }

        .cart-item:hover {
          background-color: #fafafa;
        }

        .cart-item:last-child {
          border-bottom: none;
        }

        .item-image {
          width: 120px;
          height: 120px;
          border-radius: 8px;
          overflow: hidden;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .cart-item:hover .item-image img {
          transform: scale(1.05);
        }

        .item-details {
          display: flex;
          flex-direction: column;
        }

        .item-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          text-decoration: none;
          margin-bottom: 5px;
          transition: color 0.3s;
        }

        .item-name:hover {
          color: #667eea;
        }

        .item-price {
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 15px;
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          overflow: hidden;
        }

        .quantity-btn {
          width: 36px;
          height: 36px;
          background: white;
          border: none;
          font-size: 18px;
          font-weight: 600;
          color: #333;
          cursor: pointer;
          transition: all 0.3s;
        }

        .quantity-btn:hover:not(:disabled) {
          background: #667eea;
          color: white;
        }

        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity-value {
          width: 40px;
          text-align: center;
          font-weight: 600;
          color: #333;
        }

        .remove-btn {
          background: none;
          border: none;
          color: #ff6b6b;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.3s;
          text-decoration: underline;
        }

        .remove-btn:hover {
          color: #ff4757;
        }

        .item-total {
          text-align: right;
        }

        .item-total p:first-child {
          color: #666;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .total-price {
          font-size: 18px;
          font-weight: 700;
          color: #333;
        }

        /* Order Summary */
        .order-summary {
          background: white;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          height: fit-content;
          position: sticky;
          top: 90px;
        }

        .order-summary h2 {
          font-size: 20px;
          color: #333;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          color: #666;
        }

        .free-shipping {
          color: #28a745;
          font-weight: 600;
        }

        .shipping-note {
          margin: 15px 0;
          padding: 15px;
          background: #f0f9ff;
          border-radius: 8px;
        }

        .shipping-note p {
          color: #0066cc;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .progress-bar {
          height: 8px;
          background: #e1e1e1;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
          padding: 20px 0;
          border-top: 2px solid #f0f0f0;
          border-bottom: 2px solid #f0f0f0;
          font-size: 18px;
          font-weight: 700;
        }

        .total-amount {
          color: #667eea;
          font-size: 24px;
        }

        .checkout-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          margin-bottom: 15px;
        }

        .checkout-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .checkout-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .continue-shopping-link {
          display: block;
          text-align: center;
          color: #666;
          text-decoration: none;
          margin-bottom: 20px;
          transition: color 0.3s;
        }

        .continue-shopping-link:hover {
          color: #667eea;
        }

        .payment-icons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
        }

        .payment-icon {
          font-size: 24px;
        }

        .payment-text {
          color: #666;
          font-size: 13px;
          margin-left: 5px;
        }

        /* ── Complementary Products ── */
        .complementary-section {
          margin-top: 50px;
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
        }

        .complementary-header {
          margin-bottom: 24px;
        }

        .complementary-badge {
          display: inline-block;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }

        .complementary-title {
          font-size: 22px;
          font-weight: 700;
          color: #1f2937;
        }

        .complementary-swiper {
          width: 100%;
        }

        .complementary-swiper .swiper-slide {
          height: auto;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .cart-container {
            grid-template-columns: 1fr;
          }

          .order-summary {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .cart-page {
            padding: 20px;
          }

          .cart-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .cart-item {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .item-image {
            width: 100%;
            height: 200px;
            margin: 0 auto;
          }

          .item-actions {
            justify-content: center;
          }

          .item-total {
            text-align: center;
          }

          .related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default CartPage;