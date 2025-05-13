// src/components/cart/CartItem.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateCartItem, removeCartItem } from '../../store/cart.slice';
import { formatPrice } from '../../utils/formatters';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(item.quantity);
  
  // Handle quantity changes with debounce
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0) {
      setQuantity(newQuantity);
      
      // Update the cart after a short delay to avoid too many requests
      const timer = setTimeout(() => {
        dispatch(updateCartItem({
          productVariantId: item.productVariantId._id,
          quantity: newQuantity
        }));
      }, 500);
      
      return () => clearTimeout(timer);
    }
  };
  
  const handleRemove = () => {
    dispatch(removeCartItem(item.productVariantId._id));
  };
  
  // Extract product info
  const product = item.productVariantId.productId;
  const variant = item.productVariantId;
  const mainImage = variant.images?.[0]?.imageUrl || "/api/placeholder/80/80";
  
  return (
    <tr>
      <td>
        <div className="d-flex align-items-center">
          <div className="cart-item-image me-3">
            <Link to={`/products/${product?.slug}`}>
              <img 
                src={mainImage} 
                alt={product?.name} 
                className="img-thumbnail" 
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
              />
            </Link>
          </div>
          <div className="cart-item-details">
            <h6 className="mb-1">
              <Link to={`/products/${product?.slug}`} className="text-decoration-none">
                {product?.name}
              </Link>
            </h6>
            <div className="text-muted small">
              <span>{variant.name}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="text-end">{formatPrice(item.price)}</td>
      <td>
        <div className="quantity-control">
          <input 
            type="number" 
            className="form-control form-control-sm" 
            min="1" 
            max={variant.inventory || 10}
            value={quantity}
            onChange={handleQuantityChange}
          />
        </div>
      </td>
      <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
      <td className="text-center">
        <button 
          className="btn btn-sm btn-outline-danger"
          onClick={handleRemove}
        >
          <i className="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  );
};

export default CartItem;