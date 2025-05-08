import Swal from 'sweetalert2';
import { productAPI, categoryAPI, reviewAPI } from './api.js';
import { generateStarRating } from './main.js';

// Setup product listing page
export function setupProductPage() {
  // Get query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categorySlug = urlParams.get('category');
  const searchQuery = urlParams.get('search');
  const page = parseInt(urlParams.get('page')) || 1;
  
  // Load products
  if (categorySlug) {
    loadProductsByCategory(categorySlug, page);
  } else {
    loadAllProducts(page, {
      search: searchQuery,
      minPrice: urlParams.get('minPrice'),
      maxPrice: urlParams.get('maxPrice'),
      brand: urlParams.get('brand'),
      sort: urlParams.get('sort')
    });
  }
  
  // Setup filter form
  setupFilterForm();
  
  // Setup sorting
  setupSorting();
}

// Load all products with filters
async function loadAllProducts(page = 1, filters = {}) {
  const productsContainer = document.getElementById('products-container');
  const productsTitle = document.getElementById('products-title');
  const pagination = document.getElementById('pagination');
  
  if (!productsContainer) return;
  
  try {
    // Show loading spinner
    productsContainer.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading products...</p>
      </div>
    `;
    
    // Fetch products
    const response = await productAPI.getAllProducts(page, 12, filters);
    const data = response.data.data;
    
    // Set page title
    if (productsTitle) {
      if (filters.search) {
        productsTitle.textContent = `Search Results: "${filters.search}"`;
      } else if (filters.brand) {
        productsTitle.textContent = `${filters.brand} Products`;
      } else {
        productsTitle.textContent = 'All Products';
      }
    }
    
    // Render products
    renderProducts(productsContainer, data.products, pagination, data.pagination);
    
    // Update URL with filters
    updateUrlWithFilters(filters, page);
    
  } catch (error) {
    console.error('Failed to load products:', error);
    
    productsContainer.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Failed to load products. Please try again later.
      </div>
    `;
  }
}

// Load products by category
async function loadProductsByCategory(categorySlug, page = 1) {
  const productsContainer = document.getElementById('products-container');
  const productsTitle = document.getElementById('products-title');
  const pagination = document.getElementById('pagination');
  
  if (!productsContainer) return;
  
  try {
    // Show loading spinner
    productsContainer.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading products...</p>
      </div>
    `;
    
    // Fetch category data
    const categoryResponse = await categoryAPI.getCategoryBySlug(categorySlug);
    const category = categoryResponse.data.data;
    
    // Set page title
    if (productsTitle) {
      productsTitle.textContent = category.name;
    }
    
    // Fetch products in this category
    const productsResponse = await productAPI.getProductsByCategory(categorySlug, page, 12);
    const data = productsResponse.data.data;
    
    // Render products
    renderProducts(productsContainer, data.products, pagination, data.pagination);
    
    // Update breadcrumb
    updateBreadcrumb(category);
    
  } catch (error) {
    console.error('Failed to load products by category:', error);
    
    productsContainer.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Failed to load products. Please try again later.
      </div>
    `;
  }
}

// Render products grid
function renderProducts(container, products, paginationContainer, paginationData) {
  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info" role="alert">
        No products found matching your criteria.
      </div>
    `;
    return;
  }
  
  let html = '<div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">';
  
  products.forEach(product => {
    // Get first variant and image
    const variant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    const image = product.images && product.images.length > 0 ? product.images[0] : null;
    
    if (variant) {
      html += `
        <div class="col">
          <div class="card h-100 product-card">
            <div class="badge-overlay">
              ${product.isNewProduct ? '<span class="badge bg-success">New</span>' : ''}
              ${product.isBestSeller ? '<span class="badge bg-danger">Best Seller</span>' : ''}
              ${variant.salePrice ? '<span class="badge bg-warning">Sale</span>' : ''}
            </div>
            <a href="product-detail.html?slug=${product.slug}">
              <img src="${image ? image.imageUrl : '/images/placeholder.jpg'}" 
                   class="card-img-top" alt="${product.name}">
            </a>
            <div class="card-body">
              <h5 class="card-title">${product.name}</h5>
              <div class="mb-2">
                ${generateStarRating(product.averageRating)}
                <small class="text-muted">(${product.reviewCount})</small>
              </div>
              <p class="card-text">${product.shortDescription}</p>
              <div class="d-flex justify-content-between align-items-center">
                <div class="price-block">
                  ${variant.salePrice ? 
                    `<span class="text-muted text-decoration-line-through">${variant.price.toFixed(2)}</span>
                     <span class="fs-5 text-danger">${variant.salePrice.toFixed(2)}</span>` : 
                    `<span class="fs-5">${variant.price.toFixed(2)}</span>`
                  }
                </div>
                <button class="btn btn-primary btn-sm add-to-cart" 
                        data-product-variant-id="${variant._id}" 
                        data-product-name="${product.name}"
                        data-product-price="${variant.salePrice || variant.price}">
                  <i class="bi bi-cart-plus"></i> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  });
  
  html += '</div>';
  
  // Add pagination if available
  if (paginationContainer && paginationData) {
    const { page, totalPages } = paginationData;
    
    if (totalPages > 1) {
      let paginationHtml = `
        <nav aria-label="Product pagination" class="mt-4">
          <ul class="pagination justify-content-center">
      `;
      
      // Previous page button
      if (paginationData.hasPrevPage) {
        paginationHtml += `
          <li class="page-item">
            <a class="page-link" href="#" data-page="${page - 1}">Previous</a>
          </li>
        `;
      } else {
        paginationHtml += `
          <li class="page-item disabled">
            <span class="page-link">Previous</span>
          </li>
        `;
      }
      
      // Page numbers
      const startPage = Math.max(1, page - 2);
      const endPage = Math.min(totalPages, page + 2);
      
      if (startPage > 1) {
        paginationHtml += `
          <li class="page-item">
            <a class="page-link" href="#" data-page="1">1</a>
          </li>
        `;
        
        if (startPage > 2) {
          paginationHtml += `
            <li class="page-item disabled">
              <span class="page-link">...</span>
            </li>
          `;
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        if (i === page) {
          paginationHtml += `
            <li class="page-item active">
              <span class="page-link">${i}</span>
            </li>
          `;
        } else {
          paginationHtml += `
            <li class="page-item">
              <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
          `;
        }
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          paginationHtml += `
            <li class="page-item disabled">
              <span class="page-link">...</span>
            </li>
          `;
        }
        
        paginationHtml += `
          <li class="page-item">
            <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
          </li>
        `;
      }
      
      // Next page button
      if (paginationData.hasNextPage) {
        paginationHtml += `
          <li class="page-item">
            <a class="page-link" href="#" data-page="${page + 1}">Next</a>
          </li>
        `;
      } else {
        paginationHtml += `
          <li class="page-item disabled">
            <span class="page-link">Next</span>
          </li>
        `;
      }
      
      paginationHtml += `
          </ul>
        </nav>
      `;
      
      paginationContainer.innerHTML = paginationHtml;
      
      // Set up pagination click handlers
      paginationContainer.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          
          const page = parseInt(this.getAttribute('data-page'));
          if (!page) return;
          
          // Get current filters from URL
          const urlParams = new URLSearchParams(window.location.search);
          const categorySlug = urlParams.get('category');
          
          if (categorySlug) {
            loadProductsByCategory(categorySlug, page);
          } else {
            loadAllProducts(page, {
              search: urlParams.get('search'),
              minPrice: urlParams.get('minPrice'),
              maxPrice: urlParams.get('maxPrice'),
              brand: urlParams.get('brand'),
              sort: urlParams.get('sort')
            });
          }
          
          // Scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    } else {
      paginationContainer.innerHTML = '';
    }
  }
  
  container.innerHTML = html;
  
  // Set up add to cart buttons
  setupAddToCartButtons();
}

// Update URL with filters
function updateUrlWithFilters(filters, page) {
  const urlParams = new URLSearchParams();
  
  // Add filters to URL
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      urlParams.set(key, value);
    }
  });
  
  // Add page number if not page 1
  if (page > 1) {
    urlParams.set('page', page);
  }
  
  // Update URL without reloading page
  const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
  window.history.pushState({ path: newUrl }, '', newUrl);
}

// Update breadcrumb with category info
function updateBreadcrumb(category) {
  const breadcrumb = document.getElementById('breadcrumb');
  if (!breadcrumb) return;
  
  let html = `
    <li class="breadcrumb-item"><a href="index.html">Home</a></li>
    <li class="breadcrumb-item"><a href="products.html">Products</a></li>
  `;
  
  if (category.parent) {
    html += `
      <li class="breadcrumb-item">
        <a href="products.html?category=${category.parent.slug}">${category.parent.name}</a>
      </li>
    `;
  }
  
  html += `<li class="breadcrumb-item active">${category.name}</li>`;
  
  breadcrumb.innerHTML = html;
}

// Setup filter form
function setupFilterForm() {
  const filterForm = document.getElementById('filter-form');
  if (!filterForm) return;
  
  // Load brands for filter
  loadBrands();
  
  filterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(filterForm);
    const filters = {
      search: formData.get('search'),
      minPrice: formData.get('minPrice'),
      maxPrice: formData.get('maxPrice'),
      brand: formData.get('brand'),
      sort: formData.get('sort') || document.getElementById('sort-select').value
    };
    
    // Load products with filters
    loadAllProducts(1, filters);
  });
  
  // Clear filters button
  const clearFiltersBtn = document.getElementById('clear-filters');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Reset form
      filterForm.reset();
      
      // Load all products without filters
      loadAllProducts();
    });
  }
}

// Load brands for filter
async function loadBrands() {
  const brandSelect = document.getElementById('brand-select');
  if (!brandSelect) return;
  
  try {
    // Get all products to extract brands (this should be a separate API endpoint in production)
    const response = await productAPI.getAllProducts(1, 100);
    const products = response.data.data.products;
    
    // Extract unique brands
    const brands = [...new Set(products.map(product => product.brand))];
    
    // Sort brands alphabetically
    brands.sort();
    
    // Add options
    let options = '<option value="">All Brands</option>';
    brands.forEach(brand => {
      options += `<option value="${brand}">${brand}</option>`;
    });
    
    brandSelect.innerHTML = options;
    
    // Set selected brand from URL if any
    const urlParams = new URLSearchParams(window.location.search);
    const selectedBrand = urlParams.get('brand');
    if (selectedBrand) {
      brandSelect.value = selectedBrand;
    }
    
  } catch (error) {
    console.error('Failed to load brands:', error);
  }
}

// Setup sorting functionality
function setupSorting() {
  const sortSelect = document.getElementById('sort-select');
  if (!sortSelect) return;
  
  // Set selected sort from URL if any
  const urlParams = new URLSearchParams(window.location.search);
  const selectedSort = urlParams.get('sort');
  if (selectedSort) {
    sortSelect.value = selectedSort;
  }
  
  sortSelect.addEventListener('change', function() {
    // Get current filters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const categorySlug = urlParams.get('category');
    
    if (categorySlug) {
      // For category pages, we need to reload with the sort parameter
      window.location.href = `products.html?category=${categorySlug}&sort=${this.value}`;
    } else {
      // For regular product pages, update the sort and reload products
      const filters = {
        search: urlParams.get('search'),
        minPrice: urlParams.get('minPrice'),
        maxPrice: urlParams.get('maxPrice'),
        brand: urlParams.get('brand'),
        sort: this.value
      };
      
      loadAllProducts(1, filters);
    }
  });
}

// Setup product detail page
export function setupProductDetailPage() {
  // Get product slug from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productSlug = urlParams.get('slug');
  
  if (!productSlug) {
    // Redirect to products page if no slug provided
    window.location.href = 'products.html';
    return;
  }
  
  // Load product details
  loadProductDetails(productSlug);
  
  // Setup review form
  setupReviewForm();
}

// Load product details
async function loadProductDetails(slug) {
  const productContainer = document.getElementById('product-detail');
  const productTitle = document.getElementById('product-title');
  const productImages = document.getElementById('product-images');
  const productInfo = document.getElementById('product-info');
  const productDescription = document.getElementById('product-description');
  const productVariants = document.getElementById('product-variants');
  const productReviews = document.getElementById('product-reviews');
  
  if (!productContainer) return;
  
  try {
    // Show loading spinner
    productContainer.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading product details...</p>
      </div>
    `;
    
    // Fetch product details
    const response = await productAPI.getProductBySlug(slug);
    const product = response.data.data;
    
    // Store product ID globally for reviews
    window.currentProductId = product._id;
    
    // Set page title
    document.title = `${product.name} - Computer Store`;
    if (productTitle) {
      productTitle.textContent = product.name;
    }
    
    // Render product images
    if (productImages) {
      renderProductImages(productImages, product.images);
    }
    
    // Render product info
    if (productInfo) {
      renderProductInfo(productInfo, product);
    }
    
    // Render product description
    if (productDescription) {
      productDescription.innerHTML = `
        <h3>Product Description</h3>
        <div class="product-description">
          ${product.description.replace(/\n/g, '<br>')}
        </div>
      `;
    }
    
    // Render product variants
    if (productVariants && product.variants && product.variants.length > 0) {
      renderProductVariants(productVariants, product.variants, product.name);
    }
    
    // Render product reviews
    if (productReviews && product.reviews) {
      renderProductReviews(productReviews, product.reviews);
    }
    
    // Update breadcrumb
    updateProductBreadcrumb(product);
    
  } catch (error) {
    console.error('Failed to load product details:', error);
    
    productContainer.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Failed to load product details. Please try again later.
      </div>
    `;
  }
}

// Render product images
function renderProductImages(container, images) {
  if (!images || images.length === 0) {
    container.innerHTML = `
      <div class="text-center">
        <img src="/images/placeholder.jpg" alt="Product" class="img-fluid main-product-image">
      </div>
    `;
    return;
  }
  
  // Get main image
  const mainImage = images.find(img => img.isMain) || images[0];
  
  let thumbnailsHtml = '';
  images.forEach(image => {
    thumbnailsHtml += `
      <div class="col">
        <img src="${image.imageUrl}" alt="Thumbnail" 
             class="img-thumbnail product-thumbnail ${image._id === mainImage._id ? 'active' : ''}" 
             data-image-url="${image.imageUrl}">
      </div>
    `;
  });
  
  container.innerHTML = `
    <div class="text-center mb-3">
      <img src="${mainImage.imageUrl}" alt="Product" class="img-fluid main-product-image">
    </div>
    <div class="row row-cols-5 g-2">
      ${thumbnailsHtml}
    </div>
  `;
  
  // Set up thumbnail click handlers
  container.querySelectorAll('.product-thumbnail').forEach(thumbnail => {
    thumbnail.addEventListener('click', function() {
      // Update main image
      container.querySelector('.main-product-image').src = this.getAttribute('data-image-url');
      
      // Update active class
      container.querySelectorAll('.product-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
      });
      this.classList.add('active');
    });
  });
}

// Render product info
function renderProductInfo(container, product) {
  // Get first variant
  const variant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  
  if (!variant) {
    container.innerHTML = `
      <div class="alert alert-warning" role="alert">
        Product information unavailable.
      </div>
    `;
    return;
  }
  
  // Format price display
  const priceHtml = variant.salePrice ? 
    `<span class="text-muted text-decoration-line-through">${variant.price.toFixed(2)}</span>
     <span class="fs-3 text-danger">${variant.salePrice.toFixed(2)}</span>` : 
    `<span class="fs-3">${variant.price.toFixed(2)}</span>`;
  
  // Check availability
  const isAvailable = variant.inventory > 0;
  
  container.innerHTML = `
    <h2 class="mb-2">${product.name}</h2>
    <div class="mb-2">
      ${generateStarRating(product.averageRating)}
      <span class="ms-2">${product.averageRating.toFixed(1)} stars (${product.reviewCount} reviews)</span>
    </div>
    <p class="text-muted mb-3">Brand: ${product.brand}</p>
    <p class="mb-4">${product.shortDescription}</p>
    
    <div class="mb-3">
      <div class="fw-bold fs-5">Price:</div>
      <div class="mb-2">${priceHtml}</div>
    </div>
    
    <div class="mb-4">
      <div class="fw-bold">Availability:</div>
      ${isAvailable ? 
        `<span class="text-success">In Stock (${variant.inventory} available)</span>` : 
        '<span class="text-danger">Out of Stock</span>'
      }
    </div>
    
    <div class="mb-4">
      <label for="quantity" class="form-label fw-bold">Quantity:</label>
      <div class="input-group" style="max-width: 150px;">
        <button class="btn btn-outline-secondary decrease-quantity" type="button">-</button>
        <input type="number" class="form-control text-center" id="quantity" value="1" min="1" max="99">
        <button class="btn btn-outline-secondary increase-quantity" type="button">+</button>
      </div>
    </div>
    
    <div>
      <button class="btn btn-primary btn-lg add-to-cart ${!isAvailable ? 'disabled' : ''}" 
              data-product-variant-id="${variant._id}" 
              data-product-name="${product.name}"
              data-product-price="${variant.salePrice || variant.price}">
        <i class="bi bi-cart-plus"></i> Add to Cart
      </button>
    </div>
  `;
  
  // Set up quantity buttons
  const quantityInput = container.querySelector('#quantity');
  
  container.querySelector('.decrease-quantity').addEventListener('click', function() {
    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });
  
  container.querySelector('.increase-quantity').addEventListener('click', function() {
    const currentValue = parseInt(quantityInput.value);
    const max = variant.inventory;
    
    if (currentValue < max) {
      quantityInput.value = currentValue + 1;
    }
  });
  
  // Set up add to cart button
  container.querySelector('.add-to-cart:not(.disabled)').addEventListener('click', async function() {
    const quantity = parseInt(quantityInput.value);
    const productVariantId = this.getAttribute('data-product-variant-id');
    const productName = this.getAttribute('data-product-name');
    
    try {
      // Import API client
      const { cartAPI } = await import('./api.js');
      
      // Add item to cart
      const response = await cartAPI.addItemToCart(productVariantId, quantity);
      
      // Update cart count
      const { updateCartCount } = await import('./cart.js');
      updateCartCount(response.data.data.items.length);
      
      // Show success message
      Swal.fire({
        title: 'Added to Cart!',
        text: `${quantity} ${quantity > 1 ? 'items' : 'item'} of ${productName} has been added to your cart.`,
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
      
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add item to cart. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  });
}

// Render product variants
function renderProductVariants(container, variants, productName) {
  let html = `
    <h3 class="mb-3">Available Variants</h3>
    <div class="list-group">
  `;
  
  variants.forEach(variant => {
    // Check if variant is available
    const isAvailable = variant.inventory > 0;
    
    // Format price display
    const priceHtml = variant.salePrice ? 
      `<span class="text-muted text-decoration-line-through">${variant.price.toFixed(2)}</span>
       <span class="text-danger ms-2">${variant.salePrice.toFixed(2)}</span>` : 
      `<span>${variant.price.toFixed(2)}</span>`;
    
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
                      data-variant-price="${variant.salePrice || variant.price}"
                      data-product-name="${productName}">
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
  
  container.innerHTML = html;
  
  // Set up variant selection buttons
  container.querySelectorAll('.select-variant').forEach(button => {
    button.addEventListener('click', function() {
      const variantId = this.getAttribute('data-variant-id');
      const variantName = this.getAttribute('data-variant-name');
      const variantPrice = this.getAttribute('data-variant-price');
      const productName = this.getAttribute('data-product-name');
      
      // Update add to cart button
      const addToCartBtn = document.querySelector('.add-to-cart');
      addToCartBtn.setAttribute('data-product-variant-id', variantId);
      addToCartBtn.classList.remove('disabled');
      
      // Update price display
      const priceElement = document.querySelector('.price-block') || document.querySelector('.mb-3:nth-child(3)');
      if (priceElement) {
        priceElement.innerHTML = `
          <div class="fw-bold fs-5">Price:</div>
          <div class="mb-2">
            <span class="fs-3">${parseFloat(variantPrice).toFixed(2)}</span>
          </div>
        `;
      }
      
      // Show selected variant alert
      Swal.fire({
        title: 'Variant Selected',
        text: `Selected ${productName} - ${variantName}`,
        icon: 'success',
        showConfirmButton: false,
        timer: 1500
      });
    });
  });
}

// Render product reviews
function renderProductReviews(container, reviews) {
  if (!reviews || reviews.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info" role="alert">
        No reviews yet. Be the first to leave a review!
      </div>
    `;
    return;
  }
  
  let html = '<h3 class="mb-3">Customer Reviews</h3>';
  
  // Calculate average rating
  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  // Rating summary
  html += `
    <div class="d-flex align-items-center mb-4">
      <div class="me-3">
        <span class="display-4 fw-bold">${averageRating.toFixed(1)}</span>
        <span class="text-muted">/ 5</span>
      </div>
      <div>
        <div class="mb-1">${generateStarRating(averageRating)}</div>
        <p class="mb-0 text-muted">${reviews.length} customer reviews</p>
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
              <small class="text-muted ms-2">${new Date(review.createdAt).toLocaleDateString()}</small>
            </div>
          </div>
          <p class="card-text">${review.comment}</p>
          ${review.isVerifiedPurchase ? 
            '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Verified Purchase</span>' : ''}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Update product breadcrumb
function updateProductBreadcrumb(product) {
  const breadcrumb = document.getElementById('breadcrumb');
  if (!breadcrumb) return;
  
  // Get category info
  const category = product.categories && product.categories.length > 0 ? product.categories[0] : null;
  
  let html = `
    <li class="breadcrumb-item"><a href="index.html">Home</a></li>
    <li class="breadcrumb-item"><a href="products.html">Products</a></li>
  `;
  
  if (category) {
    html += `
      <li class="breadcrumb-item">
        <a href="products.html?category=${category.slug}">${category.name}</a>
      </li>
    `;
  }
  
  html += `<li class="breadcrumb-item active">${product.name}</li>`;
  
  breadcrumb.innerHTML = html;
}

// Setup review form
function setupReviewForm() {
  const reviewForm = document.getElementById('review-form');
  const ratingInputs = document.querySelectorAll('input[name="rating"]');
  
  if (!reviewForm) return;
  
  // Set up star rating inputs
  ratingInputs.forEach(input => {
    input.addEventListener('change', function() {
      document.querySelector('.rating-value').textContent = this.value;
    });
  });
  
  // Form submission
  reviewForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productId = window.currentProductId;
    if (!productId) {
      Swal.fire({
        title: 'Error!',
        text: 'Product information is missing. Please refresh the page and try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const formData = new FormData(reviewForm);
    const rating = parseInt(formData.get('rating')) || 5;
    const comment = formData.get('comment');
    const userName = formData.get('userName') || 'Anonymous';
    
    if (!comment) {
      Swal.fire({
        title: 'Error!',
        text: 'Please enter a review comment.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    try {
      // Check if user is logged in for rating
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (rating && !token) {
        Swal.fire({
          title: 'Login Required',
          text: 'You need to log in to leave a star rating. Do you want to log in now?',
          icon: 'warning',
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
        return;
      }
      
      // Prepare review data
      const reviewData = {
        productId,
        rating,
        comment,
        userName: token ? localStorage.getItem('userFullName') || userName : userName,
        userId: token ? userId : null
      };
      
      // Submit review - to be implemented in backend
      // const response = await reviewAPI.addReview(reviewData);
      
      // For demo, simulate review submission
      const newReview = {
        ...reviewData,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isVerifiedPurchase: false
      };
      
      // Add review to UI
      const productReviews = document.getElementById('product-reviews');
      const firstReview = productReviews.querySelector('.card');
      
      const reviewElement = document.createElement('div');
      reviewElement.className = 'card mb-3';
      reviewElement.innerHTML = `
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="card-title mb-0">${newReview.userName}</h5>
            <div>
              ${generateStarRating(newReview.rating)}
              <small class="text-muted ms-2">${new Date(newReview.createdAt).toLocaleDateString()}</small>
            </div>
          </div>
          <p class="card-text">${newReview.comment}</p>
        </div>
      `;
      
      if (firstReview) {
        productReviews.insertBefore(reviewElement, firstReview);
      } else {
        // No reviews yet, replace the "no reviews" alert
        productReviews.innerHTML = `
          <h3 class="mb-3">Customer Reviews</h3>
          <div class="d-flex align-items-center mb-4">
            <div class="me-3">
              <span class="display-4 fw-bold">${newReview.rating.toFixed(1)}</span>
              <span class="text-muted">/ 5</span>
            </div>
            <div>
              <div class="mb-1">${generateStarRating(newReview.rating)}</div>
              <p class="mb-0 text-muted">1 customer review</p>
            </div>
          </div>
          <hr>
        `;
        productReviews.appendChild(reviewElement);
      }
      
      // Reset form
      reviewForm.reset();
      
      // Show success message
      Swal.fire({
        title: 'Review Submitted!',
        text: 'Your review has been submitted successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // Emit socket event for real-time update
      if (window.socket) {
        window.socket.emit('new_review', {
          productId,
          review: newReview
        });
      }
      
    } catch (error) {
      console.error('Failed to submit review:', error);
      
      Swal.fire({
        title: 'Error!',
        text: 'Failed to submit your review. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  });
}

// Setup add to cart buttons
function setupAddToCartButtons() {
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', async function() {
      const productVariantId = this.getAttribute('data-product-variant-id');
      const productName = this.getAttribute('data-product-name');
      
      try {
        // Import API client
        const { cartAPI } = await import('./api.js');
        
        // Add item to cart
        const response = await cartAPI.addItemToCart(productVariantId, 1);
        
        // Update cart count
        const { updateCartCount } = await import('./cart.js');
        updateCartCount(response.data.data.items.length);
        
        // Show success message
        Swal.fire({
          title: 'Added to Cart!',
          text: `${productName} has been added to your cart.`,
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
        
        Swal.fire({
          title: 'Error!',
          text: 'Failed to add item to cart. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  });
}