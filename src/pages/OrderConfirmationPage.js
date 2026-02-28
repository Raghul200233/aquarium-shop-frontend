import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

/**
 * OrderConfirmationPage - Displays order success message and details
 * Shows after successful order placement
 */
const OrderConfirmationPage = () => {
  // Get order ID from URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for order details and loading status
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/orders/${id}`
      );

      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);

      if (err.response?.status === 404) {
        setError('Order not found. The order may have been deleted or you may have entered an incorrect URL.');
      } else if (err.response?.status === 401) {
        setError('You are not authorized to view this order. Please log in with the correct account.');
      } else {
        setError(err.response?.data?.message || 'Failed to load order details. Please try again.');
      }

      setTimeout(() => {
        navigate('/');
      }, 5000);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Loading your order details...</p>
      </div>
    );
  }

  // Show error message if order not found
  if (error || !order) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon">❌</div>
          <h2>Unable to Load Order</h2>
          <p>{error || 'The order you are looking for does not exist.'}</p>
          <p className="redirect-message">Redirecting to homepage in 5 seconds...</p>
          <div className="error-actions">
            <Link to="/" className="home-link">
              Go to Homepage Now
            </Link>
            <Link to="/orders" className="orders-link">
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format the order ID to show last 8 characters
  const displayOrderId = order._id ? order._id.slice(-8).toUpperCase() : 'N/A';

  // Format date
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    : 'N/A';

  return (
    <>
      <Helmet>
        <title>Order Confirmed - AquaWorld</title>
        <meta name="description" content="Your order has been successfully placed" />
      </Helmet>

      <div className="confirmation-page">
        {/* Success Message Card */}
        <div className="confirmation-card">
          {/* Success Icon with Animation */}
          <div className="success-icon-wrapper">
            <div className="success-icon">✓</div>
          </div>

          {/* Main Success Message */}
          <h1>Thank You for Your Order!</h1>
          <p className="order-message">
            Your order has been successfully placed and is being processed.
          </p>

          {/* Order ID Display */}
          <div className="order-id-container">
            <span className="order-id-label">Order ID:</span>
            <span className="order-id-value">#{displayOrderId}</span>
          </div>

          {/* Order Date */}
          <div className="order-date">
            <span className="date-label">Order Date:</span>
            <span className="date-value">{orderDate}</span>
          </div>

          {/* Order Summary Card */}
          <div className="order-summary-card">
            <h3>Order Summary</h3>

            {/* Items List */}
            <div className="order-items">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.name || 'Product'}</span>
                      <span className="item-quantity">x{item.quantity || 1}</span>
                    </div>
                    <span className="item-price">₹{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="no-items">No items in order</div>
              )}
            </div>

            {/* Totals */}
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{(order.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span className="free-shipping">FREE</span>
              </div>
              <div className="total-row grand-total">
                <span>Total Amount:</span>
                <span className="total-amount">₹{(order.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="total-row paid-amount">
                <span>Paid Amount:</span>
                <span className="paid-value">₹{(order.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="payment-info">
              <span className="payment-label">Payment Method:</span>
              <span className="payment-value">{order.paymentMethod || 'Cash on Delivery'}</span>
            </div>

            {/* Order Status */}
            <div className="status-info">
              <span className="status-label">Order Status:</span>
              <span className={`status-badge status-${(order.orderStatus || 'processing').toLowerCase()}`}>
                {order.orderStatus || 'PROCESSING'}
              </span>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="shipping-info">
                <h4>Shipping Address</h4>
                <p className="address-text">
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                  {order.shippingAddress.country || 'India'}<br />
                  <span className="phone-number">Phone: {order.shippingAddress.phone || 'N/A'}</span>
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="confirmation-actions">
            <Link to={`/orders`} className="btn-primary">
              View All Orders
            </Link>
            <Link to="/products" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>

          {/* Additional Information */}
          <div className="info-box">
            <p className="info-text">
              <span className="info-icon">📧</span>
              A confirmation email has been sent to {user?.email || 'your email address'}.
            </p>
            <p className="info-text">
              <span className="info-icon">🚚</span>
              You will receive shipping updates once your order is dispatched.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .confirmation-page {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
        }

        .confirmation-card {
          background: white;
          border-radius: 20px;
          padding: 50px;
          text-align: center;
          max-width: 700px;
          width: 100%;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .loading-container {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .success-icon-wrapper {
          margin-bottom: 30px;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin: 0 auto;
          animation: scaleIn 0.5s ease-out 0.2s both;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .confirmation-card h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 15px;
          animation: fadeIn 0.5s ease-out 0.3s both;
        }

        .order-message {
          color: #666;
          margin-bottom: 25px;
          font-size: 16px;
          animation: fadeIn 0.5s ease-out 0.4s both;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .order-id-container {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          animation: fadeIn 0.5s ease-out 0.5s both;
        }

        .order-id-label {
          color: #666;
          font-weight: 500;
        }

        .order-id-value {
          font-size: 20px;
          font-weight: 700;
          color: #667eea;
          letter-spacing: 1px;
        }

        .order-date {
          background: #f8f9fa;
          padding: 10px 15px;
          border-radius: 10px;
          margin-bottom: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          animation: fadeIn 0.5s ease-out 0.55s both;
        }

        .date-label {
          color: #666;
          font-weight: 500;
        }

        .date-value {
          color: #333;
          font-weight: 500;
        }

        .order-summary-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 30px;
          color: white;
          animation: fadeIn 0.5s ease-out 0.6s both;
          text-align: left;
        }

        .order-summary-card h3 {
          font-size: 18px;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid rgba(255,255,255,0.2);
        }

        .order-summary-card h4 {
          font-size: 16px;
          margin: 15px 0 10px;
          color: rgba(255,255,255,0.9);
        }

        .order-items {
          margin-bottom: 20px;
          max-height: 200px;
          overflow-y: auto;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .item-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .item-name {
          font-weight: 500;
        }

        .item-quantity {
          color: rgba(255,255,255,0.7);
          font-size: 13px;
        }

        .item-price {
          font-weight: 600;
        }

        .no-items {
          text-align: center;
          padding: 15px;
          color: rgba(255,255,255,0.7);
          font-style: italic;
        }

        .order-totals {
          margin: 15px 0;
          padding: 15px 0;
          border-top: 2px solid rgba(255,255,255,0.2);
          border-bottom: 2px solid rgba(255,255,255,0.2);
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .grand-total {
          font-size: 18px;
          font-weight: 700;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid rgba(255,255,255,0.3);
        }

        .total-amount {
          font-size: 20px;
        }

        .paid-amount {
          margin-top: 5px;
          color: #a5d6a5;
        }

        .paid-value {
          font-weight: 600;
        }

        .free-shipping {
          color: #a5d6a5;
          font-weight: 600;
        }

        .payment-info, .status-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-processing {
          background: #fff3cd;
          color: #856404;
        }

        .status-confirmed {
          background: #cce5ff;
          color: #004085;
        }

        .status-shipped {
          background: #d1ecf1;
          color: #0c5460;
        }

        .status-delivered {
          background: #d4edda;
          color: #155724;
        }

        .shipping-info {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid rgba(255,255,255,0.2);
        }

        .address-text {
          line-height: 1.6;
          margin-top: 10px;
          color: rgba(255,255,255,0.9);
        }

        .phone-number {
          display: block;
          margin-top: 5px;
          font-weight: 500;
        }

        .confirmation-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 25px;
          animation: fadeIn 0.5s ease-out 0.7s both;
        }

        .btn-primary {
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s;
          flex: 1;
          max-width: 200px;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-secondary {
          padding: 12px 30px;
          background: #f8f9fa;
          color: #666;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s;
          flex: 1;
          max-width: 200px;
          border: 2px solid #e1e1e1;
        }

        .btn-secondary:hover {
          background: #e9ecef;
          transform: translateY(-2px);
        }

        .info-box {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 15px;
          text-align: left;
          animation: fadeIn 0.5s ease-out 0.8s both;
        }

        .info-text {
          color: #666;
          font-size: 14px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .info-text:last-child {
          margin-bottom: 0;
        }

        .info-icon {
          font-size: 16px;
        }

        /* Error styles */
        .error-container {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .error-card {
          background: white;
          border-radius: 10px;
          padding: 40px;
          text-align: center;
          max-width: 500px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .error-icon {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .error-card h2 {
          font-size: 24px;
          color: #333;
          margin-bottom: 10px;
        }

        .error-card p {
          color: #666;
          margin-bottom: 10px;
        }

        .redirect-message {
          color: #999;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .error-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .home-link {
          display: inline-block;
          padding: 10px 20px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          transition: background 0.3s;
        }

        .home-link:hover {
          background: #5a67d8;
        }

        .orders-link {
          display: inline-block;
          padding: 10px 20px;
          background: #f8f9fa;
          color: #666;
          text-decoration: none;
          border-radius: 6px;
          border: 2px solid #e1e1e1;
          transition: all 0.3s;
        }

        .orders-link:hover {
          background: #e9ecef;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .confirmation-card {
            padding: 30px 20px;
          }

          .confirmation-card h1 {
            font-size: 24px;
          }

          .confirmation-actions {
            flex-direction: column;
            align-items: center;
          }

          .btn-primary,
          .btn-secondary {
            max-width: 100%;
            width: 100%;
          }

          .order-id-container,
          .order-date {
            flex-direction: column;
            gap: 5px;
          }

          .error-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};

export default OrderConfirmationPage;