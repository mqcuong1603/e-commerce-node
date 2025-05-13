// src/pages/ProductDetailPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductBySlug } from '../store/product.slice';
import { addToCart } from '../store/cart.slice';
import ProductService from '../services/product.service';
import SocketService from '../services/socket.service';
import Rating from '../components/common/Rating';
import { formatPrice, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { currentProduct, isLoading, error } = useSelector((state) => state.product);
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPagination, setReviewPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });
  
  // New review form state
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    userName: isLoggedIn ? user?.fullName : ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Socket connection for real-time updates
  const socketInitialized = useRef(false);
  
  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
  }, [dispatch, slug]);
  
  useEffect(() => {
    if (currentProduct) {
      // Set default selected variant to the first one
      if (currentProduct.variants && currentProduct.variants.length > 0) {
        setSelectedVariant(currentProduct.variants[0]);
      }
      
      // Set default selected image
      if (currentProduct.images && currentProduct.images.length > 0) {
        const mainImage = currentProduct.images.find(img => img.isMain);
        setSelectedImage(mainImage || currentProduct.images[0]);
      }
      
      // Fetch product reviews
      fetchProductReviews();
      
      // Subscribe to review updates via socket
      if (!socketInitialized.current) {
        initializeSocket();
        socketInitialized.current = true;
      }
    }
    
    // Clean up socket connection
    return () => {
      if (socketInitialized.current) {
        SocketService.disconnectSocket();
        socketInitialized.current = false;
      }
    };
  }, [currentProduct]);
  
  // Update userName when user logs in
  useEffect(() => {
    if (isLoggedIn && user) {
      setNewReview(prev => ({ ...prev, userName: user.fullName }));
    }
  }, [isLoggedIn, user]);
  
  const initializeSocket = () => {
    SocketService.connectSocket();
    SocketService.subscribeToReviewUpdates(currentProduct._id, (data) => {
      // Add new review to the list without refetching
      if (data.action === 'new') {
        setReviews(prevReviews => [data.review, ...prevReviews]);
        
        // Update review count and pagination
        setReviewPagination(prev => ({
          ...prev,
          total: prev.total + 1,
          totalPages: Math.ceil((prev.total + 1) / prev.limit)
        }));
      }
    });
  };
  
  const fetchProductReviews = async (page = 1) => {
    if (!currentProduct || !currentProduct._id) return;
    
    setReviewsLoading(true);
    try {
      const response = await ProductService.getProductReviews(currentProduct._id, {
        page,
        limit: 5
      });
      
      setReviews(response.data.reviews);
      setReviewPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };
  
  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    // Reset quantity to 1 when changing variants
    setQuantity(1);
  };
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && selectedVariant && value <= selectedVariant.inventory) {
      setQuantity(value);
    }
  };
  
  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }
    
    dispatch(addToCart({ 
      productVariantId: selectedVariant._id, 
      quantity 
    }))
      .unwrap()
      .then(() => {
        toast.success(`${currentProduct.name} added to cart!`);
      })
      .catch((error) => {
        toast.error(error || 'Failed to add product to cart');
      });
  };
  
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRatingChange = (rating) => {
    setNewReview(prev => ({ ...prev, rating }));
  };
  
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    // Validate rating (must be done even if user doesn't click stars)
    if (!isLoggedIn && !newReview.userName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    setSubmittingReview(true);
    try {
      const reviewData = {
        rating: newReview.rating,
        comment: newReview.comment,
        userName: newReview.userName
      };
      
      const response = await ProductService.addProductReview(currentProduct._id, reviewData);
      
      // Update UI with new review
      setReviews(prevReviews => [response.data, ...prevReviews]);
      
      // Reset form
      setNewReview({
        rating: 5,
        comment: '',
        userName: isLoggedIn ? user?.fullName : ''
      });
      
      // Emit new review event via socket
      SocketService.emitNewReview({
        action: 'new',
        productId: currentProduct._id,
        review: response.data
      });
      
      toast.success('Review submitted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };
  
  const handleReviewPageChange = (page) => {
    setReviewPagination(prev => ({ ...prev, page }));
    fetchProductReviews(page);
  };
  
  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading product details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <div className="text-center mt-3">
          <Link to="/products" className="btn btn-primary">Back to Products</Link>
        </div>
      </div>
    );
  }
  
  if (!currentProduct) {
    return (
      <div className="container py-5 text-center">
        <h2>Product not found</h2>
        <p>The product you are looking for may have been removed or does not exist.</p>
        <Link to="/products" className="btn btn-primary mt-3">Browse Products</Link>
      </div>
    );
  }
  
  return (
    <main className="main-content py-5">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/products">Products</Link>
            </li>
            {currentProduct.categories?.length > 0 && (
              <li className="breadcrumb-item">
                <Link to={`/products/category/${currentProduct.categories[0].slug}`}>
                  {currentProduct.categories[0].name}
                </Link>
              </li>
            )}
            <li className="breadcrumb-item active" aria-current="page">
              {currentProduct.name}
            </li>
          </ol>
        </nav>
        
        <div className="row">
          {/* Product Images */}
          <div className="col-md-6 mb-4">
            <div className="product-images">
              <div className="main-image mb-3">
                <img 
                  src={selectedImage?.imageUrl || "/api/placeholder/600/400"} 
                  alt={currentProduct.name}
                  className="img-fluid" 
                  style={{ width: '100%', height: '400px', objectFit: 'contain' }}
                />
              </div>
              <div className="thumbnail-images d-flex">
                {currentProduct.images?.map((image, index) => (
                  <div 
                    key={index}
                    className={`thumbnail me-2 ${selectedImage?._id === image._id ? 'border border-primary' : 'border'}`}
                    onClick={() => setSelectedImage(image)}
                    style={{ cursor: 'pointer', width: '80px', height: '80px' }}
                  >
                    <img 
                      src={image.imageUrl} 
                      alt={`${currentProduct.name} view ${index + 1}`}
                      className="img-fluid" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="col-md-6 mb-4">
            <div className="product-details">
              <h1 className="mb-2">{currentProduct.name}</h1>
              
              <div className="d-flex align-items-center mb-3">
                <Rating value={currentProduct.averageRating || 0} size="md" />
                <span className="ms-2">
                  {currentProduct.averageRating?.toFixed(1) || "0.0"} ({currentProduct.reviewCount || 0} reviews)
                </span>
              </div>
              
              <p className="text-muted mb-3">Brand: {currentProduct.brand}</p>
              
              <div className="mb-4">
                {selectedVariant ? (
                  <>
                    <div className="product-price mb-2">
                      {selectedVariant.salePrice ? (
                        <>
                          <span className="text-decoration-line-through text-muted me-2">
                            {formatPrice(selectedVariant.price)}
                          </span>
                          <span className="fw-bold fs-4 text-danger">
                            {formatPrice(selectedVariant.salePrice)}
                          </span>
                        </>
                      ) : (
                        <span className="fw-bold fs-4">
                          {formatPrice(selectedVariant.price)}
                        </span>
                      )}
                    </div>
                    
                    <div className="product-stock mb-2">
                      {selectedVariant.inventory > 0 ? (
                        <span className="badge bg-success">In Stock ({selectedVariant.inventory} available)</span>
                      ) : (
                        <span className="badge bg-danger">Out of Stock</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="product-price mb-2">
                    <span className="fw-bold fs-4">
                      {formatPrice(currentProduct.basePrice)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h5 className="mb-2">Variants</h5>
                <div className="d-flex flex-wrap">
                  {currentProduct.variants?.map(variant => (
                    <button
                      key={variant._id}
                      type="button"
                      className={`btn ${selectedVariant?._id === variant._id ? 'btn-primary' : 'btn-outline-secondary'} me-2 mb-2`}
                      onClick={() => handleVariantChange(variant)}
                      disabled={!variant.isActive || variant.inventory <= 0}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {selectedVariant && selectedVariant.inventory > 0 && (
                <div className="mb-4">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <label htmlFor="quantity" className="form-label mb-0">Quantity</label>
                    </div>
                    <div style={{ width: '100px' }}>
                      <input
                        type="number"
                        className="form-control"
                        id="quantity"
                        min="1"
                        max={selectedVariant.inventory}
                        value={quantity}
                        onChange={handleQuantityChange}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.inventory <= 0}
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  Add to Cart
                </button>
              </div>
              
              <div className="mb-4">
                <h5 className="mb-2">Short Description</h5>
                <p>{currentProduct.shortDescription}</p>
              </div>
              
              {selectedVariant && selectedVariant.attributes && (
                <div className="mb-4">
                  <h5 className="mb-2">Specifications</h5>
                  <table className="table table-sm table-striped">
                    <tbody>
                      {Object.entries(selectedVariant.attributes).map(([key, value]) => (
                        <tr key={key}>
                          <td className="fw-bold">{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Product Info Tabs */}
        <div className="product-info mt-5">
          <ul className="nav nav-tabs mb-4" id="productTab" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'description' ? 'active' : ''}`}
                id="description-tab"
                onClick={() => setActiveTab('description')}
                type="button"
                role="tab"
              >
                Description
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                id="reviews-tab"
                onClick={() => setActiveTab('reviews')}
                type="button"
                role="tab"
              >
                Reviews ({currentProduct.reviewCount || 0})
              </button>
            </li>
          </ul>
          
          <div className="tab-content" id="productTabContent">
            {/* Description Tab */}
            <div
              className={`tab-pane fade ${activeTab === 'description' ? 'show active' : ''}`}
              id="description"
              role="tabpanel"
            >
              <div className="card">
                <div className="card-body">
                  <p className="card-text" style={{ whiteSpace: 'pre-line' }}>{currentProduct.description}</p>
                </div>
              </div>
            </div>
            
            {/* Reviews Tab */}
            <div
              className={`tab-pane fade ${activeTab === 'reviews' ? 'show active' : ''}`}
              id="reviews"
              role="tabpanel"
            >
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Write a Review</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleReviewSubmit}>
                    {!isLoggedIn && (
                      <div className="mb-3">
                        <label htmlFor="userName" className="form-label">Your Name*</label>
                        <input
                          type="text"
                          className="form-control"
                          id="userName"
                          name="userName"
                          value={newReview.userName}
                          onChange={handleReviewChange}
                          required
                        />
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <label className="form-label d-block">Your Rating*</label>
                      <Rating
                        value={newReview.rating}
                        onChange={handleRatingChange}
                        size="lg"
                      />
                      {isLoggedIn ? (
                        <small className="form-text text-muted d-block mt-1">
                          You are posting as {user.fullName}
                        </small>
                      ) : (
                        <small className="form-text text-muted d-block mt-1">
                          Login to verify your purchase
                        </small>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="comment" className="form-label">Your Review</label>
                      <textarea
                        className="form-control"
                        id="comment"
                        name="comment"
                        rows="4"
                        value={newReview.comment}
                        onChange={handleReviewChange}
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submittingReview || (!isLoggedIn && !newReview.userName)}
                    >
                      {submittingReview ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : 'Submit Review'}
                    </button>
                  </form>
                </div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Customer Reviews</h5>
                </div>
                <div className="card-body">
                  {reviewsLoading ? (
                    <div className="text-center py-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading reviews...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-3">
                      <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                  ) : (
                    <>
                      {reviews.map(review => (
                        <div key={review._id} className="review mb-4 pb-4 border-bottom">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <h6 className="mb-0">{review.userName}</h6>
                              <small className="text-muted">
                                {formatDate(review.createdAt)}
                                {review.isVerifiedPurchase && (
                                  <span className="badge bg-success ms-2">Verified Purchase</span>
                                )}
                              </small>
                            </div>
                            <Rating value={review.rating} />
                          </div>
                          {review.comment && (
                            <p className="mb-0">{review.comment}</p>
                          )}
                        </div>
                      ))}
                      
                      {reviewPagination.totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                          <nav aria-label="Review pagination">
                            <ul className="pagination">
                              <li className={`page-item ${reviewPagination.page === 1 ? 'disabled' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => handleReviewPageChange(reviewPagination.page - 1)}
                                  disabled={reviewPagination.page === 1}
                                >
                                  Previous
                                </button>
                              </li>
                              
                              {Array.from({ length: reviewPagination.totalPages }, (_, i) => (
                                <li
                                  key={i + 1}
                                  className={`page-item ${reviewPagination.page === i + 1 ? 'active' : ''}`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => handleReviewPageChange(i + 1)}
                                  >
                                    {i + 1}
                                  </button>
                                </li>
                              ))}
                              
                              <li className={`page-item ${reviewPagination.page === reviewPagination.totalPages ? 'disabled' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => handleReviewPageChange(reviewPagination.page + 1)}
                                  disabled={reviewPagination.page === reviewPagination.totalPages}
                                >
                                  Next
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetailPage;