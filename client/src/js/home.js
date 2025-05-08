// src/js/home.js
// Home page functionality

import { productAPI, categoryAPI } from "./api/index.js";
import { setupAddToCartButtons, showToast } from "./utils.js";

// DOM elements we'll work with
const newProductsContainer = document.getElementById("new-products");
const bestSellersContainer = document.getElementById("best-sellers");
const categoryProductsContainer = document.getElementById("category-products");
const mainCarousel = document.getElementById("mainCarousel");

// Initialize the home page
export async function initHomePage() {
  try {
    // Show loading indicators
    if (newProductsContainer) showLoadingIndicator(newProductsContainer);
    if (bestSellersContainer) showLoadingIndicator(bestSellersContainer);
    if (categoryProductsContainer)
      showLoadingIndicator(categoryProductsContainer);

    // Initialize category navigation
    await initCategoryNavigation();

    // Fetch all landing page products from API
    const response = await productAPI.getLandingPageProducts();
    const data = response.data;

    // Render each section if container exists and data is available
    if (newProductsContainer && data.newProducts) {
      renderProductGrid(newProductsContainer, data.newProducts);
    }

    if (bestSellersContainer && data.bestSellers) {
      renderProductGrid(bestSellersContainer, data.bestSellers);
    }

    if (categoryProductsContainer && data.categoryProducts) {
      renderCategoryProducts(categoryProductsContainer, data.categoryProducts);
    }
  } catch (error) {
    console.error("Failed to load landing page products:", error);

    // Show error messages in each container
    if (newProductsContainer) showErrorMessage(newProductsContainer);
    if (bestSellersContainer) showErrorMessage(bestSellersContainer);
    if (categoryProductsContainer) showErrorMessage(categoryProductsContainer);
  }
}

/**
 * Initialize category navigation menu
 */
async function initCategoryNavigation() {
  try {
    const categoryNav = document.querySelector(".category-nav");
    if (!categoryNav) return;

    // Get categories for navigation
    const response = await categoryAPI.getMenuCategories();
    const categories = response.data;

    let categoryHtml = "";

    // Generate HTML for category navigation
    categories.forEach((category) => {
      categoryHtml += `
        <a href="products.html?category=${
          category.slug
        }" class="category-item text-center mx-2">
          <div class="category-icon">
            <i class="bi ${getCategoryIcon(category.name)}"></i>
          </div>
          <div class="category-name">${category.name}</div>
        </a>
      `;
    });

    // Update category navigation
    const categoryContainer = categoryNav.querySelector(".row > div");
    if (categoryContainer) {
      categoryContainer.innerHTML = categoryHtml;
    }
  } catch (error) {
    console.error("Failed to load category navigation:", error);
  }
}

/**
 * Get icon class for category
 * @param {string} categoryName - Category name
 * @returns {string} - Bootstrap icon class
 */
function getCategoryIcon(categoryName) {
  // Map category names to appropriate Bootstrap icons
  const iconMap = {
    Laptops: "bi-laptop",
    Monitors: "bi-display",
    Storage: "bi-device-hdd",
    Processors: "bi-cpu",
    Motherboards: "bi-motherboard",
    "Graphics Cards": "bi-gpu-card",
    RAM: "bi-memory",
    "Power Supplies": "bi-lightning",
    "Cooling & Cases": "bi-fan",
    // Add more mappings as needed
  };

  // Return mapped icon or default
  return iconMap[categoryName] || "bi-box";
}

/**
 * Show loading indicator in container
 * @param {HTMLElement} container - Container element
 */
function showLoadingIndicator(container) {
  container.innerHTML = `
    <div class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading products...</p>
    </div>
  `;
}

/**
 * Show error message in container
 * @param {HTMLElement} container - Container element
 */
function showErrorMessage(container) {
  container.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      Failed to load products. Please refresh the page to try again.
    </div>
  `;
}

/**
 * Render product grid
 * @param {HTMLElement} container - Container element
 * @param {Array} products - Products array
 */
function renderProductGrid(container, products) {
  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info" role="alert">
        <i class="bi bi-info-circle-fill me-2"></i>
        No products available at this time.
      </div>
    `;
    return;
  }

  let html = '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">';

  products.forEach((product) => {
    // Get first variant and image for display
    const variant =
      product.variants && product.variants.length > 0
        ? product.variants[0]
        : null;
    const image =
      product.images && product.images.length > 0 ? product.images[0] : null;

    if (variant) {
      const price = variant.salePrice || variant.price;
      const regularPrice = variant.salePrice ? variant.price : null;
      const imageUrl = image ? image.imageUrl : "/images/placeholder.jpg";

      html += `
        <div class="col">
          <div class="card h-100 product-card">
            <div class="badge-overlay">
              ${
                product.isNewProduct
                  ? '<span class="badge bg-success">New</span>'
                  : ""
              }
              ${
                product.isBestSeller
                  ? '<span class="badge bg-danger">Best Seller</span>'
                  : ""
              }
              ${
                variant.salePrice
                  ? '<span class="badge bg-warning">Sale</span>'
                  : ""
              }
            </div>
            <a href="product-detail.html?slug=${product.slug}">
              <img src="${imageUrl}" class="card-img-top" alt="${product.name}">
            </a>
            <div class="card-body">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text">${product.shortDescription}</p>
              <div class="d-flex justify-content-between align-items-center">
                <div class="price-block">
                  ${
                    regularPrice
                      ? `<span class="text-muted text-decoration-line-through">$${regularPrice.toFixed(
                          2
                        )}</span>
                     <span class="fs-5 text-danger">$${price.toFixed(2)}</span>`
                      : `<span class="fs-5">$${price.toFixed(2)}</span>`
                  }
                </div>
                <button class="btn btn-primary btn-sm add-to-cart" 
                        data-product-variant-id="${variant._id}" 
                        data-product-name="${product.name}"
                        data-product-price="${price}">
                  <i class="bi bi-cart-plus"></i> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  });

  html += "</div>";
  container.innerHTML = html;

  // Setup add to cart buttons
  setupAddToCartButtons();
}

/**
 * Render category products section
 * @param {HTMLElement} container - Container element
 * @param {Object} categoryProducts - Category products object
 */
function renderCategoryProducts(container, categoryProducts) {
  if (!categoryProducts || Object.keys(categoryProducts).length === 0) {
    container.innerHTML = `
      <div class="alert alert-info" role="alert">
        <i class="bi bi-info-circle-fill me-2"></i>
        No category products available at this time.
      </div>
    `;
    return;
  }

  let html = "";

  // For each category in the data
  Object.values(categoryProducts).forEach((categoryData) => {
    html += `
      <div class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3>${categoryData.category.name}</h3>
          <a href="products.html?category=${categoryData.category.slug}" class="btn btn-outline-primary btn-sm">
            See all <i class="bi bi-arrow-right"></i>
          </a>
        </div>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
    `;

    // Render products in this category
    categoryData.products.forEach((product) => {
      const variant =
        product.variants && product.variants.length > 0
          ? product.variants[0]
          : null;
      const image =
        product.images && product.images.length > 0 ? product.images[0] : null;

      if (variant) {
        const price = variant.salePrice || variant.price;
        const regularPrice = variant.salePrice ? variant.price : null;
        const imageUrl = image ? image.imageUrl : "/images/placeholder.jpg";

        html += `
          <div class="col">
            <div class="card h-100 product-card">
              <div class="badge-overlay">
                ${
                  product.isNewProduct
                    ? '<span class="badge bg-success">New</span>'
                    : ""
                }
                ${
                  product.isBestSeller
                    ? '<span class="badge bg-danger">Best Seller</span>'
                    : ""
                }
                ${
                  variant.salePrice
                    ? '<span class="badge bg-warning">Sale</span>'
                    : ""
                }
              </div>
              <a href="product-detail.html?slug=${product.slug}">
                <img src="${imageUrl}" class="card-img-top" alt="${
          product.name
        }">
              </a>
              <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.shortDescription}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="price-block">
                    ${
                      regularPrice
                        ? `<span class="text-muted text-decoration-line-through">$${regularPrice.toFixed(
                            2
                          )}</span>
                      <span class="fs-5 text-danger">$${price.toFixed(
                        2
                      )}</span>`
                        : `<span class="fs-5">$${price.toFixed(2)}</span>`
                    }
                  </div>
                  <button class="btn btn-primary btn-sm add-to-cart" 
                          data-product-variant-id="${variant._id}" 
                          data-product-name="${product.name}"
                          data-product-price="${price}">
                    <i class="bi bi-cart-plus"></i> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    });

    html += "</div></div>";
  });

  container.innerHTML = html;

  // Setup add to cart buttons
  setupAddToCartButtons();
}

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", initHomePage);

// Export functions that might be needed elsewhere
export { renderProductGrid, showLoadingIndicator, showErrorMessage };
