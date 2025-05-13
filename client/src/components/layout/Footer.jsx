// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';

const Footer = () => {
  const [email, setEmail] = useState('');
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    
    if (email) {
      // Here you would normally call an API to subscribe the user
      toast.success('Thank you for subscribing to our newsletter!');
      setEmail('');
    } else {
      toast.error('Please enter a valid email address');
    }
  };
  
  return (
    <footer>
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0">
            <div className="footer-about">
              <h5>About TechHub</h5>
              <p>We offer premium computer components for gamers, professionals, and enthusiasts. With quality products and expert service, we're your trusted partner for all computing needs.</p>
              <div className="social-icons">
                <a href="#"><i className="bi bi-facebook"></i></a>
                <a href="#"><i className="bi bi-twitter"></i></a>
                <a href="#"><i className="bi bi-instagram"></i></a>
                <a href="#"><i className="bi bi-youtube"></i></a>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-2 mb-4 mb-md-0">
            <div className="footer-links">
              <h5>Shop</h5>
              <ul>
                <li><Link to="/products">All Products</Link></li>
                <li><Link to="/products/category/laptops">Laptops</Link></li>
                <li><Link to="/products/category/monitors">Monitors</Link></li>
                <li><Link to="/products/category/storage">Storage</Link></li>
                <li><Link to="/products/category/components">Components</Link></li>
              </ul>
            </div>
          </div>
          <div className="col-6 col-md-2 mb-4 mb-md-0">
            <div className="footer-links">
              <h5>Support</h5>
              <ul>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/faq">FAQs</Link></li>
                <li><Link to="/shipping">Shipping Policy</Link></li>
                <li><Link to="/returns">Return Policy</Link></li>
                <li><Link to="/warranty">Warranty</Link></li>
              </ul>
            </div>
          </div>
          <div className="col-md-4">
            <div className="footer-newsletter">
              <h5>Newsletter</h5>
              <p>Subscribe to our newsletter for the latest updates and offers.</p>
              <form onSubmit={handleSubscribe}>
                <div className="input-group mb-3">
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Your Email" 
                    aria-label="Email" 
                    aria-describedby="subscribe-btn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button 
                    className="btn btn-primary" 
                    type="submit" 
                    id="subscribe-btn"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom text-center">
        <div className="container">
          <p className="mb-0">&copy; {new Date().getFullYear()} TechHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;