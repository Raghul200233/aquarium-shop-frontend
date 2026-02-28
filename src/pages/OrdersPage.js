import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter] = useState('all');
  const [searchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders/my-orders`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return '✅';
      case 'shipped': return '🚚';
      case 'processing': return '⚙️';
      case 'confirmed': return '✓';
      case 'cancelled': return '❌';
      default: return '⏳';
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };


  const getFilteredOrders = () => {
    let filtered = orders;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(order =>
        order.orderStatus?.toLowerCase() === filter.toLowerCase()
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>My Orders - Elite Aquarium</title>
      </Helmet>

      <div className="orders-page">
        <div className="orders-header">
          <div>
            <h1>My Orders</h1>
            <p className="welcome-text">Welcome back, {user?.name}! Here's your order history.</p>
          </div>
          <Link to="/products" className="shop-now-btn">
            Continue Shopping
          </Link>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📭</div>
            <h2>No orders found</h2>
            <p>
              {searchTerm || filter !== 'all'
                ? "No orders match your search criteria."
                : "You haven't placed any orders yet."}
            </p>
            {!searchTerm && filter === 'all' && (
              <Link to="/products" className="start-shopping-btn">
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                {/* Order Header */}
                <div className="order-header">
                  <div className="order-header-left">
                    <div className="order-id">
                      <span className="label">Order ID:</span>
                      <span className="value">#{order._id?.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="order-date">
                      <span className="label">Placed on:</span>
                      <span className="value">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className="order-header-right">
                    <div className={`order-status ${getStatusColor(order.orderStatus)}`}>
                      <span className="status-icon">{getStatusIcon(order.orderStatus)}</span>
                      <span className="status-text">{order.orderStatus || 'Processing'}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="order-items">
                  {order.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <img
                          src={item.image || '/assets/placeholders/no-image.jpg'}
                          alt={item.name}
                          className="item-image"
                          onError={(e) => {
                            e.target.src = '/assets/placeholders/no-image.jpg';
                          }}
                        />
                        <div className="item-details">
                          <Link to={`/product/${item.product}`} className="item-name">
                            {item.name}
                          </Link>
                          <div className="item-meta">
                            <span className="item-price">₹{item.price?.toLocaleString()}</span>
                            <span className="item-quantity">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="item-total">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="order-footer">
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>₹{order.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span className={order.subtotal > 999 ? 'free-shipping' : ''}>
                        {order.subtotal > 999 ? 'FREE' : '₹99'}
                      </span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span className="total-amount">₹{order.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button
                      className="view-details-btn"
                      onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                    >
                      {selectedOrder === order._id ? 'Hide Details' : 'View Details'}
                    </button>
                    <Link to={`/products`} className="reorder-btn">
                      Buy Again
                    </Link>
                    {order.orderStatus === 'Delivered' && (
                      <button className="review-btn">Write Review</button>
                    )}
                  </div>
                </div>

                {/* Expanded Order Details */}
                {selectedOrder === order._id && (
                  <div className="order-details-expanded">
                    <h4>Order Details</h4>

                    <div className="details-grid">
                      <div className="detail-section">
                        <h5>Shipping Address</h5>
                        <p>{order.shippingAddress?.street}</p>
                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                        <p>{order.shippingAddress?.pincode}</p>
                        <p>{order.shippingAddress?.country || 'India'}</p>
                        <p className="phone">Phone: {order.shippingAddress?.phone}</p>
                      </div>

                      <div className="detail-section">
                        <h5>Payment Information</h5>
                        <p><span className="detail-label">Method:</span> {order.paymentMethod || 'Cash on Delivery'}</p>
                        <p><span className="detail-label">Status:</span> {order.paymentStatus || 'Pending'}</p>
                      </div>

                      <div className="detail-section">
                        <h5>Order Timeline</h5>
                        <div className="timeline">
                          <div className="timeline-item">
                            <span className="timeline-date">{formatDate(order.createdAt)}</span>
                            <span className="timeline-event">Order Placed</span>
                          </div>
                          {order.orderStatus === 'Confirmed' && (
                            <div className="timeline-item">
                              <span className="timeline-date">-</span>
                              <span className="timeline-event">Order Confirmed</span>
                            </div>
                          )}
                          {order.orderStatus === 'Shipped' && (
                            <div className="timeline-item">
                              <span className="timeline-date">-</span>
                              <span className="timeline-event">Order Shipped</span>
                            </div>
                          )}
                          {order.orderStatus === 'Delivered' && (
                            <div className="timeline-item">
                              <span className="timeline-date">{formatDate(order.deliveredAt)}</span>
                              <span className="timeline-event">Delivered</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {order.notes && (
                        <div className="detail-section">
                          <h5>Order Notes</h5>
                          <p className="order-notes">{order.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="need-help">
                      <p>Need help with this order? <Link to="/contact">Contact Support</Link></p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .orders-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .orders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .orders-header h1 {
          font-size: 32px;
          color: #333;
          margin-bottom: 5px;
        }

        .welcome-text {
          color: #666;
          font-size: 16px;
        }

        .shop-now-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .shop-now-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .stat-icon {
          font-size: 40px;
        }

        .stat-content h3 {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #333;
        }

        .filters-section {
          margin-bottom: 30px;
        }

        .search-box {
          position: relative;
          margin-bottom: 15px;
        }

        .search-input {
          width: 100%;
          padding: 12px 20px 12px 45px;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          font-size: 14px;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          opacity: 0.5;
        }

        .filter-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 8px 16px;
          background: white;
          border: 2px solid #e1e1e1;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.3s;
        }

        .filter-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .no-orders {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .no-orders-icon {
          font-size: 60px;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .no-orders h2 {
          font-size: 24px;
          color: #333;
          margin-bottom: 10px;
        }

        .no-orders p {
          color: #666;
          margin-bottom: 20px;
        }

        .start-shopping-btn {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .order-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: all 0.3s;
        }

        .order-card:hover {
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .order-header-left .order-id {
          font-size: 16px;
          margin-bottom: 5px;
        }

        .order-header-left .label {
          color: #666;
          margin-right: 5px;
        }

        .order-header-left .value {
          font-weight: 600;
          color: #333;
        }

        .order-date .value {
          color: #666;
          font-size: 14px;
        }

        .order-status {
          padding: 6px 12px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .status-icon {
          font-size: 14px;
        }

        .status-delivered {
          background: #d4edda;
          color: #155724;
        }

        .status-shipped {
          background: #cce5ff;
          color: #004085;
        }

        .status-processing {
          background: #fff3cd;
          color: #856404;
        }

        .status-confirmed {
          background: #d1ecf1;
          color: #0c5460;
        }

        .status-cancelled {
          background: #f8d7da;
          color: #721c24;
        }

        .status-pending {
          background: #e2e3e5;
          color: #383d41;
        }

        .order-items {
          margin-bottom: 20px;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px dashed #f0f0f0;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .item-info {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .item-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
        }

        .item-details {
          display: flex;
          flex-direction: column;
        }

        .item-name {
          font-weight: 600;
          color: #333;
          text-decoration: none;
          margin-bottom: 5px;
        }

        .item-name:hover {
          color: #667eea;
        }

        .item-meta {
          display: flex;
          gap: 15px;
          font-size: 13px;
          color: #666;
        }

        .item-price {
          font-weight: 600;
          color: #667eea;
        }

        .item-total {
          font-weight: 700;
          color: #333;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #f0f0f0;
        }

        .order-summary {
          text-align: right;
        }

        .summary-row {
          display: flex;
          gap: 20px;
          margin-bottom: 5px;
          color: #666;
        }

        .summary-row.total {
          margin-top: 5px;
          padding-top: 5px;
          border-top: 2px solid #f0f0f0;
          font-weight: 700;
          color: #333;
        }

        .total-amount {
          color: #667eea;
          font-size: 18px;
        }

        .free-shipping {
          color: #28a745;
        }

        .order-actions {
          display: flex;
          gap: 10px;
        }

        .view-details-btn, .reorder-btn, .review-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .view-details-btn {
          background: #667eea;
          color: white;
        }

        .view-details-btn:hover {
          background: #5a67d8;
        }

        .reorder-btn {
          background: #28a745;
          color: white;
          text-decoration: none;
        }

        .reorder-btn:hover {
          background: #218838;
        }

        .review-btn {
          background: #ffc107;
          color: #333;
        }

        .review-btn:hover {
          background: #e0a800;
        }

        .order-details-expanded {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #f0f0f0;
        }

        .order-details-expanded h4 {
          font-size: 16px;
          color: #333;
          margin-bottom: 15px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 15px;
        }

        .detail-section h5 {
          font-size: 14px;
          color: #555;
          margin-bottom: 10px;
        }

        .detail-section p {
          color: #666;
          margin-bottom: 5px;
          font-size: 13px;
        }

        .detail-section .phone {
          margin-top: 10px;
          font-weight: 500;
        }

        .detail-label {
          color: #999;
          margin-right: 5px;
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .timeline-item {
          display: flex;
          gap: 15px;
          font-size: 13px;
        }

        .timeline-date {
          color: #999;
          min-width: 100px;
        }

        .timeline-event {
          color: #333;
        }

        .order-notes {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 6px;
          font-style: italic;
        }

        .need-help {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #f0f0f0;
          text-align: center;
        }

        .need-help p {
          color: #666;
          font-size: 13px;
        }

        .need-help a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .need-help a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .orders-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .filter-buttons {
            overflow-x: auto;
            padding-bottom: 5px;
          }

          .filter-btn {
            white-space: nowrap;
          }

          .order-header {
            flex-direction: column;
            gap: 10px;
          }

          .order-footer {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .order-actions {
            justify-content: stretch;
          }

          .view-details-btn, .reorder-btn, .review-btn {
            flex: 1;
            text-align: center;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default OrdersPage;