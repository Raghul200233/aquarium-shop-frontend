// src/config.js
const config = {
  API_URL: process.env.NODE_ENV === 'production' 
    ? 'https://aquarium-shop-otdq.onrender.com'  // Your Render backend
    : process.env.REACT_APP_API_URL || 'http://localhost:5000'
};

export default config;