import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/orders`);
      const ordersData = response.data.orders || [];
      setOrders(ordersData);
      
      // Calculate stats
      const statsData = {
        total: ordersData.length,
        processing: ordersData.filter(o => o.orderStatus === 'Processing').length,
        confirmed: ordersData.filter(o => o.orderStatus === 'Confirmed').length,
        shipped: ordersData.filter(o => o.orderStatus === 'Shipped').length,
        delivered: ordersData.filter(o => o.orderStatus === 'Delivered').length,
        cancelled: ordersData.filter(o => o.orderStatus === 'Cancelled').length
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/orders/${orderId}`, {
        orderStatus: newStatus
      });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'Processing': { icon: '🔄', color: '#f59e0b', bg: '#fef3c7' },
      'Confirmed': { icon: '✓', color: '#3b82f6', bg: '#dbeafe' },
      'Shipped': { icon: '🚚', color: '#8b5cf6', bg: '#ede9fe' },
      'Delivered': { icon: '✅', color: '#10b981', bg: '#d1fae5' },
      'Cancelled': { icon: '❌', color: '#ef4444', bg: '#fee2e2' }
    };
    return configs[status] || configs['Processing'];
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>Manage Orders - Admin Dashboard</title>
      </Helmet>

      <div className="admin-orders">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>📋 Order Management</h1>
            <p className="subtitle">View and manage all customer orders</p>
          </div>
          <div className="stats-badge">
            <span className="stat-badge total">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Orders</span>
            </span>
            <span className="stat-badge processing">
              <span className="stat-number">{stats.processing}</span>
              <span className="stat-label">Processing</span>
            </span>
            <span className="stat-badge delivered">
              <span className="stat-number">{stats.delivered}</span>
              <span className="stat-label">Delivered</span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
            )}
          </div>

          <div className="status-filters">
            <button 
              className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'Processing' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Processing')}
            >
              🔄 Processing
              {stats.processing > 0 && <span className="filter-count">{stats.processing}</span>}
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'Confirmed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Confirmed')}
            >
              ✓ Confirmed
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'Shipped' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Shipped')}
            >
              🚚 Shipped
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'Delivered' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Delivered')}
            >
              ✅ Delivered
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'Cancelled' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Cancelled')}
            >
              ❌ Cancelled
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="orders-grid">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => {
              const statusConfig = getStatusConfig(order.orderStatus);
              return (
                <div key={order._id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-id-section">
                      <span className="order-id-label">Order ID</span>
                      <span className="order-id-value">#{order._id?.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="order-date">
                      <span className="date-icon">📅</span>
                      <span>{new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>

                  <div className="order-card-body">
                    <div className="customer-section">
                      <div className="customer-avatar">
                        {order.user?.name?.charAt(0) || 'G'}
                      </div>
                      <div className="customer-info">
                        <h4 className="customer-name">{order.user?.name || 'Guest User'}</h4>
                        <p className="customer-email">{order.user?.email || 'No email'}</p>
                        <p className="customer-phone">📞 {order.shippingAddress?.phone || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="order-details">
                      <div className="detail-row">
                        <span className="detail-label">Total Amount:</span>
                        <span className="detail-value amount">₹{order.totalAmount?.toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Payment:</span>
                        <span className="detail-value">{order.paymentMethod || 'COD'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Items:</span>
                        <span className="detail-value">{order.items?.length || 0} products</span>
                      </div>
                    </div>

                    <div className="status-section">
                      <div className="current-status" style={{ background: statusConfig.bg }}>
                        <span className="status-icon">{statusConfig.icon}</span>
                        <span className="status-text" style={{ color: statusConfig.color }}>
                          {order.orderStatus}
                        </span>
                      </div>
                      
                      {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="Processing">🔄 Processing</option>
                          <option value="Confirmed">✓ Confirmed</option>
                          <option value="Shipped">🚚 Shipped</option>
                          <option value="Delivered">✅ Delivered</option>
                          <option value="Cancelled">❌ Cancelled</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <button 
                      className="view-order-btn"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Order Details
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results">
              <div className="no-results-icon">📭</div>
              <h3>No orders found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">
                  <span className="modal-icon">📋</span>
                  <h2>Order Details</h2>
                </div>
                <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
              </div>
              
              <div className="modal-body">
                {/* Order Header */}
                <div className="order-header-info">
                  <div className="info-box">
                    <span className="info-label">Order ID</span>
                    <span className="info-value">#{selectedOrder._id?.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Order Date</span>
                    <span className="info-value">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Payment Method</span>
                    <span className="info-value">{selectedOrder.paymentMethod || 'COD'}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Status</span>
                    <span className={`status-badge status-${selectedOrder.orderStatus?.toLowerCase()}`}>
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="detail-section">
                  <h4>👤 Customer Information</h4>
                  <div className="customer-details">
                    <p><strong>Name:</strong> {selectedOrder.user?.name || 'Guest User'}</p>
                    <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="detail-section">
                  <h4>📍 Shipping Address</h4>
                  <div className="address-box">
                    <p>{selectedOrder.shippingAddress?.street}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                    <p>PIN: {selectedOrder.shippingAddress?.pincode}</p>
                    <p>{selectedOrder.shippingAddress?.country || 'India'}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="detail-section">
                  <h4>🛍️ Order Items ({selectedOrder.items?.length})</h4>
                  <div className="items-table">
                    <div className="items-header">
                      <span className="col-product">Product</span>
                      <span className="col-qty">Qty</span>
                      <span className="col-price">Price</span>
                      <span className="col-total">Total</span>
                    </div>
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="items-row">
                        <span className="col-product">{item.name}</span>
                        <span className="col-qty">x{item.quantity}</span>
                        <span className="col-price">₹{item.price}</span>
                        <span className="col-total">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span className={selectedOrder.subtotal > 999 ? 'free' : ''}>
                      {selectedOrder.subtotal > 999 ? 'FREE' : '₹99'}
                    </span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span className="total-amount">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="close-modal-btn" onClick={() => setSelectedOrder(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-orders {
          max-width: 1400px;
          margin: 0 auto;
          padding: 30px;
        }

        /* Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .page-header h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 5px;
        }

        .subtitle {
          color: #666;
          font-size: 14px;
        }

        .stats-badge {
          display: flex;
          gap: 15px;
        }

        .stat-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 18px;
          border-radius: 12px;
          min-width: 90px;
        }

        .stat-badge.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .stat-badge.processing {
          background: #fef3c7;
          color: #f59e0b;
        }

        .stat-badge.delivered {
          background: #d1fae5;
          color: #10b981;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
        }

        .stat-label {
          font-size: 11px;
          opacity: 0.9;
        }

        /* Filters */
        .filters-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 350px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          opacity: 0.5;
        }

        .search-input {
          width: 100%;
          padding: 10px 40px 10px 40px;
          border: 2px solid #e1e1e1;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #999;
        }

        .status-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 8px 14px;
          background: white;
          border: 2px solid #e1e1e1;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
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

        .filter-count {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #ff4757;
          color: white;
          font-size: 10px;
          padding: 2px 5px;
          border-radius: 20px;
        }

        /* Orders Grid */
        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 24px;
        }

        .order-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          transition: all 0.3s;
        }

        .order-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }

        .order-card-header {
          padding: 16px 20px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e1e1e1;
        }

        .order-id-section {
          display: flex;
          flex-direction: column;
        }

        .order-id-label {
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .order-id-value {
          font-size: 14px;
          font-weight: 700;
          color: #333;
        }

        .order-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #666;
        }

        .order-card-body {
          padding: 20px;
        }

        /* Customer Section */
        .customer-section {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
        }

        .customer-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
          color: white;
        }

        .customer-info {
          flex: 1;
        }

        .customer-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0 0 2px 0;
        }

        .customer-email {
          font-size: 12px;
          color: #666;
          margin: 0 0 2px 0;
        }

        .customer-phone {
          font-size: 11px;
          color: #999;
          margin: 0;
        }

        /* Order Details */
        .order-details {
          margin-bottom: 16px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .detail-label {
          color: #666;
        }

        .detail-value {
          color: #333;
          font-weight: 500;
        }

        .detail-value.amount {
          color: #667eea;
          font-weight: 700;
        }

        /* Status Section */
        .status-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
        }

        .current-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .status-select {
          padding: 6px 12px;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
        }

        .order-card-footer {
          padding: 15px 20px;
          background: #fafafa;
          border-top: 1px solid #f0f0f0;
        }

        .view-order-btn {
          width: 100%;
          padding: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .view-order-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        /* No Results */
        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 16px;
        }

        .no-results-icon {
          font-size: 60px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 700px;
          max-height: 85vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 2px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-title h2 {
          font-size: 20px;
          color: #333;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #999;
        }

        .close-btn:hover {
          color: #ff4757;
        }

        .modal-body {
          padding: 24px;
        }

        .order-header-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f0f0f0;
        }

        .info-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
        }

        .info-value {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .detail-section {
          margin-bottom: 24px;
        }

        .detail-section h4 {
          font-size: 16px;
          color: #333;
          margin-bottom: 12px;
        }

        .customer-details p {
          margin: 0 0 6px 0;
          font-size: 14px;
          color: #555;
        }

        .address-box {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 12px;
        }

        .address-box p {
          margin: 0 0 6px 0;
          font-size: 14px;
          color: #555;
        }

        .items-table {
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .items-header {
          display: grid;
          grid-template-columns: 2fr 0.5fr 1fr 1fr;
          background: #f8f9fa;
          padding: 12px;
          font-size: 12px;
          font-weight: 600;
          color: #666;
          border-bottom: 1px solid #f0f0f0;
        }

        .items-row {
          display: grid;
          grid-template-columns: 2fr 0.5fr 1fr 1fr;
          padding: 12px;
          font-size: 13px;
          color: #333;
          border-bottom: 1px solid #f0f0f0;
        }

        .items-row:last-child {
          border-bottom: none;
        }

        .order-summary {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 12px;
          margin-top: 20px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .summary-row.total {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #e1e1e1;
          font-weight: 700;
          font-size: 16px;
        }

        .total-amount {
          color: #667eea;
        }

        .free {
          color: #10b981;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
        }

        .close-modal-btn {
          padding: 10px 24px;
          background: #f8f9fa;
          color: #666;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          cursor: pointer;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .admin-orders {
            padding: 20px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .stats-badge {
            width: 100%;
            justify-content: space-between;
          }

          .filters-section {
            flex-direction: column;
          }

          .search-box {
            max-width: 100%;
            width: 100%;
          }

          .status-filters {
            width: 100%;
            justify-content: stretch;
          }

          .filter-btn {
            flex: 1;
            text-align: center;
          }

          .orders-grid {
            grid-template-columns: 1fr;
          }

          .order-header-info {
            grid-template-columns: 1fr;
          }

          .items-header, .items-row {
            grid-template-columns: 1.5fr 0.5fr 1fr 1fr;
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
};

export default AdminOrders;