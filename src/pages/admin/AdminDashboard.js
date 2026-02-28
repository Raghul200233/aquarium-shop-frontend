import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';

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
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      console.log('Fetching admin dashboard data...'); // Debug log
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats`);
      console.log('Dashboard response:', response.data); // Debug log
      
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
        <title>Admin Dashboard - AquaWorld</title>
      </Helmet>

      <div className="admin-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name || 'Admin'}!</h1>
            <p>Here's what's happening with your store today.</p>
          </div>
          <div className="header-actions">
            <Link to="/admin/products/new" className="btn-primary">
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

          <div className="stat-card">
            <div className="stat-icon orders">📦</div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <p className="stat-value">{stats.totalOrders}</p>
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
                    <tr key={order._id}>
                      <td>#{order._id?.slice(-6) || 'N/A'}</td>
                      <td>
                        <div className="customer-info">
                          <strong>{order.user?.name || 'Guest'}</strong>
                          <small>{order.user?.email || 'No email'}</small>
                        </div>
                      </td>
                      <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="order-total">₹{(order.totalAmount || 0).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge status-${order.orderStatus?.toLowerCase() || 'pending'}`}>
                          {order.orderStatus || 'Pending'}
                        </span>
                      </td>
                      <td>{order.paymentMethod || 'COD'}</td>
                      <td>
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

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-pending { background: #fff3cd; color: #856404; }
        .status-processing { background: #cce5ff; color: #004085; }
        .status-delivered { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }

        .view-btn {
          padding: 4px 12px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 12px;
        }

        .alert-card.warning {
          margin-top: 30px;
          padding: 20px;
          background: #fff3cd;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .admin-dashboard { padding: 20px; }
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

export default AdminDashboard;