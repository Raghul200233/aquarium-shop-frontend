import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastCheckedOrders, setLastCheckedOrders] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
    fetchPendingOrdersCount();
    
    // Poll for new orders every 30 seconds
    const interval = setInterval(() => {
      fetchPendingOrdersCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      console.log('Fetching admin dashboard data...');
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats`);
      console.log('Dashboard response:', response.data);
      
      if (response.data.success) {
        setStats(response.data.stats);
        setRecentOrders(response.data.recentOrders || []);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Error loading dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOrdersCount = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/orders?status=Processing`);
      const pendingCount = response.data.orders?.length || 0;
      
      // Show notification if new orders arrived
      if (pendingCount > lastCheckedOrders && lastCheckedOrders !== 0) {
        const newOrdersCount = pendingCount - lastCheckedOrders;
        toast.success(`🛒 ${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''} pending!`, {
          duration: 5000,
          icon: '📦',
          style: {
            background: '#ffc107',
            color: '#333',
            fontWeight: 'bold'
          }
        });
      }
      
      setLastCheckedOrders(pendingCount);
      setStats(prev => ({ ...prev, pendingOrders: pendingCount }));
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon">❌</div>
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Try Again
          </button>
          <Link to="/" className="home-link">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Elite Aquarium</title>
      </Helmet>

      <div className="admin-dashboard">
        {/* Notification Bell */}
        <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
          <span className="bell-icon">🔔</span>
          {stats.pendingOrders > 0 && (
            <span className="notification-badge">{stats.pendingOrders}</span>
          )}
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                <button onClick={() => setShowNotifications(false)}>✕</button>
              </div>
              <div className="notification-list">
                {stats.pendingOrders > 0 ? (
                  <>
                    <div className="notification-item urgent">
                      <span className="notification-icon">🛒</span>
                      <div className="notification-content">
                        <strong>{stats.pendingOrders} New Order{stats.pendingOrders > 1 ? 's' : ''}</strong>
                        <p>Pending processing</p>
                      </div>
                      <Link to="/admin/orders" className="notification-link" onClick={() => setShowNotifications(false)}>View →</Link>
                    </div>
                    <div className="notification-divider"></div>
                  </>
                ) : (
                  <div className="notification-item no-notifications">
                    <span>✅ No pending orders</span>
                  </div>
                )}
                {stats.lowStockProducts > 0 && (
                  <div className="notification-item warning">
                    <span className="notification-icon">⚠️</span>
                    <div className="notification-content">
                      <strong>Low Stock Alert</strong>
                      <p>{stats.lowStockProducts} product{stats.lowStockProducts > 1 ? 's are' : ' is'} running low</p>
                    </div>
                    <Link to="/admin/products?filter=lowstock" className="notification-link" onClick={() => setShowNotifications(false)}>Check →</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name || 'Admin'}!</h1>
            <p>Here's what's happening with your store today.</p>
          </div>
          <div className="header-actions">
            <Link to="/admin/products/add" className="btn-primary">
              {stats.pendingOrders > 0 && <span className="btn-badge">{stats.pendingOrders}</span>}
              + Add New Product
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">👥</div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <p className="stat-value">{stats.totalUsers}</p>
              <Link to="/admin/users" className="stat-link">View All →</Link>
            </div>
          </div>

          <div className="stat-card orders-card">
            <div className="stat-icon orders">📦</div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <p className="stat-value">{stats.totalOrders}</p>
              {stats.pendingOrders > 0 && (
                <span className="pending-badge">{stats.pendingOrders} Pending</span>
              )}
              <Link to="/admin/orders" className="stat-link">View All →</Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon products">🛍️</div>
            <div className="stat-content">
              <h3>Products</h3>
              <p className="stat-value">{stats.totalProducts}</p>
              <Link to="/admin/products" className="stat-link">Manage →</Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">💰</div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p className="stat-value">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
              <span className="stat-note">Lifetime sales</span>
            </div>
          </div>
        </div>

        {/* Pending Orders Alert */}
        {stats.pendingOrders > 0 && (
          <div className="alert-card urgent">
            <div className="alert-icon">🛒</div>
            <div className="alert-content">
              <h3>New Orders Pending!</h3>
              <p>You have {stats.pendingOrders} order{stats.pendingOrders > 1 ? 's' : ''} waiting for processing.</p>
              <Link to="/admin/orders?status=Processing" className="alert-link">
                Review Orders Now →
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/admin/products" className="action-card">
              <span className="action-icon">📦</span>
              <h3>Manage Products</h3>
              <p>Add, edit, or delete products</p>
            </Link>
            <Link to="/admin/orders" className="action-card">
              <span className="action-icon">📋</span>
              <h3>Manage Orders</h3>
              <p>View and update order status</p>
              {stats.pendingOrders > 0 && (
                <span className="action-badge">{stats.pendingOrders} New</span>
              )}
            </Link>
            <Link to="/admin/users" className="action-card">
              <span className="action-icon">👥</span>
              <h3>Manage Users</h3>
              <p>View all registered users</p>
            </Link>
            <Link to="/products" className="action-card">
              <span className="action-icon">🔍</span>
              <h3>View Store</h3>
              <p>See how your store looks</p>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="view-all">View All →</Link>
          </div>
          
          <div className="orders-table-container">
            {recentOrders.length > 0 ? (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id} className={order.orderStatus === 'Processing' ? 'pending-row' : ''}>
                      <td className="order-id">#{order._id?.slice(-6) || 'N/A'}</td>
                      <td className="customer-cell">
                        <div className="customer-info">
                          <strong>{order.user?.name || 'Guest'}</strong>
                          <small>{order.user?.email || 'No email'}</small>
                        </div>
                       </td>
                      <td className="date-cell">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="order-total">₹{(order.totalAmount || 0).toLocaleString()}</td>
                      <td className="status-cell">
                        <span className={`status-badge status-${order.orderStatus?.toLowerCase() || 'pending'}`}>
                          {order.orderStatus === 'Processing' && '🔄 '}
                          {order.orderStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="payment-cell">{order.paymentMethod || 'COD'}</td>
                      <td className="action-cell">
                        <Link to={`/admin/orders/${order._id}`} className="view-btn">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">No orders found</div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        {stats.lowStockProducts > 0 && (
          <div className="alert-card warning">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <h3>Low Stock Alert</h3>
              <p>You have {stats.lowStockProducts} products running low on stock.</p>
              <Link to="/admin/products?filter=lowstock" className="alert-link">
                Review Now →
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 30px;
          position: relative;
        }

        /* Notification Bell */
        .notification-bell {
          position: fixed;
          top: 90px;
          right: 30px;
          cursor: pointer;
          z-index: 100;
          background: white;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: all 0.3s;
        }

        .notification-bell:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }

        .bell-icon {
          font-size: 22px;
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4757;
          color: white;
          font-size: 11px;
          font-weight: 600;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .notification-dropdown {
          position: absolute;
          top: 50px;
          right: 0;
          width: 320px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          z-index: 1000;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .notification-header h4 {
          font-size: 16px;
          color: #333;
          margin: 0;
        }

        .notification-header button {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #999;
        }

        .notification-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          transition: background 0.3s;
        }

        .notification-item:hover {
          background: #f8f9fa;
        }

        .notification-item.urgent {
          background: #fff3cd;
          border-left: 3px solid #ffc107;
        }

        .notification-item.warning {
          background: #f8d7da;
          border-left: 3px solid #dc3545;
        }

        .notification-icon {
          font-size: 24px;
        }

        .notification-content {
          flex: 1;
        }

        .notification-content strong {
          display: block;
          font-size: 14px;
          color: #333;
        }

        .notification-content p {
          font-size: 12px;
          color: #666;
          margin: 0;
        }

        .notification-link {
          color: #667eea;
          text-decoration: none;
          font-size: 13px;
        }

        .notification-divider {
          height: 1px;
          background: #f0f0f0;
        }

        .no-notifications {
          text-align: center;
          color: #999;
          padding: 20px;
        }

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
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          max-width: 400px;
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
          margin-bottom: 20px;
        }

        .retry-btn {
          padding: 10px 30px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          margin-right: 10px;
        }

        .home-link {
          color: #667eea;
          text-decoration: none;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .dashboard-header h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 5px;
        }

        .dashboard-header p {
          color: #666;
        }

        .btn-primary {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          position: relative;
        }

        .btn-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff4757;
          color: white;
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 20px;
          transition: transform 0.3s, box-shadow 0.3s;
          position: relative;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .stat-card.orders-card {
          position: relative;
        }

        .pending-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff4757;
          color: white;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          color: white;
        }

        .stat-icon.users { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .stat-icon.orders { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .stat-icon.products { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .stat-icon.revenue { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

        .stat-content h3 {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin-bottom: 5px;
        }

        .stat-link {
          color: #667eea;
          text-decoration: none;
          font-size: 13px;
        }

        .alert-card {
          margin-bottom: 30px;
          padding: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 20px;
          animation: slideIn 0.5s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .alert-card.urgent {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          border-left: 4px solid #ffc107;
        }

        .alert-card.warning {
          background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
          border-left: 4px solid #dc3545;
        }

        .alert-icon {
          font-size: 40px;
        }

        .alert-content h3 {
          font-size: 18px;
          margin-bottom: 5px;
        }

        .alert-content p {
          color: #666;
          margin-bottom: 10px;
        }

        .alert-link {
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
        }

        .quick-actions {
          margin-bottom: 40px;
        }

        .quick-actions h2 {
          font-size: 20px;
          margin-bottom: 20px;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .action-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: all 0.3s;
          text-align: center;
          position: relative;
        }

        .action-card:hover {
          transform: translateY(-5px);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .action-icon {
          font-size: 40px;
          margin-bottom: 10px;
          display: block;
        }

        .action-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff4757;
          color: white;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .recent-orders {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .view-all {
          color: #667eea;
          text-decoration: none;
        }

        .orders-table-container {
          overflow-x: auto;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
        }

        .orders-table th {
          text-align: left;
          padding: 15px;
          background: #f8f9fa;
          color: #555;
          font-weight: 600;
          border-bottom: 2px solid #dee2e6;
        }

        .orders-table td {
          padding: 15px;
          border-bottom: 1px solid #eee;
        }

        .orders-table .pending-row {
          background: #fff3cd;
          animation: highlightRow 1s ease-in-out;
        }

        @keyframes highlightRow {
          0% { background: #ffeaa7; }
          100% { background: #fff3cd; }
        }

        .order-id {
          font-weight: 600;
          color: #333;
        }

        .order-total {
          font-weight: 600;
          color: #28a745;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
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

        .view-btn {
          display: inline-block;
          padding: 4px 12px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 12px;
        }

        .no-data {
          text-align: center;
          color: #999;
          padding: 40px;
        }

        @media (max-width: 768px) {
          .admin-dashboard {
            padding: 20px;
          }
          
          .notification-bell {
            top: 80px;
            right: 20px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default AdminDashboard;