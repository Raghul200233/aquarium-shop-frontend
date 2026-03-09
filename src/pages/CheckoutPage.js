import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    shippingAddress: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
      country: 'India'
    },
    phone: user?.phone || '',
    paymentMethod: 'RAZORPAY',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load Razorpay script
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0) {
      navigate('/cart');
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    }
  }, [cartItems, isAuthenticated, navigate]);

  const subtotal = getCartTotal();
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Address validation
    if (!formData.shippingAddress.street) {
      newErrors['address.street'] = 'Street address is required';
    }
    if (!formData.shippingAddress.city) {
      newErrors['address.city'] = 'City is required';
    }
    if (!formData.shippingAddress.state) {
      newErrors['address.state'] = 'State is required';
    }
    if (!formData.shippingAddress.pincode) {
      newErrors['address.pincode'] = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(formData.shippingAddress.pincode)) {
      newErrors['address.pincode'] = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  // Razorpay payment handler
  const handleRazorpayPayment = async () => {
    setLoading(true);

    try {
      // First create Razorpay order
      const orderResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders/create-order`,
        {
          amount: total,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const { orderId } = orderResponse.data;

      // Prepare order data for after payment
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product,
          quantity: Number(item.quantity),
          price: Number(item.price)
        })),
        shippingAddress: {
          street: String(formData.shippingAddress.street || ''),
          city: String(formData.shippingAddress.city || ''),
          state: String(formData.shippingAddress.state || ''),
          pincode: String(formData.shippingAddress.pincode || ''),
          country: String(formData.shippingAddress.country || 'India'),
          phone: String(formData.phone || '')
        },
        paymentMethod: String(formData.paymentMethod),
        notes: String(formData.notes || ''),
        subtotal: Number(subtotal),
        totalAmount: Number(total)
      };

      // Configure Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: 'INR',
        name: 'Elite Aquarium',
        description: `Payment for ${cartItems.length} items`,
        image: 'https://eliteaquariumandpetstore.com/logo.png',
        order_id: orderId,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post(
              `${process.env.REACT_APP_API_URL}/api/orders/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: total,
                products: orderData.items
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              }
            );

            if (verifyResponse.data.success) {
              // Create final order in database
              const orderResponse = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/orders`,
                orderData,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                }
              );

              if (orderResponse.data.success) {
                toast.success('Payment successful! Order placed.');
                clearCart();
                navigate(`/order-confirmation/${orderResponse.data.order._id}`);
              }
            }
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
          setLoading(false);
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: formData.phone
        },
        notes: {
          address: `${formData.shippingAddress.street}, ${formData.shippingAddress.city}, ${formData.shippingAddress.state} - ${formData.shippingAddress.pincode}`
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error('Payment cancelled');
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Handle payment failures
      razorpay.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  // COD payment handler
  const handleCODPayment = async () => {
    setLoading(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product,
          quantity: Number(item.quantity),
          price: Number(item.price)
        })),
        shippingAddress: {
          street: String(formData.shippingAddress.street || ''),
          city: String(formData.shippingAddress.city || ''),
          state: String(formData.shippingAddress.state || ''),
          pincode: String(formData.shippingAddress.pincode || ''),
          country: String(formData.shippingAddress.country || 'India'),
          phone: String(formData.phone || '')
        },
        paymentMethod: 'COD',
        notes: String(formData.notes || ''),
        subtotal: Number(subtotal),
        totalAmount: Number(total)
      };

      console.log('=== ORDER DATA DEBUG ===');
      console.log('Full orderData:', JSON.stringify(orderData, null, 2));
      console.log('First item:', orderData.items[0]);
      console.log('Price type:', typeof orderData.items[0]?.price);
      console.log('Price value:', orderData.items[0]?.price);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/order-confirmation/${response.data.order._id}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!validateStep1()) {
      setStep(1);
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.paymentMethod === 'RAZORPAY') {
      handleRazorpayPayment();
    } else {
      handleCODPayment();
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Elite Aquarium</title>
      </Helmet>

      <div className="checkout-page">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Shipping</span>
            </div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Review & Pay</span>
            </div>
          </div>
        </div>

        <div className="checkout-container">
          {/* Main Content */}
          <div className="checkout-main">
            {step === 1 && (
              <div className="shipping-form">
                <h2>Shipping Information</h2>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="address.street">Street Address *</label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={formData.shippingAddress.street}
                    onChange={handleInputChange}
                    placeholder="House number, street name"
                    className={errors['address.street'] ? 'error' : ''}
                  />
                  {errors['address.street'] && <span className="error-message">{errors['address.street']}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address.city">City *</label>
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={formData.shippingAddress.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className={errors['address.city'] ? 'error' : ''}
                    />
                    {errors['address.city'] && <span className="error-message">{errors['address.city']}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="address.state">State *</label>
                    <input
                      type="text"
                      id="address.state"
                      name="address.state"
                      value={formData.shippingAddress.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className={errors['address.state'] ? 'error' : ''}
                    />
                    {errors['address.state'] && <span className="error-message">{errors['address.state']}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address.pincode">Pincode *</label>
                    <input
                      type="text"
                      id="address.pincode"
                      name="address.pincode"
                      value={formData.shippingAddress.pincode}
                      onChange={handleInputChange}
                      placeholder="6-digit pincode"
                      maxLength="6"
                      className={errors['address.pincode'] ? 'error' : ''}
                    />
                    {errors['address.pincode'] && <span className="error-message">{errors['address.pincode']}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="address.country">Country</label>
                    <input
                      type="text"
                      id="address.country"
                      name="address.country"
                      value={formData.shippingAddress.country}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Order Notes (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for delivery?"
                    rows="3"
                  />
                </div>

                <div className="payment-method-section">
                  <h3>Payment Method</h3>
                  <div className="payment-options">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="RAZORPAY"
                        checked={formData.paymentMethod === 'RAZORPAY'}
                        onChange={handleInputChange}
                      />
                      <div className="payment-option-content">
                        <span className="payment-icon">💳</span>
                        <div>
                          <span className="payment-name">Razorpay</span>
                          <span className="payment-description">Credit/Debit Card, UPI, NetBanking, Wallet</span>
                        </div>
                      </div>
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={formData.paymentMethod === 'COD'}
                        onChange={handleInputChange}
                      />
                      <div className="payment-option-content">
                        <span className="payment-icon">💵</span>
                        <div>
                          <span className="payment-name">Cash on Delivery</span>
                          <span className="payment-description">Pay when you receive your order</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <Link to="/cart" className="back-btn">
                    ← Back to Cart
                  </Link>
                  <button onClick={handleNextStep} className="next-btn">
                    Continue to Review
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="review-section">
                <h2>Review Your Order</h2>

                <div className="review-card">
                  <h3>Shipping Address</h3>
                  <div className="review-content">
                    <p>{formData.shippingAddress.street}</p>
                    <p>{formData.shippingAddress.city}, {formData.shippingAddress.state} - {formData.shippingAddress.pincode}</p>
                    <p>{formData.shippingAddress.country}</p>
                    <p className="review-phone">Phone: {formData.phone}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="edit-btn">
                    Edit
                  </button>
                </div>

                <div className="review-card">
                  <h3>Payment Method</h3>
                  <div className="payment-method-display">
                    <span className="payment-icon">
                      {formData.paymentMethod === 'RAZORPAY' ? '💳' : '💵'}
                    </span>
                    <div>
                      <p className="payment-name">
                        {formData.paymentMethod === 'RAZORPAY' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}
                      </p>
                      <p className="payment-note">
                        {formData.paymentMethod === 'RAZORPAY' 
                          ? 'Pay via Card, UPI, NetBanking, or Wallet' 
                          : 'Pay with cash when your order arrives'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="review-card">
                  <h3>Items ({cartItems.length})</h3>
                  <div className="items-list">
                    {cartItems.map(item => (
                      <div key={item.product} className="review-item">
                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                        </div>
                        <span className="item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/cart" className="edit-link">
                    Edit Items
                  </Link>
                </div>

                <div className="form-actions">
                  <button onClick={handlePrevStep} className="back-btn">
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="place-order-btn"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 
                     formData.paymentMethod === 'RAZORPAY' ? 'Pay Now' : 'Place Order (COD)'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="checkout-sidebar">
            <div className="order-summary">
              <h3>Order Summary</h3>

              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item.product} className="summary-item">
                    <span className="summary-item-name">{item.name} x{item.quantity}</span>
                    <span className="summary-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="free-shipping">FREE</span>
                ) : (
                  <span>₹{shipping}</span>
                )}
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span className="total-amount">₹{total.toLocaleString()}</span>
              </div>

              <div className="delivery-info">
                <p>🚚 Estimated delivery: 3-5 business days</p>
                {formData.paymentMethod === 'RAZORPAY' ? (
                  <p>💳 Secure payment via Razorpay</p>
                ) : (
                  <p>💵 Pay with cash on delivery</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .payment-method-section {
          margin: 30px 0;
        }

        .payment-method-section h3 {
          font-size: 18px;
          color: #333;
          margin-bottom: 15px;
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .payment-option {
          display: flex;
          align-items: flex-start;
          padding: 15px;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .payment-option:hover {
          border-color: #667eea;
        }

        .payment-option input[type="radio"] {
          margin-right: 15px;
          margin-top: 5px;
        }

        .payment-option-content {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
        }

        .payment-icon {
          font-size: 24px;
        }

        .payment-name {
          display: block;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .payment-description {
          font-size: 13px;
          color: #666;
        }

        .checkout-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
          min-height: 60vh;
          background: #f5f5f5;
        }

        .checkout-header {
          margin-bottom: 30px;
        }

        .checkout-header h1 {
          font-size: 32px;
          color: #333;
          margin-bottom: 20px;
        }

        .checkout-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 40px;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e1e1e1;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-bottom: 8px;
          transition: all 0.3s;
        }

        .step.active .step-number {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .step.completed .step-number {
          background: #28a745;
          color: white;
        }

        .step-label {
          font-size: 14px;
          color: #666;
        }

        .step.active .step-label {
          color: #667eea;
          font-weight: 600;
        }

        .step-line {
          width: 100px;
          height: 2px;
          background: #e1e1e1;
          margin: 0 15px;
          margin-bottom: 25px;
        }

        .step-line.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .checkout-container {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 30px;
        }

        .checkout-main {
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .shipping-form h2,
        .review-section h2 {
          font-size: 24px;
          color: #333;
          margin-bottom: 25px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group input.error,
        .form-group textarea.error {
          border-color: #ff6b6b;
        }

        .error-message {
          color: #ff6b6b;
          font-size: 12px;
          margin-top: 5px;
          display: block;
        }

        .form-group input:read-only {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
        }

        .back-btn {
          padding: 12px 24px;
          background: #f5f5f5;
          color: #666;
          border: none;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: background 0.3s;
          cursor: pointer;
        }

        .back-btn:hover {
          background: #e1e1e1;
        }

        .next-btn {
          padding: 12px 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .next-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .place-order-btn {
          padding: 12px 40px;
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .place-order-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(40, 167, 69, 0.3);
        }

        .place-order-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .review-card {
          border: 2px solid #f0f0f0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          position: relative;
        }

        .review-card h3 {
          font-size: 16px;
          color: #333;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
        }

        .review-content p {
          color: #666;
          margin-bottom: 5px;
        }

        .review-phone {
          margin-top: 10px;
          font-weight: 500;
          color: #333;
        }

        .edit-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
        }

        .edit-link {
          display: inline-block;
          margin-top: 10px;
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
        }

        .payment-method-display {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .payment-icon {
          font-size: 32px;
        }

        .payment-name {
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }

        .payment-note {
          color: #666;
          font-size: 13px;
        }

        .items-list {
          margin-bottom: 10px;
        }

        .review-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .item-info {
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
          font-size: 14px;
        }

        .item-price {
          font-weight: 600;
          color: #667eea;
        }

        .checkout-sidebar {
          position: sticky;
          top: 90px;
          height: fit-content;
        }

        .order-summary {
          background: white;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .order-summary h3 {
          font-size: 18px;
          color: #333;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .summary-items {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 15px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 5px 0;
          border-bottom: 1px dashed #f0f0f0;
        }

        .summary-item-name {
          font-size: 14px;
          color: #666;
        }

        .summary-item-price {
          font-weight: 600;
          color: #333;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          color: #666;
        }

        .free-shipping {
          color: #28a745;
          font-weight: 600;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
          padding: 20px 0;
          border-top: 2px solid #f0f0f0;
          border-bottom: 2px solid #f0f0f0;
          font-size: 18px;
          font-weight: 700;
        }

        .total-amount {
          color: #667eea;
          font-size: 24px;
        }

        .delivery-info {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .delivery-info p {
          color: #666;
          margin-bottom: 5px;
          font-size: 13px;
        }

        @media (max-width: 1024px) {
          .checkout-container {
            grid-template-columns: 1fr;
          }

          .checkout-sidebar {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .checkout-page {
            padding: 20px;
          }

          .checkout-steps {
            flex-direction: column;
            gap: 10px;
          }

          .step-line {
            width: 2px;
            height: 30px;
            margin: 5px 0;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
            gap: 10px;
          }

          .back-btn,
          .next-btn,
          .place-order-btn {
            width: 100%;
            text-align: center;
          }

          .edit-btn {
            position: static;
            margin-top: 10px;
            display: block;
            text-align: right;
          }
        }
      `}</style>
    </>
  );
};

export default CheckoutPage;