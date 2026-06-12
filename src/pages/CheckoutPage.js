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
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({
    shippingAddress: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
      country: 'India'
    },
    phone: user?.phone || '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    }
  }, [cartItems, isAuthenticated, navigate]);

  const subtotal = getCartTotal();
  // NEW SHIPPING LOGIC: ₹60 for orders below ₹150, FREE for orders ₹150 and above
  const shipping = subtotal < 150 ? 60 : 0;
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
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
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

  const handlePlaceOrder = async () => {
    if (!validateStep1()) {
      setStep(1);
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
          image: item.image
        })),
        shippingAddress: {
          street: formData.shippingAddress.street,
          city: formData.shippingAddress.city,
          state: formData.shippingAddress.state,
          pincode: formData.shippingAddress.pincode,
          country: formData.shippingAddress.country,
          phone: formData.phone
        },
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Online',
        paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Pending',
        notes: formData.notes,
        subtotal: subtotal,
        totalAmount: total,
        orderStatus: 'Processing'
      };

      console.log('Placing order with data:', JSON.stringify(orderData, null, 2));

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders`,
        orderData
      );

      console.log('Order response:', response.data);

      if (response.data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        
        if (paymentMethod === 'online') {
          window.location.href = `/payment/${response.data.order._id}?amount=${total}`;
        } else {
          navigate(`/order-confirmation/${response.data.order._id}`);
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate free shipping progress
  const freeShippingThreshold = 150;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

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
              <span className="step-label">Payment</span>
            </div>
          </div>
        </div>

        <div className="checkout-container">
          <div className="checkout-main">
            {step === 1 && (
              <div className="shipping-form">
                <h2>Shipping Information</h2>
                
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label>Street Address *</label>
                  <input
                    type="text"
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
                    <label>City *</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.shippingAddress.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className={errors['address.city'] ? 'error' : ''}
                    />
                    {errors['address.city'] && <span className="error-message">{errors['address.city']}</span>}
                  </div>

                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
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
                    <label>Pincode *</label>
                    <input
                      type="text"
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
                    <label>Country</label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.shippingAddress.country}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Order Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for delivery?"
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <Link to="/cart" className="back-btn">← Back to Cart</Link>
                  <button onClick={handleNextStep} className="next-btn">Continue to Payment</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="payment-section">
                <h2>Payment Method</h2>
                
                <div className="payment-options">
                  {/* Cash on Delivery */}
                  <div 
                    className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="payment-radio">
                      <div className={`radio-circle ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                        {paymentMethod === 'cod' && <div className="radio-dot"></div>}
                      </div>
                    </div>
                    <div className="payment-details">
                      <div className="payment-icon">💵</div>
                      <div className="payment-info">
                        <strong>Cash on Delivery (COD)</strong>
                        <p>Pay with cash when your order arrives</p>
                      </div>
                    </div>
                  </div>

                  {/* UPI / Online Payment */}
                  <div 
                    className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('online')}
                  >
                    <div className="payment-radio">
                      <div className={`radio-circle ${paymentMethod === 'online' ? 'selected' : ''}`}>
                        {paymentMethod === 'online' && <div className="radio-dot"></div>}
                      </div>
                    </div>
                    <div className="payment-details">
                      <div className="payment-icon">📱</div>
                      <div className="payment-info">
                        <strong>UPI / Online Payment</strong>
                        <p>Pay via UPI, Credit/Debit Card, Net Banking</p>
                      </div>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'online' && (
                  <div className="upi-options">
                    <h3>UPI Payment Options</h3>
                    <div className="upi-grid">
                      <div className="upi-item">
                        <img src="/assets/upi/gpay.png" alt="Google Pay" />
                        <span>Google Pay</span>
                      </div>
                      <div className="upi-item">
                        <img src="/assets/upi/phonepe.png" alt="PhonePe" />
                        <span>PhonePe</span>
                      </div>
                      <div className="upi-item">
                        <img src="/assets/upi/paytm.png" alt="Paytm" />
                        <span>Paytm</span>
                      </div>
                      <div className="upi-item">
                        <img src="/assets/upi/amazonpay.png" alt="Amazon Pay" />
                        <span>Amazon Pay</span>
                      </div>
                    </div>
                    <div className="upi-input">
                      <label>Or enter UPI ID</label>
                      <input type="text" placeholder="username@upi" />
                      <button className="verify-upi-btn">Verify & Pay</button>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button onClick={handlePrevStep} className="back-btn">← Back</button>
                  <button 
                    onClick={handlePlaceOrder} 
                    className="place-order-btn"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `Place Order • ₹${total.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="checkout-sidebar">
            <div className="order-summary">
              <h3>Order Summary</h3>
              
              {/* Free Shipping Progress Bar */}
              {subtotal < freeShippingThreshold && (
                <div className="free-shipping-progress">
                  <div className="progress-text">
                    Add ₹{remainingForFreeShipping.toLocaleString()} more for FREE shipping
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${freeShippingProgress}%` }}></div>
                  </div>
                </div>
              )}
              
              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item.product} className="summary-item">
                    <span>{item.name} x{item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
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
                  <span className="free-shipping-badge">FREE</span>
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
                <p>🔄 Easy 7-day returns</p>
                {shipping > 0 && (
                  <p className="shipping-note">💡 Add items worth ₹{(freeShippingThreshold - subtotal).toLocaleString()} more to get FREE shipping</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
          min-height: 60vh;
          background: #f5f5f5;
        }

        .checkout-header { margin-bottom: 30px; }
        .checkout-header h1 { font-size: 32px; color: #333; margin-bottom: 20px; }

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

        .step-label { font-size: 14px; color: #666; }
        .step.active .step-label { color: #667eea; font-weight: 600; }

        .step-line {
          width: 100px;
          height: 2px;
          background: #e1e1e1;
          margin: 0 15px;
          margin-bottom: 25px;
        }

        .step-line.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }

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

        .shipping-form h2, .payment-section h2 {
          font-size: 24px;
          color: #333;
          margin-bottom: 25px;
        }

        .form-group { margin-bottom: 20px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-weight: 500;
        }

        .form-group input, .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-group input:focus, .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group input.error { border-color: #ff6b6b; }
        .error-message { color: #ff6b6b; font-size: 12px; margin-top: 5px; display: block; }

        /* Free Shipping Progress Bar */
        .free-shipping-progress {
          background: #e8f5e9;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
        }

        .progress-text {
          font-size: 13px;
          color: #2e7d32;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .progress-bar {
          height: 6px;
          background: #c8e6c9;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4caf50, #66bb6a);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .free-shipping-badge {
          background: #4caf50;
          color: white;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .shipping-note {
          font-size: 12px;
          color: #ff9800;
          margin-top: 8px;
        }

        .payment-options { display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px; }

        .payment-option {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          border: 2px solid #e1e1e1;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .payment-option:hover { border-color: #667eea; background: #f8f9fa; }
        .payment-option.selected { border-color: #667eea; background: #f0f0ff; }

        .radio-circle {
          width: 20px;
          height: 20px;
          border: 2px solid #ccc;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .radio-circle.selected { border-color: #667eea; }
        .radio-dot { width: 10px; height: 10px; background: #667eea; border-radius: 50%; }

        .payment-details { display: flex; align-items: center; gap: 15px; flex: 1; }
        .payment-icon { font-size: 32px; }
        .payment-info strong { font-size: 16px; color: #333; }
        .payment-info p { font-size: 13px; color: #666; margin: 0; }

        /* UPI Options */
        .upi-options {
          margin-top: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .upi-options h3 { font-size: 16px; color: #333; margin-bottom: 15px; }

        .upi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .upi-item {
          text-align: center;
          padding: 10px;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .upi-item:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .upi-item img { width: 40px; height: 40px; object-fit: contain; margin-bottom: 5px; }
        .upi-item span { font-size: 12px; color: #333; display: block; }

        .upi-input label { display: block; margin-bottom: 8px; font-weight: 500; }
        .upi-input input { width: 100%; padding: 10px; border: 2px solid #e1e1e1; border-radius: 6px; margin-bottom: 10px; }
        .verify-upi-btn { width: 100%; padding: 10px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; }

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
          cursor: pointer;
          text-decoration: none;
        }

        .next-btn, .place-order-btn {
          padding: 12px 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .place-order-btn { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); }

        .checkout-sidebar { position: sticky; top: 90px; height: fit-content; }
        .order-summary { background: white; border-radius: 10px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }

        .summary-items { max-height: 300px; overflow-y: auto; margin-bottom: 15px; }
        .summary-item { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #666; }

        .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; color: #666; }

        .summary-total {
          display: flex;
          justify-content: space-between;
          margin: 15px 0;
          padding: 15px 0;
          border-top: 2px solid #f0f0f0;
          font-weight: 700;
          font-size: 18px;
        }

        .total-amount { color: #667eea; font-size: 22px; }
        .delivery-info { margin-top: 15px; padding: 12px; background: #f8f9fa; border-radius: 8px; }
        .delivery-info p { font-size: 13px; color: #666; margin-bottom: 5px; }

        @media (max-width: 1024px) { .checkout-container { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .form-row { grid-template-columns: 1fr; }
          .upi-grid { grid-template-columns: repeat(2, 1fr); }
          .form-actions { flex-direction: column; gap: 10px; }
          .back-btn, .next-btn, .place-order-btn { width: 100%; text-align: center; }
        }
      `}</style>
    </>
  );
};

export default CheckoutPage;