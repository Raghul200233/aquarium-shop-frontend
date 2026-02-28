import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDebugInfo(null);
    
    console.log('Attempting login with:', { email, password });
    
    const result = await login(email, password);
    console.log('Login result:', result);
    
    if (result.success) {
      navigate('/');
    } else {
      setDebugInfo({
        attempted: { email, password },
        error: result.error,
        fullResponse: result
      });
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Login - Elite Aquarium</title>
      </Helmet>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your Elite Aquarium account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            {debugInfo && (
              <div className="debug-info">
                <h4>Debug Information:</h4>
                <p>Attempted: {debugInfo.attempted.email}</p>
                <p>Error: {debugInfo.error}</p>
                <pre>{JSON.stringify(debugInfo.fullResponse, null, 2)}</pre>
              </div>
            )}

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
          </div>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: calc(100vh - 64px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .login-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
          padding: 40px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-header h2 {
          font-size: 28px;
          color: #333;
          margin-bottom: 10px;
        }

        .login-header p {
          color: #666;
          font-size: 14px;
        }

        .login-form .form-group {
          margin-bottom: 20px;
        }

        .login-form label {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-weight: 500;
        }

        .login-form input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e1e1;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .login-form input:focus {
          outline: none;
          border-color: #667eea;
        }

        .debug-info {
          background: #f8f9fa;
          border: 1px solid #ffc107;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 20px;
          font-size: 12px;
          text-align: left;
        }

        .debug-info h4 {
          color: #856404;
          margin-bottom: 5px;
        }

        .debug-info pre {
          background: #fff;
          padding: 5px;
          border-radius: 4px;
          overflow: auto;
        }

        .login-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .login-button:hover {
          transform: translateY(-2px);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
        }

        .login-footer a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .login-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
};

export default LoginPage;