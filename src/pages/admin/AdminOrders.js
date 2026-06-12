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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/orders`);
      setOrders(response.data.orders || []);
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Processing': return 'status-processing';
      case 'Confirmed': return 'status-confirmed';
      case 'Shipped': return 'status-shipped';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>Manage Orders - Admin Dashboard</title>
      </Helmet>

      <div className="admin-orders">
        {/* Header */}
        <div className="page-header">
          <h1>📋 Manage Orders</h1>
          <div className="stats-info">
            <span className="stat-badge">Total Orders: {orders.length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="Processing">Processing</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order._id}>
                    <td className="order-id">#{order._id?.slice(-6).toUpperCase()}</td>
                    <td>
                      <div className="customer-info">
                        <strong>{order.user?.name || 'Guest'}</strong>
                        <small>{order.user?.email || 'No email'}</small>
                      </div>
                    </td>
                    <td className="date-cell">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="order-total">₹{order.totalAmount?.toLocaleString()}</td>
                    <td>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={`status-select ${getStatusColor(order.orderStatus)}`}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{order.paymentMethod || 'COD'}</td>
                    <td>
                      <button 
                        className="view-btn"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Order Details</h2>
                <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="details-grid">
                  <div>
                    <label>Order ID</label>
                    <p>#{selectedOrder._id?.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <label>Order Date</label>
                    <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label>Payment Method</label>
                    <p>{selectedOrder.paymentMethod || 'COD'}</p>
                  </div>
                  <div>
                    <label>Order Status</label>
                    <p className={`status-badge ${getStatusColor(selectedOrder.orderStatus)}`}>
                      {selectedOrder.orderStatus}
                    </p>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Customer Information</h3>
                  <div className="info-row">
                    <span>Name:</span>
                    <strong>{selectedOrder.user?.name || 'Guest'}</strong>
                  </div>
                  <div className="info-row">
                    <span>Email:</span>
                    <strong>{selectedOrder.user?.email || 'N/A'}</strong>
                  </div>
                  <div className="info-row">
                    <span>Phone:</span>
                    <strong>{selectedOrder.shippingAddress?.phone || 'N/A'}</strong>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Shipping Address</h3>
                  <p>{selectedOrder.shippingAddress?.street}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                  <p>PIN: {selectedOrder.shippingAddress?.pincode}</p>
                </div>

                <div className="details-section">
                  <h3>Order Items</h3>
                  <div className="items-list">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="item-row">
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">x{item.quantity}</span>
                        <span className="item-price">₹{item.price}</span>
                        <span className="item-total">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-total-summary">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="total-row">
                    <span>Shipping:</span>
                    <span>{selectedOrder.subtotal > 999 ? 'FREE' : '₹99'}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total:</span>
                    <span>₹{selectedOrder.totalAmount?.toLocaleString()}</span>
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
          padding: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .page-header h1 {
          font-size: 28px;
          color: #333;
          margin: 0;
        }

        .stats-info {
          display: flex;
          gap: 15px;
        }

        .stat-badge {
          padding: 8px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          font-weight: 500;
        }

        .filters-bar {
          display: flex;
          gap: 20px;
          margin-bottom: 25px;
        }

        .search-box {
          flex: 1;
          position: relative;
          max-width: 350px;
        }

        .search-input {
          width: 100%;
          padding: 10px 15px 10px 40px;
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
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          opacity: 0.5;
        }

        .status-filter {
          padding: 10px 15px;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          font-size: 14px;
          min-width: 150px;
        }

        .orders-table-container {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        .orders-table th {
          background: #f8f9fa;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          color: #555;
          border-bottom: 2px solid #dee2e6;
        }

        .orders-table td {
          padding: 15px;
          border-bottom: 1px solid #eee;
          vertical-align: middle;
        }

        .order-id {
          font-weight: 600;
          color: #667eea;
        }

        .customer-info {
          display: flex;
          flex-direction: column;
        }

        .customer-info strong {
          color: #333;
        }

        .customer-info small {
          color: #999;
          font-size: 12px;
        }

        .order-total {
          font-weight: 600;
          color: #28a745;
        }

        .status-select {
          padding: 6px 10px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
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

        .status-cancelled {
          background: #f8d7da;
          color: #721c24;
        }

        .view-btn {
          padding: 5px 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .view-btn:hover {
          background: #5a67d8;
        }

        .no-data {
          text-align: center;
          padding: 40px;
          color: #999;
        }

        /* Modal Styles */
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
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 20px;
          border-bottom: 2px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          background: white;
        }

        .modal-header h2 {
          font-size: 20px;
          color: #333;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          padding: 20px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
        }

        .details-grid label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          display: block;
        }

        .details-grid p {
          margin: 5px 0 0;
          font-weight: 600;
          color: #333;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .details-section {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
        }

        .details-section h3 {
          font-size: 16px;
          color: #333;
          margin-bottom: 10px;
        }

        .info-row {
          margin-bottom: 8px;
        }

        .info-row span {
          color: #666;
          width: 80px;
          display: inline-block;
        }

        .details-section p {
          margin: 5px 0;
          color: #555;
        }

        .items-list {
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .item-row {
          display: grid;
          grid-template-columns: 2fr 0.5fr 1fr 1fr;
          padding: 10px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 13px;
        }

        .item-row:last-child {
          border-bottom: none;
        }

        .item-name {
          font-weight: 500;
          color: #333;
        }

        .order-total-summary {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .grand-total {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #e1e1e1;
          font-weight: 700;
          font-size: 16px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .close-modal-btn {
          padding: 8px 20px;
          background: #f8f9fa;
          color: #666;
          border: 2px solid #e1e1e1;
          border-radius: 6px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .admin-orders {
            padding: 20px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .filters-bar {
            flex-direction: column;
          }

          .search-box {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default AdminOrders;