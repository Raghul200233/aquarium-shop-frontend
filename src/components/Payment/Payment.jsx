import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';

const Payment = ({ amount, products, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Ensure Razorpay script is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      // 1. Create order on backend
      const orderResponse = await axios.post(
        `${config.API_URL}/api/orders/create-order`,
        {
          amount: amount,
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

      // 2. Configure Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Add this to your .env
        amount: amount * 100,
        currency: 'INR',
        name: 'Elite Aquarium',
        description: 'Payment for your order',
        image: 'https://eliteaquariumandpetstore.com/logo.png', // Add your logo
        order_id: orderId,
        handler: async (response) => {
          // 3. Verify payment on backend
          try {
            const verifyResponse = await axios.post(
              `${config.API_URL}/api/orders/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: amount,
                products: products
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              }
            );

            if (verifyResponse.data.success) {
              onSuccess?.(verifyResponse.data.order);
            } else {
              onFailure?.('Payment verification failed');
            }
          } catch (error) {
            console.error('Verification error:', error);
            onFailure?.('Payment verification failed');
          }
          setLoading(false);
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: {
          address: 'Customer address will be added here'
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            console.log('Payment modal closed');
          }
        }
      };

      // 4. Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Handle payment failures
      razorpay.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        onFailure?.(response.error.description);
        setLoading(false);
      });

    } catch (error) {
      console.error('Error initiating payment:', error);
      onFailure?.('Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="payment-button"
      style={{
        backgroundColor: loading ? '#ccc' : '#667eea',
        color: 'white',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
};

export default Payment;