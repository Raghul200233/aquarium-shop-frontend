import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-users-container">
      <h1>Manage Users</h1>
      <p className="user-count">Total Users: {users.length}</p>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>City</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.address?.city || 'N/A'}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="view-details-btn"
                    onClick={() => setSelectedUser(user)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="close-btn" onClick={() => setSelectedUser(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Name:</label>
                <span>{selectedUser.name}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <label>Phone:</label>
                <span>{selectedUser.phone}</span>
              </div>
              <div className="detail-row">
                <label>Role:</label>
                <span className={`role-badge role-${selectedUser.role}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="detail-row">
                <label>Address:</label>
                <span>
                  {selectedUser.address?.street},<br />
                  {selectedUser.address?.city}, {selectedUser.address?.state}<br />
                  {selectedUser.address?.pincode}<br />
                  {selectedUser.address?.country}
                </span>
              </div>
              <div className="detail-row">
                <label>Registered:</label>
                <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-users-container {
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .admin-users-container h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 10px;
        }

        .user-count {
          color: #666;
          margin-bottom: 20px;
          font-size: 16px;
        }

        .users-table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .users-table th {
          background: #f8f9fa;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          color: #555;
          border-bottom: 2px solid #dee2e6;
        }

        .users-table td {
          padding: 15px;
          border-bottom: 1px solid #eee;
          color: #666;
        }

        .users-table tr:hover {
          background-color: #f8f9fa;
        }

        .role-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .role-admin {
          background: #dc3545;
          color: white;
        }

        .role-user {
          background: #28a745;
          color: white;
        }

        .view-details-btn {
          padding: 5px 10px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.3s;
        }

        .view-details-btn:hover {
          background: #5a67d8;
        }

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
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .close-btn:hover {
          color: #333;
        }

        .modal-body {
          padding: 20px;
        }

        .detail-row {
          margin-bottom: 15px;
          display: flex;
          flex-wrap: wrap;
        }

        .detail-row label {
          font-weight: 600;
          color: #555;
          width: 100px;
          flex-shrink: 0;
        }

        .detail-row span {
          color: #666;
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;