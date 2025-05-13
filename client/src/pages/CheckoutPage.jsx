// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart } from '../store/cart.slice';
import { formatPrice } from '../utils/formatters';
import UserService from '../services/user.service';
import OrderService from '../services/order.service';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const { items, subtotal, shippingFee, tax, discount, total, itemCount } = useSelector(state => state.cart);
  const { user, isLoggedIn } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.fullName || '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'VN'
  });
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressMode, setAddressMode] = useState('select'); // 'select' or 'new'
  const [email, setEmail] = useState(user?.email || '');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loyaltyPoints, setLoyaltyPoints] = useState({ available: 0, used: 0, value: 0 });
  const [usePoints, setUsePoints] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    dispatch(fetchCart());
    
    if (isLoggedIn) {
      fetchUserAddresses();
      fetchLoyaltyPoints();
    }
  }, [dispatch, isLoggedIn]);
  
  const fetchUserAddresses = async () => {
    try {
      const response = await UserService.getUserAddresses();
      setAddresses(response.data);
      
      // Set default address if available
      const defaultAddress = response.data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (response.data.length > 0) {
        setSelectedAddress(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load your addresses');
    }
  };
  
  const fetchLoyaltyPoints = async () => {
    try {
      const response = await UserService.getLoyaltyPoints();
      setLoyaltyPoints({
        ...loyaltyPoints,
        available: response.data.loyaltyPoints,
        value: response.data.equivalentValue
      });
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
    }
  };
  
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    // Validate address fields
    const required = ['fullName', 'phoneNumber', 'addressLine1', 'city', 'state', 'postalCode', 'country'];
    for (const field of required) {
      if (!newAddress[field]) {
        toast.error(`${field} is required`);
        return;
      }
    }
    
    setAddingAddress(true);
    try {
      const response = await UserService.addAddress(newAddress);
      setAddresses(prev => [...prev, response.data]);
      setSelectedAddress(response.data);
      setAddressMode('select');
      toast.success('Address added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    } finally {
      setAddingAddress(false);
    }
  };
  
  const handleTogglePoints = () => {
    if (!usePoints) {
      // Calculate how many points to use (up to the available amount, but not more than necessary for the order)
      const maxPointsNeeded = Math.floor(total / 1000);
      const pointsToUse = Math.min(loyaltyPoints.available, maxPointsNeeded);
      
      setLoyaltyPoints(prev => ({
        ...prev,
        used: pointsToUse,
        value: pointsToUse * 1000
      }));
    } else {
      setLoyaltyPoints(prev => ({
        ...prev,
        used: 0,
        value: 0
      }));
    }
    
    setUsePoints(prev => !prev);
  };
  
  const handlePlaceOrder = async () => {
    // Validate data before submission
    if (addressMode === 'select' && !selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    
    if (!email) {
      toast.error('Email is required');
      return;
    }
    
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    
    // Prepare order data
    const orderData = {
      shippingAddress: addressMode === 'select' ? selectedAddress : newAddress,
      loyaltyPointsUsed: usePoints ? loyaltyPoints.used : 0,
      paymentMethod,
      email
    };
    
    // If discount code is applied, it will be included automatically from the cart
    
    setIsProcessing(true);
    try {
      const response = await OrderService.createOrder(orderData);
      toast.success('Order placed successfully!');
      
      // Navigate to success page with order details
      navigate(`/orders/${response.data.order._id}`, { 
        state: { 
          fromCheckout: true,
          orderNumber: response.data.order.orderNumber
        } 
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
      setIsProcessing(false);
    }
  };
  
  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn && !isProcessing) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isLoggedIn, navigate, isProcessing]);
  
  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      toast.info('Your cart is empty');
      navigate('/cart');
    }
  }, [items, navigate, isProcessing]);
  
  return (
    <main className="main-content py-5">
      <div className="container">
        <h1 className="mb-4">Checkout</h1>
        
        {/* Checkout Steps */}
        <div className="checkout-steps d-flex justify-content-between mb-5">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">1</div>
            <div className="step-label">Shipping</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-circle">2</div>
            <div className="step-label">Payment</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <div className="step-label">Review</div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-lg-8">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Shipping Information</h5>
                </div>
                <div className="card-body">
                  {isLoggedIn ? (
                    <>
                      <div className="mb-4">
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="addressMode"
                            id="selectAddress"
                            checked={addressMode === 'select'}
                            onChange={() => setAddressMode('select')}
                          />
                          <label className="form-check-label" htmlFor="selectAddress">
                            Use saved address
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="addressMode"
                            id="newAddress"
                            checked={addressMode === 'new'}
                            onChange={() => setAddressMode('new')}
                          />
                          <label className="form-check-label" htmlFor="newAddress">
                            Add new address
                          </label>
                        </div>
                      </div>
                      
                      {addressMode === 'select' ? (
                        <div className="saved-addresses">
                          {addresses.length === 0 ? (
                            <div className="alert alert-info">
                              You don't have any saved addresses. Please add a new address.
                              <button 
                                className="btn btn-sm btn-primary ms-3"
                                onClick={() => setAddressMode('new')}
                              >
                                Add Address
                              </button>
                            </div>
                          ) : (
                            <div className="row">
                              {addresses.map(address => (
                                <div className="col-md-6 mb-3" key={address._id}>
                                  <div 
                                    className={`card h-100 ${selectedAddress?._id === address._id ? 'border-primary' : ''}`}
                                    onClick={() => setSelectedAddress(address)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className="card-body">
                                      <h6 className="card-title">{address.fullName}</h6>
                                      <p className="card-text small mb-1">{address.phoneNumber}</p>
                                      <p className="card-text small mb-1">{address.addressLine1}</p>
                                      {address.addressLine2 && <p className="card-text small mb-1">{address.addressLine2}</p>}
                                      <p className="card-text small mb-1">{address.city}, {address.state} {address.postalCode}</p>
                                      <p className="card-text small mb-0">{address.country}</p>
                                      
                                      {address.isDefault && (
                                        <span className="badge bg-info mt-2">Default</span>
                                      )}
                                    </div>
                                    {selectedAddress?._id === address._id && (
                                      <div className="card-footer bg-primary text-white text-center">
                                        Selected
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <form onSubmit={handleAddAddress}>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="fullName" className="form-label">Full Name</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                id="fullName" 
                                name="fullName"
                                value={newAddress.fullName}
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
                                value={newAddress.phoneNumber}
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
                              value={newAddress.addressLine1}
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
                              value={newAddress.addressLine2}
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
                                value={newAddress.city}
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
                                value={newAddress.state}
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
                                value={newAddress.postalCode}
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
                                value={newAddress.country}
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
                          
                          <div className="d-flex justify-content-between mt-3">
                            <button 
                              type="button" 
                              className="btn btn-outline-secondary"
                              onClick={() => setAddressMode('select')}
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit" 
                              className="btn btn-primary"
                              disabled={addingAddress}
                            >
                              {addingAddress ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Saving...
                                </>
                              ) : 'Save Address'}
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  ) : (
                    <div className="guest-checkout">
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          id="email" 
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <div className="form-text">We'll send your order confirmation to this email.</div>
                      </div>
                      
                      <form>
                        {/* New address form for guest user (same fields as above) */}
                        <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="fullName" className="form-label">Full Name</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                id="fullName" 
                                name="fullName"
                                value={newAddress.fullName}
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
                                value={newAddress.phoneNumber}
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
                              value={newAddress.addressLine1}
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
                              value={newAddress.addressLine2}
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
                                value={newAddress.city}
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
                                value={newAddress.state}
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
                                value={newAddress.postalCode}
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
                                value={newAddress.country}
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
                      </form>
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <div className="d-flex justify-content-between">
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/cart')}
                    >
                      Back to Cart
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setStep(2)}
                      disabled={
                        (addressMode === 'select' && !selectedAddress) || 
                        (addressMode === 'new' && !newAddress.fullName)
                      }
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Payment Information */}
            {step === 2 && (
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Payment Information</h5>
                </div>
                <div className="card-body">
                  <div className="payment-methods mb-4">
                    <div 
                      className={`payment-method ${paymentMethod === 'credit_card' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('credit_card')}
                    >
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="paymentMethod" 
                          id="creditCard" 
                          checked={paymentMethod === 'credit_card'}
                          onChange={() => setPaymentMethod('credit_card')}
                        />
                        <label className="form-check-label" htmlFor="creditCard">
                          <i className="bi bi-credit-card me-2"></i>
                          Credit / Debit Card
                        </label>
                      </div>
                      {paymentMethod === 'credit_card' && (
                        <div className="payment-details mt-3">
                          <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            This is a demo store. No real payment will be processed.
                          </div>
                          <div className="row">
                            <div className="col-12 mb-3">
                              <label htmlFor="cardNumber" className="form-label">Card Number</label>
                              <input type="text" className="form-control" id="cardNumber" placeholder="1234 5678 9012 3456" disabled />
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="expiration" className="form-label">Expiration Date</label>
                              <input type="text" className="form-control" id="expiration" placeholder="MM/YY" disabled />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label htmlFor="cvv" className="form-label">CVV</label>
                              <input type="text" className="form-control" id="cvv" placeholder="123" disabled />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div 
                      className={`payment-method ${paymentMethod === 'paypal' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('paypal')}
                    >
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="paymentMethod" 
                          id="paypal" 
                          checked={paymentMethod === 'paypal'}
                          onChange={() => setPaymentMethod('paypal')}
                        />
                        <label className="form-check-label" htmlFor="paypal">
                          <i className="bi bi-paypal me-2"></i>
                          PayPal
                        </label>
                      </div>
                      {paymentMethod === 'paypal' && (
                        <div className="payment-details mt-3">
                          <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            You will be redirected to PayPal to complete your payment (demo only).
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div 
                      className={`payment-method ${paymentMethod === 'bank_transfer' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('bank_transfer')}
                    >
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="paymentMethod" 
                          id="bankTransfer" 
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={() => setPaymentMethod('bank_transfer')}
                        />
                        <label className="form-check-label" htmlFor="bankTransfer">
                          <i className="bi bi-bank me-2"></i>
                          Bank Transfer
                        </label>
                      </div>
                      {paymentMethod === 'bank_transfer' && (
                        <div className="payment-details mt-3">
                          <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            Our bank details will be sent to your email (demo only).
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isLoggedIn && loyaltyPoints.available > 0 && (
                    <div className="loyalty-points-section p-3 bg-light rounded mb-3">
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="usePoints"
                          checked={usePoints}
                          onChange={handleTogglePoints}
                        />
                        <label className="form-check-label" htmlFor="usePoints">
                          Use my Loyalty Points ({loyaltyPoints.available} points = {formatPrice(loyaltyPoints.available * 1000)})
                        </label>
                      </div>
                      {usePoints && (
                        <div className="mt-2">
                          <p className="text-success mb-0">
                            <i className="bi bi-check-circle me-2"></i>
                            You're using {loyaltyPoints.used} points ({formatPrice(loyaltyPoints.value)})
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <div className="d-flex justify-content-between">
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setStep(1)}
                    >
                      Back to Shipping
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setStep(3)}
                      disabled={!paymentMethod}
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Review Your Order</h5>
                </div>
                <div className="card-body">
                  <h6 className="mb-3">Order Items</h6>
                  <div className="table-responsive mb-4">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th className="text-end">Price</th>
                          <th className="text-center">Quantity</th>
                          <th className="text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(item => (
                          <tr key={item.productVariantId._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img 
                                  src={item.productVariantId.images?.[0]?.imageUrl || "/api/placeholder/60/60"} 
                                  alt={item.productVariantId.productId.name} 
                                  className="me-2"
                                  style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                                />
                                <div>
                                  <div>{item.productVariantId.productId.name}</div>
                                  <small className="text-muted">{item.productVariantId.name}</small>
                                </div>
                              </div>
                            </td>
                            <td className="text-end">{formatPrice(item.price)}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <h6 className="mb-3">Shipping Address</h6>
                      <div className="p-3 bg-light rounded">
                        {addressMode === 'select' && selectedAddress ? (
                          <>
                            <p className="mb-1"><strong>{selectedAddress.fullName}</strong></p>
                            <p className="mb-1">{selectedAddress.phoneNumber}</p>
                            <p className="mb-1">{selectedAddress.addressLine1}</p>
                            {selectedAddress.addressLine2 && <p className="mb-1">{selectedAddress.addressLine2}</p>}
                            <p className="mb-1">{selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}</p>
                            <p className="mb-0">{selectedAddress.country}</p>
                          </>
                        ) : (
                          <>
                            <p className="mb-1"><strong>{newAddress.fullName}</strong></p>
                            <p className="mb-1">{newAddress.phoneNumber}</p>
                            <p className="mb-1">{newAddress.addressLine1}</p>
                            {newAddress.addressLine2 && <p className="mb-1">{newAddress.addressLine2}</p>}
                            <p className="mb-1">{newAddress.city}, {newAddress.state} {newAddress.postalCode}</p>
                            <p className="mb-0">{newAddress.country}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <h6 className="mb-3">Payment Method</h6>
                      <div className="p-3 bg-light rounded">
                        {paymentMethod === 'credit_card' && (
                          <p className="mb-0"><i className="bi bi-credit-card me-2"></i> Credit / Debit Card</p>
                        )}
                        {paymentMethod === 'paypal' && (
                          <p className="mb-0"><i className="bi bi-paypal me-2"></i> PayPal</p>
                        )}
                        {paymentMethod === 'bank_transfer' && (
                          <p className="mb-0"><i className="bi bi-bank me-2"></i> Bank Transfer</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <h6 className="mb-3">Contact Information</h6>
                  <div className="p-3 bg-light rounded mb-4">
                    <p className="mb-0"><i className="bi bi-envelope me-2"></i> {email}</p>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="d-flex justify-content-between">
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setStep(2)}
                    >
                      Back to Payment
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : 'Place Order'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="col-lg-4">
            <div className="card cart-summary">
              <div className="card-header">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal ({itemCount} items):</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                {tax > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax:</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                )}
                {discount.amount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Discount ({discount.code}):</span>
                    <span>-{formatPrice(discount.amount)}</span>
                  </div>
                )}
                {usePoints && loyaltyPoints.value > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Loyalty Points ({loyaltyPoints.used}):</span>
                    <span>-{formatPrice(loyaltyPoints.value)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-0">
                  <strong>Total:</strong>
                  <strong>
                    {formatPrice(
                      total - (usePoints ? loyaltyPoints.value : 0)
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;