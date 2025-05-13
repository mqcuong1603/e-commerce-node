// src/components/layout/Header.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/auth.slice';
import { fetchCategories } from '../../store/product.slice';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isLoggedIn } = useSelector(state => state.auth);
  const { categories } = useSelector(state => state.product);
  const { itemCount } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <i className="bi bi-cpu-fill me-2"></i>
            <span className="text-highlight">Tech</span>Hub
          </Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarSupportedContent" 
            aria-controls="navbarSupportedContent" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0" id="category-menu">
              <li className="nav-item">
                <Link className="nav-link" to="/products">All Products</Link>
              </li>
              {categories.map(category => (
                <li className="nav-item" key={category._id}>
                  <Link 
                    className="nav-link" 
                    to={`/products/category/${category.slug}`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
            <form className="search-form d-flex mx-auto" onSubmit={handleSearch}>
              <input 
                className="form-control" 
                type="search" 
                placeholder="Search products..." 
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </form>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link position-relative" to="/cart">
                  <i className="bi bi-cart-fill"></i>
                  {itemCount > 0 && (
                    <span className="cart-count badge rounded-pill bg-danger">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </li>
              
              {/* User menu - conditional rendering based on authentication */}
              {isLoggedIn ? (
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    id="userDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-fill"></i>
                    <span className="user-fullname">{user.fullName}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li>
                      <Link className="dropdown-item" to="/profile">My Profile</Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/profile#orders">Order History</Link>
                    </li>
                    {user.role === 'admin' && (
                      <li>
                        <Link className="dropdown-item" to="/admin-dashboard">Admin Dashboard</Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                    </li>
                  </ul>
                </li>
              ) : (
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    id="navbarDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle"></i> Account
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li><Link className="dropdown-item" to="/login">Login</Link></li>
                    <li><Link className="dropdown-item" to="/register">Register</Link></li>
                  </ul>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;