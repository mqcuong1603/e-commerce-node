// src/js/app.js
// Main application entry point

import { initHomePage } from './home.js';
import { setupAuth, checkAuthStatus } from './auth.js';
import { setupCart } from './cart.js';
import { setupProductPage } from './product.js';
import { initProductDetail } from './product-detail.js';
import { categoryAPI } from './api/index.js';

/**
 * Initialize the application
 */
async function initApp() {
  console.log('Initializing application...');
  
  // Check authentication status
  await checkAuthStatus();
  
  // Setup auth functionality
  setupAuth();
  
  // Setup cart functionality
  setupCart();
  
  // Initialize category menu
  await initCategoryMenu();
  
  // Initialize page-specific functionality
  initCurrentPage();
  
  console.log('Application initialized successfully');
}

/**
 * Initialize category menu in header
 */
async function initCategoryMenu() {
  try {
    const categoryMenuContainer = document.getElementById('category-menu');
    if (!categoryMenuContainer) return;
    
    // Show loading state
    categoryMenuContainer.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="products.html">All Products</a>
      </li>
      <li class="nav-item">
        <a class="nav-link disabled">Loading categories...</a>
      </li>
    `;
    
    // Get menu categories
    const response = await categoryAPI.getMenuCategories();
    
    if (!response.success) {
      console.error('Failed to load menu categories:', response.message);
      return;
    }
    
    const menuData = response.data;
    
    // Generate menu HTML
    let menuHtml = `
      <li class="nav-item">
        <a class="nav-link" href="products.html">All Products</a>
      </li>
    `;
    
    menuData.forEach(category => {
      menuHtml += `
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="products.html?category=${category.slug}" 
             id="${category.slug}-dropdown" role="button" 
             data-bs-toggle="dropdown" aria-expanded="false">
            ${category.name}
          </a>
          <ul class="dropdown-menu" aria-labelledby="${category.slug}-dropdown">
      `;
      
      if (category.children && category.children.length > 0) {
        category.children.forEach(subCategory => {
          menuHtml += `
            <li>
              <a class="dropdown-item" href="products.html?category=${subCategory.slug}">
                ${subCategory.name}
              </a>
            </li>
          `;
        });
      }
      
      menuHtml += `
          </ul>
        </li>
      `;
    });
    
    categoryMenuContainer.innerHTML = menuHtml;
    
  } catch (error) {
    console.error('Failed to load category menu:', error);
  }
}

/**
 * Initialize page-specific functionality based on current URL
 */
function initCurrentPage() {
  const path = window.location.pathname;
  
  // Home page
  if (path === '/' || path.endsWith('index.html')) {
    initHomePage();
  }
  
  // Products page
  else if (path.includes('products.html')) {
    setupProductPage();
  }
  
  // Product detail page
  else if (path.includes('product-detail.html')) {
    initProductDetail();
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);