import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [_imageFile, setImageFile] = useState(null); // eslint-disable-line no-unused-vars
  const [imagePreview, setImagePreview] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  useAuth();

  const categories = [
    'Fish Medicines',
    'Aquarium Tanks',
    'Filters',
    'Heaters',
    'Fish Foods',
    'Aquarium Lights',
    'Planted Tank Lights',
    'Live Fishes',
    'Aquarium Accessories',
    'Aquarium Stones and Sands'
  ];

  const [formData, setFormData] = useState({
    name: '',
    category: 'Fish Foods',
    description: '',
    price: '',
    stock: '',
    isFeatured: false,
    images: [{ url: '', alt: '' }]
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products?limit=1000`);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Create a URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);

        // Store the image as a data URL in the form
        setFormData(prev => ({
          ...prev,
          images: [{ url: reader.result, alt: prev.name }]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Fish Foods',
      description: '',
      price: '',
      stock: '',
      isFeatured: false,
      images: [{ url: '', alt: '' }]
    });
    setImageFile(null);
    setImagePreview('');
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      stock: product.stock,
      isFeatured: product.isFeatured || false,
      images: product.images
    });
    if (product.images && product.images[0]) {
      setImagePreview(product.images[0].url);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form
      if (!formData.name || !formData.price || !formData.stock) {
        toast.error('Please fill all required fields');
        return;
      }

      // Prepare product data
      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        createdAt: new Date().toISOString()
      };

      // Make sure images array is properly formatted
      if (!productData.images || !productData.images[0] || !productData.images[0].url) {
        productData.images = [{ url: '/assets/placeholders/no-image.jpg', alt: productData.name }];
      }

      if (editingProduct) {
        // Update existing product
        await axios.put(`${process.env.REACT_APP_API_URL}/api/products/${editingProduct._id}`, productData);
        toast.success('Product updated successfully');
      } else {
        // Create new product
        await axios.post(`${process.env.REACT_APP_API_URL}/api/products`, productData);
        toast.success('Product added successfully');
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product: ' + (error.response?.data?.message || error.message));
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>Manage Products - Admin Dashboard</title>
      </Helmet>

      <div className="admin-products">
        <div className="products-header">
          <div>
            <h1>Manage Products</h1>
            <p className="product-count">Total Products: {products.length}</p>
          </div>
          <button
            className="add-product-btn"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <span className="btn-icon">+</span>
            Add New Product
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Products Table */}
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.images?.[0]?.url || '/assets/placeholders/no-image.jpg'}
                        alt={product.name}
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.src = '/assets/placeholders/no-image.jpg';
                        }}
                      />
                    </td>
                    <td className="product-name-cell">{product.name}</td>
                    <td>{product.category}</td>
                    <td className="price-cell">₹{product.price}</td>
                    <td>
                      <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      {product.isFeatured ? (
                        <span className="featured-badge">★ Featured</span>
                      ) : (
                        <span className="not-featured">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${product.stock > 0 ? 'active' : 'inactive'}`}>
                        {product.stock > 0 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEdit(product)}
                        className="edit-btn"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="delete-btn"
                        title="Delete"
                      >
                        🗑️
                      </button>
                      <Link
                        to={`/product/${product._id}`}
                        className="view-btn"
                        title="View"
                        target="_blank"
                      >
                        👁️
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Product Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
              </div>

              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-grid">
                  {/* Product Name */}
                  <div className="form-group full-width">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter product name"
                    />
                  </div>

                  {/* Category */}
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="1"
                      placeholder="Enter price"
                    />
                  </div>

                  {/* Stock */}
                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="Enter stock quantity"
                    />
                  </div>

                  {/* Featured Checkbox */}
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                      />
                      <span>Mark as Featured Product</span>
                    </label>
                  </div>

                  {/* Image Upload */}
                  <div className="form-group full-width">
                    <label>Product Image</label>
                    <div className="image-upload-container">
                      {imagePreview ? (
                        <div className="image-preview">
                          <img src={imagePreview} alt="Preview" />
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => {
                              setImagePreview('');
                              setImageFile(null);
                              setFormData(prev => ({
                                ...prev,
                                images: [{ url: '', alt: '' }]
                              }));
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="file-input"
                          />
                          <label htmlFor="image-upload" className="upload-label">
                            <span className="upload-icon">📸</span>
                            <span>Click to upload image</span>
                            <span className="upload-hint">PNG, JPG, WEBP up to 5MB</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="form-group full-width">
                    <label>Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows="4"
                      placeholder="Enter product description"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-products {
          padding: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .products-header h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 5px;
        }

        .product-count {
          color: #666;
          font-size: 14px;
        }

        .add-product-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .add-product-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-icon {
          font-size: 20px;
          font-weight: 400;
        }

        .filters-bar {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }

        .search-box {
          flex: 1;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 12px 20px 12px 45px;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s;
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

        .category-filter {
          padding: 12px 20px;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          font-size: 14px;
          min-width: 200px;
        }

        .products-table-container {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }

        .products-table th {
          background: #f8f9fa;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          color: #555;
          border-bottom: 2px solid #dee2e6;
        }

        .products-table td {
          padding: 15px;
          border-bottom: 1px solid #eee;
          vertical-align: middle;
        }

        .product-thumbnail {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 5px;
        }

        .product-name-cell {
          font-weight: 500;
          color: #333;
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .price-cell {
          font-weight: 600;
          color: #667eea;
        }

        .stock-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .in-stock {
          background: #d4edda;
          color: #155724;
        }

        .out-of-stock {
          background: #f8d7da;
          color: #721c24;
        }

        .featured-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .status-badge.active {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.inactive {
          background: #f8d7da;
          color: #721c24;
        }

        .actions-cell {
          display: flex;
          gap: 8px;
        }

        .edit-btn, .delete-btn, .view-btn {
          padding: 6px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 16px;
          background: #f8f9fa;
        }

        .edit-btn:hover {
          background: #667eea;
          color: white;
          transform: scale(1.1);
        }

        .delete-btn:hover {
          background: #ff6b6b;
          color: white;
          transform: scale(1.1);
        }

        .view-btn:hover {
          background: #28a745;
          color: white;
          transform: scale(1.1);
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
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 10px;
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
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
          z-index: 10;
        }

        .modal-header h2 {
          font-size: 20px;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          transition: color 0.3s;
        }

        .close-btn:hover {
          color: #ff6b6b;
        }

        .product-form {
          padding: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 2px solid #e1e1e1;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .checkbox-label input {
          width: auto;
        }

        /* Image Upload */
        .image-upload-container {
          border: 2px dashed #e1e1e1;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }

        .image-preview {
          position: relative;
          display: inline-block;
        }

        .image-preview img {
          max-width: 200px;
          max-height: 200px;
          border-radius: 8px;
        }

        .remove-image {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 30px;
          height: 30px;
          background: #ff6b6b;
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: transform 0.3s;
        }

        .remove-image:hover {
          transform: scale(1.1);
        }

        .upload-placeholder {
          padding: 20px;
        }

        .file-input {
          display: none;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .upload-icon {
          font-size: 40px;
        }

        .upload-hint {
          font-size: 12px;
          color: #999;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #f0f0f0;
        }

        .cancel-btn {
          padding: 10px 24px;
          background: #f8f9fa;
          color: #666;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .cancel-btn:hover {
          background: #e1e1e1;
        }

        .submit-btn {
          padding: 10px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 768px) {
          .admin-products {
            padding: 20px;
          }

          .products-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .filters-bar {
            flex-direction: column;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default AdminProducts;