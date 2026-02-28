import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const categories = [
    { name: 'Fish Medicines', icon: '💊', link: '/products?category=Fish%20Medicines' },
    { name: 'Aquarium Tanks', icon: '🏠', link: '/products?category=Aquarium%20Tanks' },
    { name: 'Filters', icon: '⚙️', link: '/products?category=Filters' },
    { name: 'Heaters', icon: '🔥', link: '/products?category=Heaters' },
    { name: 'Fish Foods', icon: '🍕', link: '/products?category=Fish%20Foods' },
    { name: 'Aquarium Lights', icon: '💡', link: '/products?category=Aquarium%20Lights' },
    { name: 'Planted Tank Lights', icon: '🌿', link: '/products?category=Planted%20Tank%20Lights' },
    { name: 'Live Fishes', icon: '🐟', link: '/products?category=Live%20Fishes' },
    { name: 'Aquarium Accessories', icon: '🪸', link: '/products?category=Aquarium%20Accessories' },
    { name: 'Aquarium Stones and Sands', icon: '🪨', link: '/products?category=Aquarium%20Stones%20and%20Sands' }
  ];

  const quickLinks = [
    { name: 'Home', link: '/' },
    { name: 'Products', link: '/products' },
    { name: 'Cart', link: '/cart' },
    { name: 'Profile', link: '/profile' },
    { name: 'Orders', link: '/orders' }
  ];

  const supportLinks = [
    { name: 'About Us', link: '/about' },
    { name: 'Contact Us', link: '/contact' },
    { name: 'FAQs', link: '/faqs' },
    { name: 'Shipping Policy', link: '/shipping' },
    { name: 'Returns', link: '/returns' }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-grid">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo">
              <Link to="/" className="logo-link">
                <span className="logo-text">Elite Aquarium</span>
                <span className="logo-icon">🐠</span>
              </Link>
            </div>
            <p className="footer-description">
              Your one-stop shop for all aquarium needs. Premium fish, medicines, tanks, and accessories delivered to your doorstep.
            </p>
            <div className="social-links">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/elite_aqurium_pet_shop?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="social-link social-instagram"
                title="Follow us on Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/917094674744"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link social-whatsapp"
                title="Chat with us on WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.link} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h3 className="footer-heading">Shop by Category</h3>
            <ul className="footer-links two-column">
              {categories.map(category => (
                <li key={category.name}>
                  <Link to={category.link} className="footer-link">
                    <span className="category-icon">{category.icon}</span>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="footer-section">
            <h3 className="footer-heading">Support</h3>
            <ul className="footer-links">
              {supportLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.link} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="contact-info">
              <h3 className="footer-heading">Contact Us</h3>
              <p className="contact-item">
                <span className="contact-icon">📧</span>
                <a href="mailto:support@aquaworld.com">eliteaquariumpetstore@gmail.com</a>
              </p>
              <p className="contact-item">
                <span className="contact-icon">📞</span>
                <a href="tel:+911234567890">+91 70946 74744</a>
              </p>
              <p className="contact-item">
                <span className="contact-icon">📍</span>
                <span>Hosur Tamil Nadu India</span>
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="newsletter-section">
          <div className="newsletter-content">
            <h3>Subscribe to Our Newsletter</h3>
            <p>Get updates about new products, live fish arrivals, and special offers!</p>
          </div>
          <form className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              className="newsletter-input"
              required
            />
            <button type="submit" className="newsletter-button">
              Subscribe
            </button>
          </form>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="copyright">
            © {new Date().getFullYear()} Elita Aquarium. All rights reserved.
          </div>
          <div className="payment-methods">
            <span className="payment-icon">💳</span>
            <span className="payment-icon">🏦</span>
            <span className="payment-icon">📱</span>
            <span className="payment-text">Cash on Delivery Available</span>
          </div>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          background: linear-gradient(135deg, #1a2639 0%, #2c3e50 100%);
          color: #fff;
          margin-top: 50px;
          padding: 60px 0 20px;
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 30px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 2fr 1.5fr;
          gap: 40px;
          margin-bottom: 50px;
        }

        /* Company Info Section */
        .footer-logo {
          margin-bottom: 20px;
        }

        .logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .logo-text {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-icon {
          font-size: 28px;
        }

        .footer-description {
          color: #b0c4de;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .social-links {
          display: flex;
          gap: 15px;
        }

        .social-link {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: #fff;
          font-size: 20px;
          transition: all 0.3s;
        }

        .social-link:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        }

        .social-instagram:hover {
          background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%);
        }

        .social-whatsapp:hover {
          background: #25D366;
        }

        /* Footer Headings */
        .footer-heading {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          position: relative;
          padding-bottom: 10px;
        }

        .footer-heading::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 2px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        /* Footer Links */
        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links.two-column {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .footer-links li {
          margin-bottom: 10px;
        }

        .footer-link {
          color: #b0c4de;
          text-decoration: none;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-link:hover {
          color: #fff;
          transform: translateX(5px);
        }

        .category-icon {
          font-size: 16px;
        }

        /* Contact Info */
        .contact-info {
          margin-top: 20px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          color: #b0c4de;
        }

        .contact-icon {
          font-size: 16px;
          width: 20px;
        }

        .contact-item a {
          color: #b0c4de;
          text-decoration: none;
          transition: color 0.3s;
        }

        .contact-item a:hover {
          color: #fff;
        }

        /* Newsletter Section */
        .newsletter-section {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          padding: 30px;
          margin-bottom: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .newsletter-content h3 {
          font-size: 20px;
          margin-bottom: 5px;
        }

        .newsletter-content p {
          color: #b0c4de;
        }

        .newsletter-form {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .newsletter-input {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          min-width: 250px;
          font-size: 14px;
        }

        .newsletter-input:focus {
          outline: none;
          box-shadow: 0 0 0 2px #667eea;
        }

        .newsletter-button {
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .newsletter-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        /* Footer Bottom */
        .footer-bottom {
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          color: #b0c4de;
          font-size: 14px;
        }

        .payment-methods {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .payment-icon {
          font-size: 20px;
        }

        .payment-text {
          color: #b0c4de;
          margin-left: 5px;
        }

        .footer-bottom-links {
          display: flex;
          gap: 20px;
        }

        .footer-bottom-links a {
          color: #b0c4de;
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-bottom-links a:hover {
          color: #fff;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .footer {
            padding: 40px 0 20px;
          }

          .footer-container {
            padding: 0 20px;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .footer-links.two-column {
            grid-template-columns: repeat(2, 1fr);
          }

          .newsletter-section {
            flex-direction: column;
            text-align: center;
          }

          .newsletter-form {
            width: 100%;
            flex-direction: column;
          }

          .newsletter-input {
            width: 100%;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }

          .footer-bottom-links {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;