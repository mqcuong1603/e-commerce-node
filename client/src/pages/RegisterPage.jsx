// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../store/auth.slice';
import { toast } from 'react-toastify';
import { isValidEmail, validatePassword, isValidPhone } from '../utils/validators';
import { COUNTRIES } from '../utils/constants';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    address: {
      fullName: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'VN',
    }
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [useShippingName, setUseShippingName] = useState(true);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // For address fields
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        }
      }));
    } else {
      // For regular fields
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // If "useShippingName" is checked and fullName is changed, update address.fullName
      if (name === 'fullName' && useShippingName) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            fullName: value,
          }
        }));
      }
    }
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleToggleUseShippingName = (e) => {
    const checked = e.target.checked;
    setUseShippingName(checked);
    
    if (checked) {
      // Copy account name to shipping name
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          fullName: prev.fullName,
        }
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Validate email
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate full name
    if (!formData.fullName) {
      errors.fullName = 'Full name is required';
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
      }
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate shipping address
    if (!formData.address.fullName) {
      errors['address.fullName'] = 'Full name is required for shipping';
    }
    
    if (!formData.address.phoneNumber) {
      errors['address.phoneNumber'] = 'Phone number is required';
    } else if (!isValidPhone(formData.address.phoneNumber)) {
      errors['address.phoneNumber'] = 'Please enter a valid phone number';
    }
    
    if (!formData.address.addressLine1) {
      errors['address.addressLine1'] = 'Address is required';
    }
    
    if (!formData.address.city) {
      errors['address.city'] = 'City is required';
    }
    
    if (!formData.address.state) {
      errors['address.state'] = 'State/Province is required';
    }
    
    if (!formData.address.postalCode) {
      errors['address.postalCode'] = 'Postal code is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    try {
      await dispatch(register(formData)).unwrap();
      toast.success('Registration successful! Please check your email for login details.');
      navigate('/login');
    } catch (err) {
      // Error is handled by the Redux slice and will be displayed in the component
      toast.error(err || 'Registration failed');
    }
  };
  
  const handleSocialLogin = (provider) => {
    window.location.href = `/api/auth/${provider}`;
  };
  
  return (
    <main className="main-content py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="auth-form">
              <h2 className="text-center mb-4">Create an Account</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <h4 className="mb-3">Account Information</h4>
                    
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email Address*</label>
                      <input 
                        type="email" 
                        className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                        id="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required 
                      />
                      {validationErrors.email && (
                        <div className="invalid-feedback">{validationErrors.email}</div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="fullName" className="form-label">Full Name*</label>
                      <input 
                        type="text" 
                        className={`form-control ${validationErrors.fullName ? 'is-invalid' : ''}`}
                        id="fullName" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required 
                      />
                      {validationErrors.fullName && (
                        <div className="invalid-feedback">{validationErrors.fullName}</div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password*</label>
                      <input 
                        type="password" 
                        className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                        id="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6" 
                      />
                      {validationErrors.password ? (
                        <div className="invalid-feedback">{validationErrors.password}</div>
                      ) : (
                        <div className="form-text">
                          Password must be at least 6 characters long
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Confirm Password*</label>
                      <input 
                        type="password" 
                        className={`form-control ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required 
                      />
                      {validationErrors.confirmPassword && (
                        <div className="invalid-feedback">{validationErrors.confirmPassword}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <h4 className="mb-3">Shipping Address</h4>
                    
                    <div className="mb-3 form-check">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="useShippingName" 
                        checked={useShippingName}
                        onChange={handleToggleUseShippingName}
                      />
                      <label className="form-check-label" htmlFor="useShippingName">
                        Use account name for shipping
                      </label>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="address.fullName" className="form-label">Full Name*</label>
                      <input 
                        type="text" 
                        className={`form-control ${validationErrors['address.fullName'] ? 'is-invalid' : ''}`}
                        id="address.fullName" 
                        name="address.fullName"
                        value={formData.address.fullName}
                        onChange={handleChange}
                        disabled={useShippingName}
                        required 
                      />
                      {validationErrors['address.fullName'] && (
                        <div className="invalid-feedback">{validationErrors['address.fullName']}</div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="address.phoneNumber" className="form-label">Phone Number*</label>
                      <input 
                        type="text" 
                        className={`form-control ${validationErrors['address.phoneNumber'] ? 'is-invalid' : ''}`}
                        id="address.phoneNumber" 
                        name="address.phoneNumber"
                        value={formData.address.phoneNumber}
                        onChange={handleChange}
                        required 
                      />
                      {validationErrors['address.phoneNumber'] && (
                        <div className="invalid-feedback">{validationErrors['address.phoneNumber']}</div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="address.addressLine1" className="form-label">Address Line 1*</label>
                      <input 
                        type="text" 
                        className={`form-control ${validationErrors['address.addressLine1'] ? 'is-invalid' : ''}`}
                        id="address.addressLine1" 
                        name="address.addressLine1"
                        value={formData.address.addressLine1}
                        onChange={handleChange}
                        required 
                      />
                      {validationErrors['address.addressLine1'] && (
                        <div className="invalid-feedback">{validationErrors['address.addressLine1']}</div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="address.addressLine2" className="form-label">Address Line 2</label>
                      <input 
                        type="text" 
                        className="form-control"
                        id="address.addressLine2" 
                        name="address.addressLine2"
                        value={formData.address.addressLine2}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="address.city" className="form-label">City*</label>
                        <input 
                          type="text" 
                          className={`form-control ${validationErrors['address.city'] ? 'is-invalid' : ''}`}
                          id="address.city" 
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          required 
                        />
                        {validationErrors['address.city'] && (
                          <div className="invalid-feedback">{validationErrors['address.city']}</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="address.state" className="form-label">State/Province*</label>
                        <input 
                          type="text" 
                          className={`form-control ${validationErrors['address.state'] ? 'is-invalid' : ''}`}
                          id="address.state" 
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                          required 
                        />
                        {validationErrors['address.state'] && (
                          <div className="invalid-feedback">{validationErrors['address.state']}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="address.postalCode" className="form-label">Postal Code*</label>
                        <input 
                          type="text" 
                          className={`form-control ${validationErrors['address.postalCode'] ? 'is-invalid' : ''}`}
                          id="address.postalCode" 
                          name="address.postalCode"
                          value={formData.address.postalCode}
                          onChange={handleChange}
                          required 
                        />
                        {validationErrors['address.postalCode'] && (
                          <div className="invalid-feedback">{validationErrors['address.postalCode']}</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="address.country" className="form-label">Country*</label>
                        <select 
                          className="form-select"
                          id="address.country" 
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleChange}
                          required 
                        >
                          {COUNTRIES.map(country => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="d-grid mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Registering...
                      </>
                    ) : 'Create Account'}
                  </button>
                </div>
              </form>
              
              <div className="divider my-4">OR</div>
              
              <div className="social-login">
                <button 
                  className="btn btn-outline-danger mb-2 w-100"
                  onClick={() => handleSocialLogin('google')}
                >
                  <i className="bi bi-google me-2"></i> Sign up with Google
                </button>
                <button 
                  className="btn btn-outline-primary w-100"
                  onClick={() => handleSocialLogin('facebook')}
                >
                  <i className="bi bi-facebook me-2"></i> Sign up with Facebook
                </button>
              </div>
              
              <div className="text-center mt-4">
                <p>Already have an account? <Link to="/login">Login</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;