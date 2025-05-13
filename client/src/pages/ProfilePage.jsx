// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import UserService from '../services/user.service';
import OrderService from '../services/order.service';
import { logout } from '../store/auth.slice';
import { formatPrice, formatDate, formatPhone } from '../utils/formatters';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { isLoggedIn, user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Profile state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  
  // Address state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [addressData, setAddressData] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'VN',
    isDefault: false
  });
  
  // Orders state
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Loyalty points state
  const [loyaltyPoints, setLoyaltyPoints] = useState({ points: 0, value: 0 });
  const [loadingPoints, setLoadingPoints] = useState(false);
  
  useEffect(() => {
    // If not logged in, redirect to login
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }
    
    // Check if hash in URL to set active tab
    if (location.hash) {
      const tab = location.hash.substring(1);
      setActiveTab(tab);
    }
    
    // Fetch user profile
    fetchUserProfile();
    
    // Fetch user addresses
    fetchUserAddresses();
    
    // Fetch recent orders
    fetchRecentOrders();
    
    // Fetch loyalty points
    fetchLoyaltyPoints();
  }, [isLoggedIn, navigate, location.hash]);
  
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await UserService.getUserProfile();
      setProfile(response.data);
      setProfileData({
        fullName: response.data.fullName,
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch profile');
      toast.error('Failed to load your profile');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const response = await UserService.getUserAddresses();
      setAddresses(response.data);
    } catch (error) {
      toast.error('Failed to load your addresses');
    } finally {
      setLoadingAddresses(false);
    }
  };
  
  const fetchRecentOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await OrderService.getUserOrders({ limit: 5 });
      setRecentOrders(response.data.orders);
    } catch (error) {
      toast.error('Failed to load your recent orders');
    } finally {
      setLoadingOrders(false);
    }
  };
  
  const fetchLoyaltyPoints = async () => {
    setLoadingPoints(true);
    try {
      const response = await UserService.getLoyaltyPoints();
      setLoyaltyPoints({
        points: response.data.loyaltyPoints,
        value: response.data.equivalentValue
      });
    } catch (error) {
      toast.error('Failed to load your loyalty points');
    } finally {
      setLoadingPoints(false);
    }
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      await UserService.updateUserProfile(profileData);
      setProfile(prev => ({ ...prev, ...profileData }));
      setEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    setUpdatingPassword(true);
    try {
      await UserService.updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };
  
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editAddressId) {
        // Update existing address
        await UserService.updateAddress(editAddressId, addressData);
        toast.success('Address updated successfully');
      } else {
        // Add new address
        await UserService.addAddress(addressData);
        toast.success('Address added successfully');
      }
      
      // Reset form and fetch updated addresses
      resetAddressForm();
      fetchUserAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    }
  };
  
  const handleEditAddress = (address) => {
    setAddressData({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setEditAddressId(address._id);
    setShowAddAddressForm(true);
  };
  
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    try {
      await UserService.deleteAddress(addressId);
      toast.success('Address deleted successfully');
      fetchUserAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    }
  };
  
  const handleSetDefaultAddress = async (addressId) => {
    try {
      await UserService.setDefaultAddress(addressId);
      toast.success('Default address updated');
      fetchUserAddresses();
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };
  
  const resetAddressForm = () => {
    setAddressData({
      fullName: user?.fullName || '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'VN',
      isDefault: false
    });
    setEditAddressId(null);
    setShowAddAddressForm(false);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    toast.info('You have been logged out');
  };
  
  const handleDeactivateAccount = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      await UserService.deactivateAccount();
      dispatch(logout());
      navigate('/');
      toast.info('Your account has been deactivated');
    } catch (error) {
      toast.error('Failed to deactivate account');
    }
  };
  
  if (loading && !profile) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your profile...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <main className="main-content py-5">
      <div className="container">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-3 mb-4">
            <div className="profile-sidebar">
              <div className="text-center mb-4">
                <div className="avatar mb-3 mx-auto">
                  <i className="bi bi-person-circle fs-1"></i>
                </div>
                <h5 className="mb-0">{profile?.fullName}</h5>
                <p className="text-muted">{profile?.email}</p>
              </div>
              
              <div className="profile-nav">
                <a
                  href="#profile"
                  className={`nav-link d-flex align-items-center ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="bi bi-person me-2"></i> Profile
                </a>
                <a
                  href="#security"
                  className={`nav-link d-flex align-items-center ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <i className="bi bi-shield-lock me-2"></i> Security
                </a>
                <a
                  href="#addresses"
                  className={`nav-link d-flex align-items-center ${activeTab === 'addresses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('addresses')}
                >
                  <i className="bi bi-geo-alt me-2"></i> Addresses
                </a>
                <a
                  href="#orders"
                  className={`nav-link d-flex align-items-center ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <i className="bi bi-box me-2"></i> Orders
                </a>
                <a
                  href="#loyalty"
                  className={`nav-link d-flex align-items-center ${activeTab === 'loyalty' ? 'active' : ''}`}
                  onClick={() => setActiveTab('loyalty')}
                >
                  <i className="bi bi-star me-2"></i> Loyalty Points
                </a>
                <hr />
                <button
                  className="nav-link d-flex align-items-center text-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
              </div>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="col-lg-9">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Profile Information</h5>
                  {!editingProfile && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => setEditingProfile(true)}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
                <div className="card-body">
                  {editingProfile ? (
                    <form onSubmit={handleUpdateProfile}>
                      <div className="mb-3">
                        <label htmlFor="fullName" className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullName"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleProfileChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={profile?.email}
                          disabled
                        />
                        <div className="form-text">Email cannot be changed</div>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-outline-secondary me-2"
                          onClick={() => {
                            setEditingProfile(false);
                            setProfileData({
                              fullName: profile?.fullName,
                            });
                          }}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                      </div>
                    </form>
                  ) : (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <p className="text-muted mb-1">Full Name</p>
                        <p className="fw-bold">{profile?.fullName}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <p className="text-muted mb-1">Email</p>
                        <p className="fw-bold">{profile?.email}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <p className="text-muted mb-1">Account Type</p>
                        <p className="fw-bold">
                          {profile?.socialMediaProvider ? (
                            <span>
                              {profile.socialMediaProvider.charAt(0).toUpperCase() + profile.socialMediaProvider.slice(1)} Account
                            </span>
                          ) : (
                            <span>Email Account</span>
                          )}
                        </p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <p className="text-muted mb-1">Member Since</p>
                        <p className="fw-bold">{formatDate(profile?.createdAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Security Settings</h5>
                </div>
                <div className="card-body">
                  {profile?.socialMediaProvider ? (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      You are signed in with a {profile.socialMediaProvider.charAt(0).toUpperCase() + profile.socialMediaProvider.slice(1)} account. No password is required.
                    </div>
                  ) : (
                    <>
                      <h6 className="mb-3">Change Password</h6>
                      <form onSubmit={handleUpdatePassword}>
                        <div className="mb-3">
                          <label htmlFor="currentPassword" className="form-label">Current Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="newPassword" className="form-label">New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="newPassword"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength="6"
                          />
                          <div className="form-text">
                            Password must be at least 6 characters long
                          </div>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={updatingPassword}
                        >
                          {updatingPassword ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Updating...
                            </>
                          ) : 'Update Password'}
                        </button>
                      </form>
                      
                      <hr className="my-4" />
                    </>
                  )}
                  
                  <h6 className="mb-3 text-danger">Deactivate Account</h6>
                  <p>This action will permanently deactivate your account and cannot be undone.</p>
                  <button
                    className="btn btn-outline-danger"
                    onClick={handleDeactivateAccount}
                  >
                    Deactivate Account
                  </button>
                </div>
              </div>
            )}
            
            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">My Addresses</h5>
                  {!showAddAddressForm && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setAddressData({
                          ...addressData,
                          fullName: profile?.fullName
                        });
                        setShowAddAddressForm(true);
                      }}
                    >
                      Add New Address
                    </button>
                  )}
                </div>
                <div className="card-body">
                  {showAddAddressForm ? (
                    <form onSubmit={handleAddressSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="fullName" className="form-label">Full Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="fullName"
                            name="fullName"
                            value={addressData.fullName}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                          <input
                            type="text"
                            className="form-control"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={addressData.phoneNumber}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="addressLine1" className="form-label">Address Line 1</label>
                        <input
                          type="text"
                          className="form-control"
                          id="addressLine1"
                          name="addressLine1"
                          value={addressData.addressLine1}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="addressLine2" className="form-label">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          id="addressLine2"
                          name="addressLine2"
                          value={addressData.addressLine2}
                          onChange={handleAddressChange}
                        />
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="city" className="form-label">City</label>
                          <input
                            type="text"
                            className="form-control"
                            id="city"
                            name="city"
                            value={addressData.city}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="state" className="form-label">State/Province</label>
                          <input
                            type="text"
                            className="form-control"
                            id="state"
                            name="state"
                            value={addressData.state}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="postalCode" className="form-label">Postal Code</label>
                          <input
                            type="text"
                            className="form-control"
                            id="postalCode"
                            name="postalCode"
                            value={addressData.postalCode}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="country" className="form-label">Country</label>
                          <select
                            className="form-select"
                            id="country"
                            name="country"
                            value={addressData.country}
                            onChange={handleAddressChange}
                            required
                          >
                            <option value="VN">Vietnam</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="SG">Singapore</option>
                            <option value="JP">Japan</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isDefault"
                          name="isDefault"
                          checked={addressData.isDefault}
                          onChange={handleAddressChange}
                        />
                        <label className="form-check-label" htmlFor="isDefault">
                          Set as default address
                        </label>
                      </div>
                      
                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-outline-secondary me-2"
                          onClick={resetAddressForm}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          {editAddressId ? 'Update Address' : 'Save Address'}
                        </button>
                      </div>
                    </form>
                  ) : loadingAddresses ? (
                    <div className="text-center py-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading addresses...</p>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-3">
                      <p>You don't have any saved addresses yet.</p>
                      <button
                        className="btn btn-primary mt-2"
                        onClick={() => {
                          setAddressData({
                            ...addressData,
                            fullName: profile?.fullName
                          });
                          setShowAddAddressForm(true);
                        }}
                      >
                        Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="row">
                      {addresses.map(address => (
                        <div className="col-md-6 mb-3" key={address._id}>
                          <div className="address-card">
                            {address.isDefault && (
                              <span className="default-badge badge bg-info">Default</span>
                            )}
                            <h6 className="mb-1">{address.fullName}</h6>
                            <p className="mb-1">{formatPhone(address.phoneNumber)}</p>
                            <p className="mb-1">{address.addressLine1}</p>
                            {address.addressLine2 && <p className="mb-1">{address.addressLine2}</p>}
                            <p className="mb-1">{address.city}, {address.state} {address.postalCode}</p>
                            <p className="mb-3">{address.country}</p>
                            <div className="d-flex">
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleEditAddress(address)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger me-2"
                                onClick={() => handleDeleteAddress(address._id)}
                              >
                                Delete
                              </button>
                              {!address.isDefault && (
                                <button
                                  className="btn btn-sm btn-outline-info"
                                  onClick={() => handleSetDefaultAddress(address._id)}
                                >
                                  Set as Default
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Orders</h5>
                  <Link to="/orders" className="btn btn-sm btn-outline-primary">
                    View All Orders
                  </Link>
                </div>
                <div className="card-body">
                  {loadingOrders ? (
                    <div className="text-center py-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading orders...</p>
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="text-center py-3">
                      <p>You don't have any orders yet.</p>
                      <Link to="/products" className="btn btn-primary mt-2">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Order Number</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map(order => (
                            <tr key={order._id}>
                              <td>{order.orderNumber}</td>
                              <td>{formatDate(order.createdAt)}</td>
                              <td>{formatPrice(order.total)}</td>
                              <td>
                                <span className={`badge ${
                                  order.status.status === 'delivered' ? 'bg-success' :
                                  order.status.status === 'cancelled' ? 'bg-danger' :
                                  order.status.status === 'shipping' ? 'bg-info' :
                                  order.status.status === 'processing' ? 'bg-primary' :
                                  order.status.status === 'confirmed' ? 'bg-info' : 'bg-warning'
                                }`}>
                                  {order.status.status.charAt(0).toUpperCase() + order.status.status.slice(1)}
                                </span>
                              </td>
                              <td>
                                <Link 
                                  to={`/orders/${order._id}`} 
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Loyalty Points Tab */}
            {activeTab === 'loyalty' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Loyalty Points</h5>
                </div>
                <div className="card-body">
                  {loadingPoints ? (
                    <div className="text-center py-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading loyalty points...</p>
                    </div>
                  ) : (
                    <>
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <div className="card text-center p-4 bg-light">
                            <h2 className="mb-2">{loyaltyPoints.points}</h2>
                            <p className="mb-0">Available Points</p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card text-center p-4 bg-light">
                            <h2 className="mb-2">{formatPrice(loyaltyPoints.value)}</h2>
                            <p className="mb-0">Equivalent Value</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card mb-4">
                        <div className="card-body">
                          <h6 className="mb-3">How It Works</h6>
                          <p className="mb-2">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            Earn 10% of your order value as loyalty points
                          </p>
                          <p className="mb-2">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            1 point = 1,000 VND for your next purchase
                          </p>
                          <p className="mb-2">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            Use your points during checkout
                          </p>
                          <p className="mb-0">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            No minimum points required to redeem
                          </p>
                        </div>
                      </div>
                      
                      <div className="d-grid">
                        <Link to="/products" className="btn btn-primary">
                          Shop and Earn More Points
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;