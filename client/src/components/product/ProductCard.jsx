// src/components/product/ProductCard.jsx
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cart.slice';
import { formatPrice } from '../../utils/formatters';
import Rating from '../common/Rating';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  
  // Extract the main image or use a placeholder
  const mainImage = product.images?.find(img => img.isMain)?.imageUrl || "/api/placeholder/300/300";
  
  // Get the first variant for pricing and add-to-cart functionality
  const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  
  // Determine the price to display (sale price or regular price)
  const displayPrice = defaultVariant?.salePrice || defaultVariant?.price || product.basePrice;
  const originalPrice = defaultVariant?.salePrice ? defaultVariant.price : null;
  
  const handleAddToCart = () => {
    if (defaultVariant) {
      dispatch(addToCart({ 
        productVariantId: defaultVariant._id, 
        quantity: 1 
      }))
        .unwrap()
        .then(() => {
          toast.success(`${product.name} added to cart!`);
        })
        .catch((error) => {
          toast.error(error || 'Failed to add product to cart');
        });
    } else {
      // If the product has multiple variants, navigate to product detail
      window.location.href = `/products/${product.slug}`;
    }
  };
  
  return (
    <div className="card product-card h-100">
      {product.isNewProduct && (
        <div className="badge bg-primary position-absolute top-0 start-0 m-2">New</div>
      )}
      {originalPrice && (
        <div className="badge bg-danger position-absolute top-0 end-0 m-2">Sale</div>
      )}
      <Link to={`/products/${product.slug}`} className="card-img-wrap">
        <img 
          src={mainImage} 
          className="card-img-top" 
          alt={product.name} 
        />
      </Link>
      <div className="card-body d-flex flex-column">
        <h6 className="product-brand text-muted">{product.brand}</h6>
        <h5 className="card-title">
          <Link to={`/products/${product.slug}`} className="text-decoration-none">
            {product.name}
          </Link>
        </h5>
        <div className="mb-2">
          <Rating value={product.averageRating || 0} />
          <small className="ms-2 text-muted">
            ({product.reviewCount || 0} reviews)
          </small>
        </div>
        <div className="product-price mb-3">
          {originalPrice && (
            <span className="original-price text-muted text-decoration-line-through me-2">
              {formatPrice(originalPrice)}
            </span>
          )}
          <span className="current-price fw-bold">
            {formatPrice(displayPrice)}
          </span>
        </div>
        <div className="mt-auto">
          <button 
            className="btn btn-primary btn-sm w-100"
            onClick={handleAddToCart}
            disabled={!defaultVariant || defaultVariant.inventory <= 0}
          >
            {!defaultVariant || defaultVariant.inventory <= 0 ? (
              'Out of Stock'
            ) : product.variants?.length > 1 ? (
              'View Options'
            ) : (
              <>
                <i className="bi bi-cart-plus me-2"></i>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;