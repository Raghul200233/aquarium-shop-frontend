import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: 'createdAt:desc'
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 50,
        ...filters
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/products?${params}`
      );

      setProducts(response.data.products);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products?limit=100`);
      const uniqueCategories = [...new Set(response.data.products.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change

    // Update URL params
    const params = new URLSearchParams();
    if (value) params.set(key, value);
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>Products - AquaWorld</title>
        <meta name="description" content="Browse our wide selection of aquarium products including fish medicines, tanks, filters, and more." />
      </Helmet>

      <div className="products-page">
        {/* Header Section */}
        <div className="products-header">
          <h1>Our Products</h1>
          <p>Discover our wide range of aquarium products</p>
        </div>

        <div className="products-container">
          {/* Filters Sidebar - Desktop */}
          <div className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filter-header">
              <h3>Filters</h3>
              <button className="close-filters" onClick={() => setShowFilters(false)}>×</button>
            </div>

            <div className="filter-section">
              <h4>Categories</h4>
              <div className="category-list">
                <button
                  className={`category-btn ${!filters.category ? 'active' : ''}`}
                  onClick={() => handleFilterChange('category', '')}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`category-btn ${filters.category === cat ? 'active' : ''}`}
                    onClick={() => handleFilterChange('category', cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Sort By</h4>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="sort-select"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="rating:desc">Top Rated</option>
              </select>
            </div>

            <div className="filter-section">
              <h4>Search</h4>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="search-input"
              />
            </div>

            <button
              className="apply-filters-btn"
              onClick={() => fetchProducts()}
            >
              Apply Filters
            </button>
          </div>

          {/* Main Content */}
          <div className="products-content">
            {/* Mobile Filter Button */}
            <div className="mobile-filter-bar">
              <button
                className="filter-toggle"
                onClick={() => setShowFilters(true)}
              >
                <span className="filter-icon">🔍</span>
                Show Filters
              </button>
              <div className="results-count">
                {products.length} products found
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <LoadingSpinner />
            ) : products.length === 0 ? (
              <div className="no-products">
                <div className="no-products-icon">🔍</div>
                <h3>No Products Found</h3>
                <p>Try adjusting your search or filter to find what you're looking for.</p>
                <button
                  className="clear-filters-btn"
                  onClick={() => {
                    setFilters({ category: '', search: '', sort: 'createdAt:desc' });
                    setCurrentPage(1);
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="page-btn prev"
                    >
                      ← Previous
                    </button>

                    <div className="page-numbers">
                      {[...Array(totalPages).keys()].map(num => (
                        <button
                          key={num + 1}
                          onClick={() => handlePageChange(num + 1)}
                          className={`page-number ${currentPage === num + 1 ? 'active' : ''}`}
                        >
                          {num + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="page-btn next"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .products-page {
          min-height: calc(100vh - 200px);
          background: #f5f5f5;
        }

        .products-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          padding: 60px 20px;
        }

        .products-header h1 {
          font-size: 36px;
          margin-bottom: 10px;
        }

        .products-header p {
          font-size: 18px;
          opacity: 0.9;
        }

        .products-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 30px;
        }

        /* Filters Sidebar */
        .filters-sidebar {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .filter-header h3 {
          font-size: 18px;
          color: #333;
        }

        .close-filters {
          display: none;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .filter-section {
          margin-bottom: 25px;
        }

        .filter-section h4 {
          font-size: 15px;
          color: #555;
          margin-bottom: 12px;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-btn {
          padding: 10px 12px;
          background: none;
          border: none;
          text-align: left;
          color: #666;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.3s;
          font-size: 14px;
        }

        .category-btn:hover {
          background: #f0f0f0;
          color: #667eea;
        }

        .category-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .sort-select {
          width: 100%;
          padding: 10px;
          border: 2px solid #e1e1e1;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s;
        }

        .sort-select:focus {
          border-color: #667eea;
        }

        .search-input {
          width: 100%;
          padding: 10px;
          border: 2px solid #e1e1e1;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s;
        }

        .search-input:focus {
          border-color: #667eea;
        }

        .apply-filters-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s;
          margin-top: 10px;
        }

        .apply-filters-btn:hover {
          transform: translateY(-2px);
        }

        /* Products Content */
        .products-content {
          flex: 1;
        }

        .mobile-filter-bar {
          display: none;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 15px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f8f9fa;
          border: 2px solid #e1e1e1;
          border-radius: 6px;
          color: #333;
          font-weight: 500;
          cursor: pointer;
        }

        .results-count {
          color: #666;
          font-size: 14px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        /* No Products */
        .no-products {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .no-products-icon {
          font-size: 60px;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .no-products h3 {
          font-size: 20px;
          color: #333;
          margin-bottom: 10px;
        }

        .no-products p {
          color: #666;
          margin-bottom: 20px;
        }

        .clear-filters-btn {
          padding: 10px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.3s;
        }

        .clear-filters-btn:hover {
          transform: translateY(-2px);
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 40px;
        }

        .page-btn {
          padding: 8px 16px;
          background: white;
          border: 2px solid #e1e1e1;
          border-radius: 6px;
          color: #333;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .page-btn:hover:not(:disabled) {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-numbers {
          display: flex;
          gap: 8px;
        }

        .page-number {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 2px solid #e1e1e1;
          border-radius: 6px;
          color: #333;
          cursor: pointer;
          transition: all 0.3s;
        }

        .page-number:hover {
          background: #f0f0f0;
        }

        .page-number.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .products-container {
            grid-template-columns: 1fr;
          }

          .filters-sidebar {
            position: fixed;
            top: 0;
            left: -100%;
            width: 80%;
            max-width: 300px;
            height: 100vh;
            z-index: 1000;
            border-radius: 0;
            overflow-y: auto;
            transition: left 0.3s ease;
          }

          .filters-sidebar.show {
            left: 0;
          }

          .filter-header {
            display: flex;
          }

          .close-filters {
            display: block;
          }

          .mobile-filter-bar {
            display: flex;
          }
        }

        @media (max-width: 768px) {
          .products-header {
            padding: 40px 20px;
          }

          .products-header h1 {
            font-size: 28px;
          }

          .products-header p {
            font-size: 16px;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .pagination {
            flex-wrap: wrap;
            gap: 10px;
          }

          .page-numbers {
            order: -1;
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default ProductsPage;