// src/pages/CartPage.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem, removeCartItem, clearCart } from '../store/cart.slice';
import { verifyDiscount } from '../store/cart.slice';
import CartItem from '../components/cart/CartItem';
import { formatPrice } from '../utils/formatters';
import { toast } from 'react-toastify';

const CartPage = () => {
  const { items, subtotal, shippingFee, tax, discount, total, itemCount, isLoading, error } = useSelector(state => state.cart);
  const { isLoggedIn } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);
  
  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code');
      return;
    }
    
    setIsApplyingDiscount(true);
    try {
      await dispatch(verifyDiscount(discountCode)).unwrap();
      toast.success('Discount applied successfully');
    } catch (error) {
      toast.error(error || 'Invalid discount code');
    } finally {
      setIsApplyingDiscount(false);
    }
  };
  
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
      toast.info('Cart cleared');
    }
  };
  
  const proceedToCheckout = () => {
    if (isLoggedIn) {
      navigate('/checkout');
    } else {
      toast.info('Please log in to proceed to checkout', {
        onClick: () => navigate('/login', { state: { from: '/checkout' } })
      });
      navigate('/login', { state: { from: '/checkout' } });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your cart...</p>
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
  
  if (!items || items.length === 0) {
    return (
      <div className="container py-5">
        <div className="card text-center p-5">
          <h2 className="mb-4">Your cart is empty</h2>
          <p className="mb-4">Looks like you haven't added any products to your cart yet.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }
  
  return (
    <main className="main-content py-5">
      <div className="container">
        <h1 className="mb-4">Shopping Cart</h1>
        <div className="row">
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Cart Items ({itemCount})</h5>
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th className="text-end">Price</th>
                        <th>Quantity</th>
                        <th className="text-end">Total</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <CartItem key={item.productVariantId._id} item={item} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="d-flex justify-content-between">
              <Link to="/products" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i> Continue Shopping
              </Link>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card cart-summary">
              <div className="card-header">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
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
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <strong>Total:</strong>
                  <strong>{formatPrice(total)}</strong>
                </div>
                
                <form onSubmit={handleApplyDiscount} className="mb-3">
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Discount code" 
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                    />
                    <button 
                      className="btn btn-outline-primary" 
                      type="submit"
                      disabled={isApplyingDiscount}
                    >
                      {isApplyingDiscount ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Applying...
                        </>
                      ) : 'Apply'}
                    </button>
                  </div>
                </form>
                
                <button 
                  className="btn btn-primary btn-lg w-100"
                  onClick={proceedToCheckout}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;