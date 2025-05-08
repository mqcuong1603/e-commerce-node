// src/js/product-detail.js
import { productAPI, cartAPI, reviewAPI } from './api/index.js';
import { showToast, generateStarRating, formatPrice } from './utils.js';
import Swal from 'sweetalert2';

// DOM element references
const productContainer = document.getElementById('product-detail');
const productImagesContainer = document.getElementById('product-images');
const productInfoContainer = document.getElementById('product-info');
const productDescriptionContainer = document.getElementById('product-description');
const productVariantsContainer = document.getElementById('product-variants');
const productReviewsContainer = document.getElementById('product-reviews');
const breadcrumbContainer = document.getElementById('breadcrumb');

// Current product data
let currentProduct = null;
let currentVariant = null;

/**
 * Initialize product detail page
 */
export async function initProductDetail() {
  // Get product slug from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productSlug = urlParams.get('slug');
  
  if (!productSlug) {
    // Redirect to products page if no slug provided
    window.location.href = 'products.html';
    return;
  }
  
  try {
    // Load product details
    const response = await productAPI.getProductBySlug(productSlug);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to load product details');
    }
    
    // Store product data
    currentProduct = response.data;
    window.currentProductId = currentProduct._id; // For real-time updates
    
    // Set page title
    document.title = `${currentProduct.name} - Computer Components Store`;
    
    // Render product sections
    renderBreadcrumb();
    renderProductImages();
    renderProductInfo();
    renderProductDescription();
    renderProductVariants();
    renderProductReviews();
    
    // Setup event listeners
    setupReviewForm();
    
  } catch (error) {
    console.error('Failed to load product details:', error);
    
    // Show error message
    if (productContainer) {
      productContainer.innerHTML = `
        <div class="alert alert-danger my-5" role="alert">
          <h4 class="alert-heading">Failed to load product details</h4>
          <p>${error.message || 'The product may no longer be available.'}</p>
          <hr>
          <p class="mb-0">Please try again later or <a href="products.html" class="alert-link">browse our other products</a>.</p>
        </div>
      `;
    }
  }
}

/**
 * Render breadcrumb navigation
 */
function renderBreadcrumb() {
  if (!breadcrumbContainer || !currentProduct) return;
  
  let html = `
    <li class="breadcrumb-item"><a href="index.html">Home</a></li>
    <li class="breadcrumb-item"><a href="products.html">Products</a></li>
  `;
  
  // Add category if available
  if (currentProduct.categories && currentProduct.categories.length > 0) {
    const category = currentProduct.categories[0];
    html += `
      <li class="breadcrumb-item">
        <a href="products.html?category=${category.slug}">${category.name}</a>
      </li>
    `;
  }
  
  // Add product name
  html += `<li class="breadcrumb-item active" aria-current="page">${currentProduct.name}</li>`;
  
  breadcrumbContainer.innerHTML = html;
}

/**
 * Render product images
 */
function renderProductImages() {
  if (!productImagesContainer || !currentProduct) return;
  
  const images = currentProduct.images || [];
  
  // If no images, show placeholder
  if (images.length === 0) {
    productImagesContainer.innerHTML = `
      <div class="text-center mb-3">
        <img src="/images/placeholder.jpg" alt="${currentProduct.name}" class="img-fluid main-product-image">
      </div>
    `;
    return;
  }
  
  // Find main image or use first one
  const mainImage = images.find(img => img.isMain) || images[0];
  
  // Generate thumbnails HTML
  let thumbnailsHtml = '';
  images.forEach(image => {
    thumbnailsHtml += `
      <div class="col">
        <img src="${image.imageUrl}" alt="${image.alt || currentProduct.name}" 
             class="img-thumbnail product-thumbnail ${image._id === mainImage._id ? 'active' : ''}" 
             data-image-url="${image.imageUrl}">
      </div>
    `;
  });
  
  // Render images
  productImagesContainer.innerHTML = `
    <div class="text-center mb-3">
      <img src="${mainImage.imageUrl}" alt="${mainImage.alt || currentProduct.name}" class="img-fluid main-product-image">
    </div>
    <div class="row row-cols-5 g-2">
      ${thumbnailsHtml}
    </div>
  `;
  
  // Setup thumbnail click handlers
  setupThumbnailClicks();
}

/**
 * Setup thumbnail click handlers
 */
function setupThumbnailClicks() {
  const thumbnails = document.querySelectorAll('.product-thumbnail');
  
  thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', function() {
      // Update main image
      const mainImage = document.querySelector('.main-product-image');
      if (mainImage) {
        mainImage.src = this.getAttribute('data-image-url');
      }
      
      // Update active class
      thumbnails.forEach(thumb => thumb.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

/**
 * Render product information
 */
function renderProductInfo() {
  if (!productInfoContainer || !currentProduct) return;
  
  // Get first variant
  const variants = currentProduct.variants || [];
  currentVariant = variants.length > 0 ? variants[0] : null;
  
  if (!currentVariant) {
    productInfoContainer.innerHTML = `
      <div class="alert alert-warning" role="alert">
        Product information is not available.
      </div>
    `;
    return;
  }
  
  // Check if variant is on sale
  const isSale = currentVariant.salePrice && currentVariant.salePrice < currentVariant.price;
  const price = isSale ? currentVariant.salePrice : currentVariant.price;
  
  // Format price display
  const priceHtml = isSale ? 
    `<span class="text-muted text-decoration-line-through">${formatPrice(currentVariant.price)}</span>
     <span class="fs-3 text-danger">${formatPrice(price)}</span>` : 
    `<span class="fs-3">${formatPrice(price)}</span>`;
  
  // Check if product is in stock
  const isAvailable = currentVariant.inStock || (currentVariant.inventory > 0);
  
  productInfoContainer.innerHTML = `
    <h2 class="mb-2">${currentProduct.name}</h2>
    <div class="mb-2">
      ${generateStarRating(currentProduct.averageRating || 0)}
      <span class="ms-2">${currentProduct.averageRating.toFixed(1)} stars (${currentProduct.reviewCount} reviews)</span>
    </div>
    <p class="text-muted mb-3">Brand: ${currentProduct.brand}</p>
    <p class="mb-4">${currentProduct.shortDescription}</p>
    
    <div class="mb-3">
      <div class="fw-bold fs-5">Price:</div>
      <div class="mb-2">${priceHtml}</div>
    </div>
    
    <div class="mb-4">
      <div class="fw-bold">Availability:</div>
      ${isAvailable ? 
        `<span class="text-success">In Stock (${currentVariant.inventory} available)</span>` : 
        '<span class="text-danger">Out of Stock</span>'
      }
    </div>
    
    <div class="mb-4">
      <label for="quantity" class="form-label fw-bold">Quantity:</label>
      <div class="input-group" style="max-width: 150px;">
        <button class="btn btn-outline-secondary decrease-quantity" type="button">-</button>
        <input type="number" class="form-control text-center" id="quantity" value="1" min="1" max="${isAvailable ? currentVariant.inventory : 1}">
        <button class="btn btn-outline-secondary increase-quantity" type="button">+</button>
      </div>
    </div>
    
    <div>
      <button class="btn btn-primary btn-lg add-to-cart ${!isAvailable ? 'disabled' : ''}" 
              data-variant-id="${currentVariant._id}">
        <i class="bi bi-cart-plus"></i> Add to Cart
      </button>
    </div>
  `;
  
  // Setup quantity buttons
  setupQuantityButtons();
  
  // Setup add to cart button
  setupAddToCartButton();
}

/**
 * Setup quantity increase/decrease buttons
 */
function setupQuantityButtons() {
  const quantityInput = document.getElementById('quantity');
  const decreaseBtn = document.querySelector('.decrease-quantity');
  const increaseBtn = document.querySelector('.increase-quantity');
  
  if (!quantityInput || !decreaseBtn || !increaseBtn) return;
  
  decreaseBtn.addEventListener('click', function() {
    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });
  
  increaseBtn.addEventListener('click', function() {
    const currentValue = parseInt(quantityInput.value);
    const max = parseInt(quantityInput.getAttribute('max'));
    
    if (currentValue < max) {
      quantityInput.value = currentValue + 1;
    }
  });
}

/**
 * Setup add to cart button
 */
function setupAddToCartButton() {
  const addToCartBtn = document.querySelector('.add-to-cart:not(.disabled)');
  if (!addToCartBtn) return;
  
  addToCartBtn.addEventListener('click', async function() {
    const variantId = this.getAttribute('data-variant-id');
    const quantity = parseInt(document.getElementById('quantity').value);
    
    // Validate quantity
    if (isNaN(quantity) || quantity < 1) {
      showToast('Error', 'Please enter a valid quantity.', 'error');
      return;
    }
    
    try {
      // Disable button during request
      this.disabled = true;
      this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...';
      
      // Add to cart
      const response = await cartAPI.addItemToCart(variantId, quantity);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to add item to cart');
      }
      
      // Update cart count
      const cartCount = response.data.items.length;
      updateCartCount(cartCount);
      
      // Re-enable button
      this.disabled = false;
      this.innerHTML = '<i class="bi bi-cart-plus"></i> Add to Cart';
      
      // Show success message
      Swal.fire({
        title: 'Added to Cart!',
        text: `${quantity} ${quantity > 1 ? 'items' : 'item'} of ${currentProduct.name} has been added to your cart.`,
        icon: 'success',
        confirmButtonText: 'Continue Shopping',
        showCancelButton: true,
        cancelButtonText: 'View Cart'
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
          window.location.href = 'cart.html';
        }
      });
      
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      
      // Re-enable button
      this.disabled = false;
      this.innerHTML = '<i class="bi bi-cart-plus"></i> Add to Cart';
      
      // Show error message
      showToast('Error', error.message || 'Failed to add item to cart.', 'error');
    }
  });
}

/**
 * Render product description
 */
function renderProductDescription() {
  if (!productDescriptionContainer || !currentProduct) return;
  
  productDescriptionContainer.innerHTML = `
    <h3>Product Description</h3>
    <div class="product-description">
      ${currentProduct.description.replace(/\n/g, '<br>')}
    </div>
  `;
}

/**
 * Render product variants
 */
function renderProductVariants() {
  if (!productVariantsContainer || !currentProduct) return;
  
  const variants = currentProduct.variants || [];
  
  if (variants.length <= 1) {
    productVariantsContainer.innerHTML = '';
    return;
  }
  
  let html = `
    <h3 class="mb-3">Available Variants</h3>
    <div class="list-group">
  `;
  
  variants.forEach(variant => {
    // Check if variant is available
    const isAvailable = variant.inStock || (variant.inventory > 0);
    
    // Check if variant is on sale
    const isSale = variant.salePrice && variant.salePrice < variant.price;
    const price = isSale ? variant.salePrice : variant.price;
    
    // Format price display
    const priceHtml = isSale ? 
      `<span class="text-muted text-decoration-line-through">${formatPrice(variant.price)}</span>
       <span class="text-danger ms-2">${formatPrice(price)}</span>` : 
      `<span>${formatPrice(price)}</span>`;
    
    // Build attributes list
    let attributesHtml = '';
    if (variant.attributes && Object.keys(variant.attributes).length > 0) {
      attributesHtml = '<ul class="mb-0">';
      for (const [key, value] of Object.entries(variant.attributes)) {
        attributesHtml += `<li>${key}: ${value}</li>`;
      }
      attributesHtml += '</ul>';
    }
    
    html += `
      <div class="list-group-item d-flex justify-content-between align-items-start ${!isAvailable ? 'text-muted' : ''}">
        <div class="ms-2 me-auto">
          <div class="fw-bold">${variant.name}</div>
          <div class="small">SKU: ${variant.sku}</div>
          ${attributesHtml}
        </div>
        <div class="text-end">
          <div>${priceHtml}</div>
          <div class="mt-1">
            ${isAvailable ? 
              `<button class="btn btn-sm btn-outline-primary select-variant" 
                      data-variant-id="${variant._id}"
                      data-variant-name="${variant.name}"
                      data-variant-price="${price}"
                      data-variant-inventory="${variant.inventory}">
                Select
              </button>` : 
              '<span class="badge bg-danger">Out of Stock</span>'
            }
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  productVariantsContainer.innerHTML = html;
  
  // Setup variant selection buttons
  setupVariantSelection();
}

/**
 * Setup variant selection buttons
 */
function setupVariantSelection() {
  const variantButtons = document.querySelectorAll('.select-variant');
  
  variantButtons.forEach(button => {
    button.addEventListener('click', function() {
      const variantId = this.getAttribute('data-variant-id');
      const variantName = this.getAttribute('data-variant-name');
      const variantPrice = this.getAttribute('data-variant-price');
      const inventory = this.getAttribute('data-variant-inventory');
      
      // Find selected variant
      const variant = currentProduct.variants.find(v => v._id === variantId);
      if (!variant) return;
      
      // Update current variant
      currentVariant = variant;
      
      // Update add to cart button
      const addToCartBtn = document.querySelector('.add-to-cart');
      if (addToCartBtn) {
        addToCartBtn.setAttribute('data-variant-id', variantId);
        addToCartBtn.classList.remove('disabled');
      }
      
      // Update quantity max value
      const quantityInput = document.getElementById('quantity');
      if (quantityInput) {
        quantityInput.setAttribute('max', inventory);
        
        // Reset quantity if current value exceeds inventory
        if (parseInt(quantityInput.value) > parseInt(inventory)) {
          quantityInput.value = 1;
        }
      }
      
      // Update price display
      const priceElement = document.querySelector('.mb-3:nth-child(3)');
      if (priceElement) {
        const isSale = variant.salePrice && variant.salePrice < variant.price;
        const price = isSale ? variant.salePrice : variant.price;
        
        const priceHtml = isSale ? 
          `<span class="text-muted text-decoration-line-through">${formatPrice(variant.price)}</span>
           <span class="fs-3 text-danger">${formatPrice(price)}</span>` : 
          `<span class="fs-3">${formatPrice(price)}</span>`;
        
        priceElement.innerHTML = `
          <div class="fw-bold fs-5">Price:</div>
          <div class="mb-2">${priceHtml}</div>
        `;
      }
      
      // Update availability info
      const availabilityElement = document.querySelector('.mb-4:nth-child(4)');
      if (availabilityElement) {
        availabilityElement.innerHTML = `
          <div class="fw-bold">Availability:</div>
          <span class="text-success">In Stock (${inventory} available)</span>
        `;
      }
      
      // Show selected variant notification
      showToast('Success', `Selected: ${variantName}`, 'success');
    });
  });
}

/**
 * Render product reviews
 */
function renderProductReviews() {
  if (!productReviewsContainer || !currentProduct) return;
  
  const reviews = currentProduct.reviews || [];
  
  // If no reviews, show message
  if (reviews.length === 0) {
    productReviewsContainer.innerHTML = `
      <div class="alert alert-info" role="alert">
        <i class="bi bi-info-circle-fill me-2"></i>
        No reviews yet. Be the first to leave a review!
      </div>
    `;
    return;
  }
  
  let html = '<h3 class="mb-3">Customer Reviews</h3>';
  
  // Rating summary
  html += `
    <div class="d-flex align-items-center mb-4">
      <div class="me-3">
        <span class="display-4 fw-bold">${currentProduct.averageRating.toFixed(1)}</span>
        <span class="text-muted">/ 5</span>
      </div>
      <div>
        <div class="mb-1">${generateStarRating(currentProduct.averageRating)}</div>
        <p class="mb-0 text-muted">${currentProduct.reviewCount} customer ${currentProduct.reviewCount === 1 ? 'review' : 'reviews'}</p>
      </div>
    </div>
    <hr>
  `;
  
  // Reviews list
  reviews.forEach(review => {
    html += `
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="card-title mb-0">${review.userName}</h5>
            <div>
              ${generateStarRating(review.rating)}
              <small class="text-muted ms-2">${formatDate(review.createdAt)}</small>
            </div>
          </div>
          <p class="card-text">${review.comment}</p>
          ${review.isVerifiedPurchase ? 
            '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Verified Purchase</span>' : ''}
        </div>
      </div>
    `;
  });
  
  productReviewsContainer.innerHTML = html;
}

/**
 * Setup review form submission
 */
function setupReviewForm() {
  const reviewForm = document.getElementById('review-form');
  if (!reviewForm || !currentProduct) return;
  
  // Setup star rating input display
  const ratingInputs = document.querySelectorAll('input[name="rating"]');
  ratingInputs.forEach(input => {
    input.addEventListener('change', function() {
      const ratingValue = document.querySelector('.rating-value');
      if (ratingValue) {
        ratingValue.textContent = this.value;
      }
    });
  });
  
  // Form submission
  reviewForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(reviewForm);
    const rating = parseInt(formData.get('rating')) || 5;
    const comment = formData.get('comment');
    const userName = formData.get('userName') || 'Anonymous';
    
    if (!comment) {
      showToast('Error', 'Please enter a review comment.', 'error');
      return;
    }
    
    try {
      // Submit review
      const response = await reviewAPI.addReview(currentProduct._id, {
        rating,
        comment,
        userName
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to submit review');
      }
      
      // Add review to UI
      addReviewToUI(response.data);
      
      // Reset form
      reviewForm.reset();
      
      // Show success message
      showToast('Success', 'Your review has been submitted successfully!', 'success');
      
    } catch (error) {
      console.error('Failed to submit review:', error);
      
      // Check if unauthorized
      if (error.status === 401) {
        Swal.fire({
          title: 'Login Required',
          text: 'You need to log in to leave a review. Do you want to log in now?',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Login',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirect to login page with redirect back to product page
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `login.html?redirect=${currentUrl}`;
          }
        });
      } else {
        // Other error
        showToast('Error', error.message || 'Failed to submit review.', 'error');
      }
    }
  });
}

/**
 * Add a new review to UI
 * @param {Object} review - Review data
 */
export function addReviewToUI(review) {
  if (!productReviewsContainer) return;
  
  // Check if no reviews message is displayed
  const noReviewsMessage = productReviewsContainer.querySelector('.alert');
  
  if (noReviewsMessage) {
    // Replace no reviews message with review section
    productReviewsContainer.innerHTML = `
      <h3 class="mb-3">Customer Reviews</h3>
      <div class="d-flex align-items-center mb-4">
        <div class="me-3">
          <span class="display-4 fw-bold">${review.rating.toFixed(1)}</span>
          <span class="text-muted">/ 5</span>
        </div>
        <div>
          <div class="mb-1">${generateStarRating(review.rating)}</div>
          <p class="mb-0 text-muted">1 customer review</p>
        </div>
      </div>
      <hr>
    `;
  }
  
  // Create review card
  const reviewCard = document.createElement('div');
  reviewCard.className = 'card mb-3';
  reviewCard.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="card-title mb-0">${review.userName}</h5>
        <div>
          ${generateStarRating(review.rating)}
          <small class="text-muted ms-2">${formatDate(review.createdAt)}</small>
        </div>
      </div>
      <p class="card-text">${review.comment}</p>
      ${review.isVerifiedPurchase ? 
        '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Verified Purchase</span>' : ''}
    </div>
  `;
  
  // Add to beginning of reviews list
  const reviewsList = productReviewsContainer.querySelector('.card');
  if (reviewsList) {
    productReviewsContainer.insertBefore(reviewCard, reviewsList);
  } else {
    productReviewsContainer.appendChild(reviewCard);
  }
  
  // Update review count in summary
  const reviewCountElement = productReviewsContainer.querySelector('.mb-0.text-muted');
  if (reviewCountElement) {
    const currentCount = parseInt(reviewCountElement.textContent.split(' ')[0]) || 0;
    const newCount = currentCount + 1;
    reviewCountElement.textContent = `${newCount} customer ${newCount === 1 ? 'review' : 'reviews'}`;
  }
}

/**
 * Update cart count
 * @param {number} count - Number of items in cart
 */
export function updateCartCount(count) {
  const cartCountElements = document.querySelectorAll('.cart-count');
  
  cartCountElements.forEach(element => {
    element.textContent = count;
    
    if (count > 0) {
      element.classList.remove('d-none');
    } else {
      element.classList.add('d-none');
    }
  });
}