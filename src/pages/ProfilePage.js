import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Load user data into form
    setProfileData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || '',
        country: user.address?.country || 'India'
      }
    });

    fetchOrderHistory();
  }, [user, navigate]);

  const fetchOrderHistory = async () => {
    setOrdersLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders/my-orders`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load order history');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleProfileSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    console.log('Updating profile with data:', profileData);
    
    const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/profile`, profileData);
    
    console.log('Profile update response:', response.data);
    
    if (response.data.success) {
      toast.success('Profile updated successfully');
      setEditing(false);
      // Update local storage with new user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // You might want to update the auth context here as well
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 'Failed to update profile';
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>My Profile - Elite Aquarium</title>
      </Helmet>

      <div className="profile-page">
        <div className="profile-header">
          <div className="header-content">
            <h1>My Account</h1>
            <p>Welcome back, {user.name}!</p>
          </div>
          {user.role === 'admin' && (
            <Link to="/admin" className="admin-dashboard-btn">
              Go to Admin Dashboard
            </Link>
          )}
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile Information
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Order History
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 Security Settings
          </button>
        </div>

        <div className="profile-content">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="profile-info-card">
              <div className="card-header">
                <h2>Profile Information</h2>
                <button 
                  className="edit-toggle-btn"
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleProfileSubmit} className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                      disabled
                      className="disabled-input"
                    />
                    <small>Email cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      required
                      pattern="[0-9]{10}"
                    />
                  </div>

                  <h3>Address Information</h3>
                  
                  <div className="form-group">
                    <label>Street Address</label>
                    <input
                      type="text"
                      name="address.street"
                      value={profileData.address.street}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="address.city"
                        value={profileData.address.city}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        name="address.state"
                        value={profileData.address.state}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Pincode</label>
                      <input
                        type="text"
                        name="address.pincode"
                        value={profileData.address.pincode}
                        onChange={handleProfileChange}
                        required
                        pattern="[0-9]{6}"
                      />
                    </div>

                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        name="address.country"
                        value={profileData.address.country}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="save-btn"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-details">
                  <div className="detail-group">
                    <h3>Personal Information</h3>
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{user.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{user.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{user.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="detail-group">
                    <h3>Address</h3>
                    {user.address ? (
                      <>
                        <div className="detail-item">
                          <span className="detail-label">Street:</span>
                          <span className="detail-value">{user.address.street || 'Not provided'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">City:</span>
                          <span className="detail-value">{user.address.city || 'Not provided'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">State:</span>
                          <span className="detail-value">{user.address.state || 'Not provided'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Pincode:</span>
                          <span className="detail-value">{user.address.pincode || 'Not provided'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Country:</span>
                          <span className="detail-value">{user.address.country || 'India'}</span>
                        </div>
                      </>
                    ) : (
                      <p className="no-data">No address provided</p>
                    )}
                  </div>

                  <div className="detail-group">
                    <h3>Account Information</h3>
                    <div className="detail-item">
                      <span className="detail-label">Member since:</span>
                      <span className="detail-value">
                        {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Account type:</span>
                      <span className="detail-value role-badge">
                        {user.role === 'admin' ? 'Administrator' : 'Customer'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Order History Tab */}
          {activeTab === 'orders' && (
            <div className="orders-card">
              <h2>Order History</h2>
              
              {ordersLoading ? (
                <LoadingSpinner />
              ) : orders.length === 0 ? (
                <div className="no-orders">
                  <div className="no-orders-icon">📦</div>
                  <h3>No orders yet</h3>
                  <p>Looks like you haven't placed any orders yet.</p>
                  <Link to="/products" className="shop-now-btn">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                          <span className="order-date">{formatDate(order.createdAt)}</span>
                        </div>
                        <span className={`order-status ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus || 'Processing'}
                        </span>
                      </div>

                      <div className="order-items">
                        {order.items && order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <div className="item-details">
                              <span className="item-name">{item.name}</span>
                              <span className="item-quantity">x{item.quantity}</span>
                            </div>
                            <span className="item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-footer">
                        <div className="order-total">
                          <span>Total Amount:</span>
                          <span className="total-price">₹{order.totalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="order-actions">
                          <Link to={`/orders/${order._id}`} className="view-order-btn">
                            View Details
                          </Link>
                          {order.orderStatus === 'Delivered' && (
                            <button className="review-btn">Write Review</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Settings Tab */}
          {activeTab === 'security' && (
            <div className="security-card">
              <h2>Security Settings</h2>
              
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <h3>Change Password</h3>
                
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                    placeholder="Enter new password (min. 6 characters)"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                    placeholder="Confirm new password"
                  />
                </div>

                <button 
                  type="submit" 
                  className="change-password-btn"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>

              <div className="security-note">
                <h4>🔒 Security Tips</h4>
                <ul>
                  <li>Use a strong password with letters, numbers, and symbols</li>
                  <li>Never share your password with anyone</li>
                  <li>Change your password regularly</li>
                  <li>Log out from public computers</li>
                </ul>
              </div>

              <div className="logout-section">
                <button onClick={logout} className="logout-btn">
                  🚪 Logout from Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }

        .profile-header h1 {
          font-size: 32px;
          color: #333;
          margin-bottom: 5px;
        }

        .profile-header p {
          color: #666;
          font-size: 16px;
        }

        .admin-dashboard-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .admin-dashboard-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .profile-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
        }

        .tab-btn {
          padding: 10px 20px;
          background: none;
          border: none;
          font-size: 16px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        }

        .tab-btn:hover {
          color: #667eea;
        }

        .tab-btn.active {
          color: #667eea;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 3px 3px 0 0;
        }

        .profile-content {
          min-height: 500px;
        }

        /* Profile Info Card */
        .profile-info-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .card-header h2 {
          font-size: 20px;
          color: #333;
        }

        .edit-toggle-btn {
          padding: 8px 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }

        .edit-toggle-btn:hover {
          background: #5a67d8;
        }

        .profile-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .detail-group h3 {
          font-size: 16px;
          color: #555;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 2px solid #f0f0f0;
        }

        .detail-item {
          margin-bottom: 10px;
          display: flex;
        }

        .detail-label {
          width: 100px;
          color: #666;
          font-weight: 500;
        }

        .detail-value {
          color: #333;
          flex: 1;
        }

        .role-badge {
          display: inline-block;
          padding: 4px 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Profile Form */
        .profile-form {
          max-width: 600px;
        }

        .profile-form h3 {
          font-size: 16px;
          color: #555;
          margin: 20px 0 15px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: #555;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 2px solid #e1e1e1;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .disabled-input {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .form-group small {
          color: #999;
          font-size: 12px;
          margin-top: 5px;
          display: block;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .cancel-btn {
          padding: 10px 24px;
          background: #f8f9fa;
          color: #666;
          border: 2px solid #e1e1e1;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .save-btn {
          padding: 10px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        /* Orders Card */
        .orders-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .orders-card h2 {
          font-size: 20px;
          color: #333;
          margin-bottom: 20px;
        }

        .no-orders {
          text-align: center;
          padding: 60px 20px;
        }

        .no-orders-icon {
          font-size: 60px;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .no-orders h3 {
          font-size: 20px;
          color: #333;
          margin-bottom: 10px;
        }

        .no-orders p {
          color: #666;
          margin-bottom: 20px;
        }

        .shop-now-btn {
          display: inline-block;
          padding: 12px 30px;
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

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .order-card {
          border: 2px solid #f0f0f0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.3s;
        }

        .order-card:hover {
          border-color: #667eea;
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
        }

        .order-info h3 {
          font-size: 16px;
          color: #333;
          margin-bottom: 5px;
        }

        .order-date {
          color: #666;
          font-size: 13px;
        }

        .order-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
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
          margin-bottom: 15px;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px dashed #f0f0f0;
        }

        .item-details {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .item-name {
          font-weight: 500;
          color: #333;
        }

        .item-quantity {
          color: #666;
          font-size: 13px;
        }

        .item-price {
          font-weight: 600;
          color: #667eea;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #f0f0f0;
        }

        .order-total {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .order-total span {
          color: #666;
        }

        .total-price {
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
        }

        .order-actions {
          display: flex;
          gap: 10px;
        }

        .view-order-btn {
          padding: 6px 12px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 13px;
          transition: all 0.3s;
        }

        .view-order-btn:hover {
          background: #5a67d8;
        }

        .review-btn {
          padding: 6px 12px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
        }

        /* Security Card */
        .security-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .security-card h2 {
          font-size: 20px;
          color: #333;
          margin-bottom: 20px;
        }

        .password-form {
          max-width: 500px;
          margin-bottom: 30px;
          padding-bottom: 30px;
          border-bottom: 2px solid #f0f0f0;
        }

        .password-form h3 {
          font-size: 16px;
          color: #555;
          margin-bottom: 15px;
        }

        .change-password-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .change-password-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .security-note {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .security-note h4 {
          font-size: 16px;
          color: #333;
          margin-bottom: 10px;
        }

        .security-note ul {
          list-style: none;
          padding: 0;
        }

        .security-note li {
          color: #666;
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }

        .security-note li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #28a745;
        }

        .logout-section {
          text-align: center;
        }

        .logout-btn {
          padding: 12px 40px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .logout-btn:hover {
          background: #c82333;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(220, 53, 69, 0.3);
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .profile-tabs {
            flex-direction: column;
          }

          .tab-btn {
            width: 100%;
            text-align: left;
          }

          .tab-btn.active::after {
            display: none;
          }

          .profile-details {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .order-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .order-footer {
            flex-direction: column;
            gap: 15px;
          }

          .order-actions {
            width: 100%;
          }

          .view-order-btn {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
};

export default ProfilePage;