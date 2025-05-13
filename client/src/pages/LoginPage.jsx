// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../store/auth.slice';
import AuthService from '../services/auth.service';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  
  const { isLoading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect URL from location state or default to home
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by the Redux slice and will be displayed below
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await AuthService.forgotPassword(forgotEmail);
      toast.success('Password reset link sent to your email!');
      setShowForgotPassword(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'google') {
      AuthService.googleLogin();
    } else if (provider === 'facebook') {
      AuthService.facebookLogin();
    }
  };

  return (
    <main className="main-content py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="auth-form">
              <h2 className="text-center mb-4">Login</h2>
              
              {showForgotPassword ? (
                <div>
                  <h2 className="text-center mb-4">Forgot Password</h2>
                  <p className="text-center mb-4">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  
                  <form onSubmit={handleForgotPassword}>
                    <div className="mb-3">
                      <label htmlFor="forgot-password-email" className="form-label">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        id="forgot-password-email" 
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="d-grid mb-3">
                      <button type="submit" className="btn btn-primary">Send Reset Link</button>
                    </div>
                    <div className="text-center">
                      <button 
                        type="button" 
                        className="btn btn-link"
                        onClick={() => setShowForgotPassword(false)}
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="login-email" className="form-label">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        id="login-email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="login-password" className="form-label">Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        id="login-password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    <div className="mb-3 form-check">
                      <input type="checkbox" className="form-check-input" id="remember-me" />
                      <label className="form-check-label" htmlFor="remember-me">Remember me</label>
                    </div>
                    <div className="d-grid mb-3">
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Logging in...
                          </>
                        ) : 'Login'}
                      </button>
                    </div>
                    <div className="text-center mb-3">
                      <button 
                        type="button" 
                        className="btn btn-link" 
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </form>

                  <div className="divider">OR</div>

                  <div className="social-login">
                    <button 
                      className="btn btn-outline-danger mb-2 w-100"
                      onClick={() => handleSocialLogin('google')}
                    >
                      <i className="bi bi-google me-2"></i> Login with Google
                    </button>
                    <button 
                      className="btn btn-outline-primary w-100"
                      onClick={() => handleSocialLogin('facebook')}
                    >
                      <i className="bi bi-facebook me-2"></i> Login with Facebook
                    </button>
                  </div>

                  <div className="text-center mt-4">
                    <p>Don't have an account? <Link to="/register">Register</Link></p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;