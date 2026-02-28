import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import axios from 'axios';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  const dropdownRef = useRef(null);
  const categoriesRef = useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`);
      const uniqueCategories = [...new Set(response.data.products.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowCategories(false);
      setMobileMenuOpen(false);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
    setShowCategories(false);
    setMobileMenuOpen(false);
    setMobileCategoriesOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileCategoriesOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-main">
        <div className="nav-container">

          {/* Logo */}
          <Link to="/" className="logo-link" onClick={closeMobileMenu}>
            <span className="logo-text">Elite Aquarium</span>
            <span className="logo-icon">🐠</span>
          </Link>

          {/* Desktop: Center nav links */}
          <div className="nav-links-desktop">
            <Link to="/" className="nav-link home-link">
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Home</span>
            </Link>

            {/* Categories Dropdown */}
            <div className="categories-dropdown" ref={categoriesRef}>
              <button
                className="nav-link categories-button"
                onClick={() => setShowCategories(!showCategories)}
              >
                <span className="nav-icon">📋</span>
                <span className="nav-label">Categories</span>
                <span className="dropdown-arrow">{showCategories ? '▲' : '▼'}</span>
              </button>

              {showCategories && (
                <div className="categories-menu">
                  <div className="categories-header">
                    <h3>All Categories</h3>
                    <Link to="/products" onClick={() => setShowCategories(false)}>View All →</Link>
                  </div>
                  <div className="categories-list">
                    {categories.map(category => (
                      <button
                        key={category}
                        className="category-item"
                        onClick={() => handleCategoryClick(category)}
                      >
                        <span className="category-icon">
                          {category === 'Fish Medicines' && '💊'}
                          {category === 'Aquarium Tanks' && '🏠'}
                          {category === 'Filters' && '⚙️'}
                          {category === 'Heaters' && '🔥'}
                          {category === 'Fish Foods' && '🍕'}
                          {category === 'Aquarium Lights' && '💡'}
                          {category === 'Planted Tank Lights' && '🌿'}
                          {category === 'Live Fishes' && '🐟'}
                          {category === 'Aquarium Accessories' && '🪸'}
                          {category === 'Aquarium Stones and Sands' && '🪨'}
                        </span>
                        <span className="category-name">{category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop: Search */}
          <div className="nav-center">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search for fish, medicines, tanks, filters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <span className="search-icon">🔍</span>
                <span className="search-text">Search</span>
              </button>
            </form>
          </div>

          {/* Desktop: Right section */}
          <div className="nav-right">
            <Link to="/cart" className="nav-link cart-link">
              <span className="nav-icon">🛒</span>
              <span className="nav-label">Cart</span>
              {getItemCount() > 0 && (
                <span className="cart-badge">{getItemCount()}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="user-menu" ref={dropdownRef}>
                <button
                  className="user-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className="user-avatar">👤</span>
                  <span className="user-name">{user?.name?.split(' ')[0]}</span>
                  <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
                </button>

                {showDropdown && (
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      👤 My Profile
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      📦 My Orders
                    </Link>

                    {user?.role === 'admin' && (
                      <>
                        <div className="dropdown-divider"></div>
                        <div className="dropdown-header">Admin Panel</div>
                        <Link to="/admin" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                          📊 Dashboard
                        </Link>
                        <Link to="/admin/products" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                          📦 Manage Products
                        </Link>
                        <Link to="/admin/orders" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                          📋 Manage Orders
                        </Link>
                        <Link to="/admin/users" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                          👥 Manage Users
                        </Link>
                      </>
                    )}

                    <div className="dropdown-divider"></div>
                    <button onClick={logout} className="dropdown-item logout-btn">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="login-link">Login</Link>
                <Link to="/register" className="register-link">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile: Right side — cart + hamburger */}
          <div className="mobile-right">
            <Link to="/cart" className="nav-link cart-link mobile-cart" onClick={closeMobileMenu}>
              <span className="nav-icon">🛒</span>
              {getItemCount() > 0 && (
                <span className="cart-badge">{getItemCount()}</span>
              )}
            </Link>

            <button
              className="hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`ham-line ${mobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`ham-line ${mobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`ham-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Mobile Drawer Menu */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Mobile Search */}
        <div className="mobile-search-wrap">
          <form onSubmit={handleSearch} className="mobile-search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-search-input"
            />
            <button type="submit" className="mobile-search-btn">🔍</button>
          </form>
        </div>

        {/* Mobile Nav Links */}
        <Link to="/" className="mobile-nav-item" onClick={closeMobileMenu}>
          🏠 Home
        </Link>

        {/* Mobile Categories accordion */}
        <div className="mobile-nav-item mobile-categories-toggle"
          onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
        >
          <span>📋 Categories</span>
          <span className="mobile-arrow">{mobileCategoriesOpen ? '▲' : '▼'}</span>
        </div>
        {mobileCategoriesOpen && (
          <div className="mobile-categories-list">
            <button className="mobile-category-item" onClick={() => { navigate('/products'); closeMobileMenu(); }}>
              🛍️ All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className="mobile-category-item"
                onClick={() => handleCategoryClick(cat)}
              >
                <span>
                  {cat === 'Fish Medicines' && '💊 '}
                  {cat === 'Aquarium Tanks' && '🏠 '}
                  {cat === 'Filters' && '⚙️ '}
                  {cat === 'Heaters' && '🔥 '}
                  {cat === 'Fish Foods' && '🍕 '}
                  {cat === 'Aquarium Lights' && '💡 '}
                  {cat === 'Planted Tank Lights' && '🌿 '}
                  {cat === 'Live Fishes' && '🐟 '}
                  {cat === 'Aquarium Accessories' && '🪸 '}
                  {cat === 'Aquarium Stones and Sands' && '🪨 '}
                  {cat}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="mobile-divider"></div>

        {isAuthenticated ? (
          <>
            <Link to="/profile" className="mobile-nav-item" onClick={closeMobileMenu}>👤 My Profile</Link>
            <Link to="/orders" className="mobile-nav-item" onClick={closeMobileMenu}>📦 My Orders</Link>
            {user?.role === 'admin' && (
              <>
                <div className="mobile-section-label">Admin Panel</div>
                <Link to="/admin" className="mobile-nav-item" onClick={closeMobileMenu}>📊 Dashboard</Link>
                <Link to="/admin/products" className="mobile-nav-item" onClick={closeMobileMenu}>📦 Manage Products</Link>
                <Link to="/admin/orders" className="mobile-nav-item" onClick={closeMobileMenu}>📋 Manage Orders</Link>
                <Link to="/admin/users" className="mobile-nav-item" onClick={closeMobileMenu}>👥 Manage Users</Link>
              </>
            )}
            <div className="mobile-divider"></div>
            <button className="mobile-nav-item mobile-logout" onClick={() => { logout(); closeMobileMenu(); }}>
              🚪 Logout
            </button>
          </>
        ) : (
          <div className="mobile-auth">
            <Link to="/login" className="mobile-login-btn" onClick={closeMobileMenu}>Login</Link>
            <Link to="/register" className="mobile-register-btn" onClick={closeMobileMenu}>Register</Link>
          </div>
        )}
      </div>

      <style>{`
        .navbar {
          background: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .navbar-main {
          background: white;
          padding: 15px 0;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 30px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        /* Logo */
        .logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .logo-text {
          font-size: 26px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }

        .logo-icon {
          font-size: 26px;
        }

        /* Desktop nav links (Home + Categories) */
        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .nav-link {
          text-decoration: none;
          color: #333;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.3s;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 15px;
          font-weight: 500;
        }

        .nav-link:hover {
          background: #f0f0f0;
          color: #667eea;
        }

        .nav-icon { font-size: 25px; }
        .nav-label { font-size: 20px; }

        .home-link {
          padding: 8px 16px;
          background: #f8f9fa;
        }

        /* Search */
        .nav-center {
          flex: 1;
          max-width: 600px;
        }

        .search-form {
          display: flex;
          width: 100%;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          border-radius: 50px;
          overflow: hidden;
          transition: box-shadow 0.3s;
        }

        .search-form:focus-within {
          box-shadow: 0 4px 20px rgba(102,126,234,0.3);
        }

        .search-input {
          flex: 1;
          padding: 12px 20px;
          border: 2px solid #e1e1e1;
          border-right: none;
          border-radius: 50px 0 0 50px;
          font-size: 18px;
          outline: none;
          transition: border-color 0.3s;
        }

        .search-input:focus { border-color: #667eea; }

        .search-button {
          padding: 12px 25px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 0 50px 50px 0;
          font-size: 22px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: opacity 0.3s;
          white-space: nowrap;
        }

        .search-button:hover { opacity: 0.9; }
        .search-icon { font-size: 16px; }
        .search-text { font-size: 14px; }

        /* Right Section */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-shrink: 0;
        }

        /* Categories Dropdown */
        .categories-dropdown { position: relative; }

        .categories-button {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f8f9fa;
        }

        .dropdown-arrow {
          font-size: 12px;
          margin-left: 4px;
        }

        .categories-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          min-width: 280px;
          margin-top: 10px;
          z-index: 1000;
          animation: slideDown 0.25s ease;
          overflow: hidden;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .categories-header {
          padding: 15px 20px;
          border-bottom: 2px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .categories-header h3 { font-size: 16px; color: #333; font-weight: 600; }
        .categories-header a { color: #667eea; text-decoration: none; font-size: 13px; font-weight: 600; }

        .categories-list { max-height: 350px; overflow-y: auto; padding: 10px; }

        .category-item {
          width: 100%;
          padding: 12px 15px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
          text-align: left;
        }

        .category-item:hover { background: #f0f0f0; transform: translateX(4px); }
        .category-icon { font-size: 22px; width: 28px; }
        .category-name { font-size: 20px; color: #333; font-weight: 500; }

        /* Cart */
        .cart-link { position: relative; }

        .cart-badge {
          position: absolute;
          top: 0; right: 0;
          background: #ff6b6b;
          color: white;
          font-size: 11px;
          font-weight: 600;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        /* User Menu */
        .user-menu { position: relative; }

        .user-button {
          background: #f8f9fa;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px 15px;
          border-radius: 30px;
          transition: all 0.3s;
          font-size: 20px;
          font-weight: 500;
        }

        .user-button:hover { background: #667eea; color: white; }
        .user-avatar { font-size: 20px; }
        .user-name { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .user-dropdown {
          position: absolute;
          top: 100%; right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          min-width: 220px;
          margin-top: 10px;
          z-index: 1000;
          animation: slideDown 0.25s ease;
          overflow: hidden;
        }

        .dropdown-header {
          padding: 12px 20px;
          font-size: 16px;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f8f9fa;
        }

        .dropdown-item {
          display: block;
          padding: 12px 20px;
          color: #333;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-size: 16px;
        }

        .dropdown-item:hover { background: #f0f0f0; color: #667eea; transform: translateX(4px); }
        .logout-btn:hover { background: #ff6b6b !important; color: white !important; }

        .dropdown-divider { height: 1px; background: #f0f0f0; margin: 5px 0; }

        /* Auth Links */
        .auth-links { display: flex; align-items: center; gap: 10px; }

        .login-link {
          text-decoration: none;
          color: #333;
          font-weight: 600;
          font-size: 20px;
          padding: 8px 15px;
          border-radius: 30px;
          transition: all 0.3s;
        }
        .login-link:hover { background: #f0f0f0; color: #667eea; }

        .register-link {
          text-decoration: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 8px 20px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 20px;
          transition: all 0.3s;
          white-space: nowrap;
        }
        .register-link:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102,126,234,0.3); }

        /* ── MOBILE ELEMENTS (hidden on desktop) ── */
        .mobile-right { display: none; }
        .mobile-cart { display: none; }
        .hamburger { display: none; }
        .mobile-overlay { display: none; }
        .mobile-drawer { display: none; }

        /* ── RESPONSIVE BREAKPOINTS ── */

        /* Tablet: 768px – 1024px: compact but still single row */
        @media (max-width: 1024px) and (min-width: 769px) {
          .nav-container { gap: 12px; padding: 0 20px; }
          .logo-text { font-size: 22px; }
          .nav-label { font-size: 13px; }
          .nav-center { max-width: 380px; }
          .search-input { padding: 10px 14px; font-size: 13px; }
          .search-button { padding: 10px 16px; font-size: 13px; }
          .search-text { display: none; }
          .login-link, .register-link { padding: 7px 12px; font-size: 13px; }
        }

        /* Mobile: ≤768px — hamburger drawer */
        @media (max-width: 768px) {
          .navbar-main { padding: 12px 0; }

          .nav-container {
            padding: 0 16px;
            justify-content: space-between;
            gap: 0;
          }

          /* Hide all desktop elements */
          .nav-links-desktop { display: none; }
          .nav-center { display: none; }
          .nav-right { display: none; }

          /* Show mobile elements */
          .mobile-right {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .mobile-cart {
            display: flex;
            position: relative;
          }

          .logo-text { font-size: 20px; }
          .logo-icon { font-size: 22px; }

          /* Hamburger button */
          .hamburger {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 5px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 6px;
            border-radius: 8px;
            transition: background 0.2s;
          }
          .hamburger:hover { background: #f0f0f0; }

          .ham-line {
            display: block;
            width: 24px;
            height: 2.5px;
            background: #333;
            border-radius: 2px;
            transition: all 0.3s;
            transform-origin: center;
          }

          .ham-line.open:nth-child(1) { transform: translateY(7.5px) rotate(45deg); }
          .ham-line.open:nth-child(2) { opacity: 0; transform: scaleX(0); }
          .ham-line.open:nth-child(3) { transform: translateY(-7.5px) rotate(-45deg); }

          /* Overlay */
          .mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            z-index: 1100;
            animation: fadeIn 0.25s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          /* Slide-in drawer */
          .mobile-drawer {
            display: block;
            position: fixed;
            top: 0; right: -100%;
            width: 82%;
            max-width: 320px;
            height: 100dvh;
            background: white;
            z-index: 1200;
            overflow-y: auto;
            transition: right 0.3s cubic-bezier(0.4,0,0.2,1);
            box-shadow: -4px 0 30px rgba(0,0,0,0.18);
            padding-bottom: 30px;
          }

          .mobile-drawer.open { right: 0; }

          /* Mobile search */
          .mobile-search-wrap {
            padding: 20px 16px 14px;
            border-bottom: 1px solid #f0f0f0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .mobile-search-form {
            display: flex;
            border-radius: 30px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }

          .mobile-search-input {
            flex: 1;
            padding: 10px 16px;
            border: none;
            outline: none;
            font-size: 14px;
          }

          .mobile-search-btn {
            padding: 10px 16px;
            background: white;
            border: none;
            font-size: 18px;
            cursor: pointer;
          }

          /* Mobile nav items */
          .mobile-nav-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px 20px;
            text-decoration: none;
            color: #333;
            font-size: 16px;
            font-weight: 500;
            border-bottom: 1px solid #f5f5f5;
            background: none;
            border-left: none;
            border-right: none;
            border-top: none;
            width: 100%;
            text-align: left;
            cursor: pointer;
            transition: background 0.2s, color 0.2s;
          }

          .mobile-nav-item:hover { background: #f8f0ff; color: #667eea; }

          .mobile-categories-toggle { cursor: pointer; }
          .mobile-arrow { font-size: 12px; color: #999; }

          .mobile-categories-list {
            background: #fafafa;
            border-bottom: 1px solid #f0f0f0;
          }

          .mobile-category-item {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            padding: 12px 30px;
            background: none;
            border: none;
            font-size: 20px;
            color: #555;
            border-bottom: 1px solid #f0f0f0;
            text-align: left;
            cursor: pointer;
            transition: background 0.2s, color 0.2s;
          }

          .mobile-category-item:hover { background: #f0ebff; color: #667eea; }

          .mobile-divider { height: 8px; background: #f5f5f5; }

          .mobile-section-label {
            padding: 10px 20px;
            font-size: 20px;
            font-weight: 700;
            color: #aaa;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            background: #f8f9fa;
          }

          .mobile-auth {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 20px 16px;
          }

          .mobile-login-btn {
            display: block;
            text-align: center;
            padding: 12px;
            border: 2px solid #667eea;
            border-radius: 30px;
            color: #667eea;
            font-weight: 600;
            text-decoration: none;
            font-size: 22px;
            transition: all 0.2s;
          }
          .mobile-login-btn:hover { background: #667eea; color: white; }

          .mobile-register-btn {
            display: block;
            text-align: center;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 30px;
            color: white;
            font-weight: 600;
            text-decoration: none;
            font-size: 20px;
            transition: opacity 0.2s;
          }
          .mobile-register-btn:hover { opacity: 0.9; }

          .mobile-logout { color: #ff6b6b !important; }
          .mobile-logout:hover { background: #fff0f0 !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;