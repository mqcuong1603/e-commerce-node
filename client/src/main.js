// src/js/main.js
// Import CSS files
import '../css/styles.css';

// Import libraries
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import $ from 'jquery';
import Swal from 'sweetalert2';
import io from 'socket.io-client';
import 'sweetalert2/src/sweetalert2.scss';

// Import our API modules
import { 
  authAPI, 
  productAPI, 
  categoryAPI,
  cartAPI,
  orderAPI,
  addressAPI,
  reviewAPI
} from './api/index.js';

// Import our application
import './app.js';
import './api-client.js';
import './utils.js';

// Import our UI modules
import { setupAuth, checkAuthStatus } from './auth.js';
import { setupCart, updateCartCount } from './cart.js';
import { setupProductPage } from './product.js';
import { initHomePage } from './home.js';
import { initProductDetail } from './product-detail.js';

// Socket.io setup for real-time features
let socket = null;
try {
  if (window.io) {
    socket = io('http://localhost:3000');
    
    // Listen for real-time review updates
    socket.on('review_update', (data) => {
      console.log('New review received:', data);
      
      // Update reviews on product detail page if matching product
      if (window.location.pathname.includes('product-detail') && 
          window.currentProductId === data.productId) {
        // Add the new review to the UI
        const { addReviewToUI } = require('./product-detail.js');
        addReviewToUI(data.review);
      }
    });
    
    // Listen for cart changes (for multi-device sync)
    socket.on('cart_changed', (data) => {
      console.log('Cart updated:', data);
      
      // Update cart if the user ID matches
      if (localStorage.getItem('userId') === data.userId) {
        updateCartCount(data.cart.itemCount || 0);
      }
    });
  }
} catch (error) {
  console.warn('Socket.io not available:', error);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize tooltips and popovers
  $('[data-bs-toggle="tooltip"]').tooltip();
  $('[data-bs-toggle="popover"]').popover();
  
  // Check authentication status
  await checkAuthStatus();
  
  // Setup auth related functionality
  setupAuth();
  
  // Setup cart functionality
  setupCart();
  
  // Initialize category menu
  await initCategoryMenu();
  
  // Setup page specific functionality
  setupPageSpecificFunctions();
});

// Function to setup page specific functionality based on current page
function setupPageSpecificFunctions() {
  const currentPath = window.location.pathname;
  
  if (currentPath === '/' || currentPath.includes('index.html')) {
    // Home page
    initHomePage();
  } else if (currentPath.includes('products.html')) {
    // Products listing page
    setupProductPage();
  } else if (currentPath.includes('product-detail.html')) {
    // Product detail page
    initProductDetail();
  }
}

// Initialize category menu in header
async function initCategoryMenu() {
  try {
    const categoryMenuContainer = document.getElementById('category-menu');
    if (!categoryMenuContainer) return;
    
    // Get menu categories
    const response = await categoryAPI.getMenuCategories();
    
    if (!response.success) {
      console.error('Failed to load menu categories:', response.message);
      return;
    }
    
    const menuData = response.data;
    
    // Generate menu HTML
    let menuHtml = '';
    
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
    
    // Add "All Products" link at the beginning
    menuHtml = `
      <li class="nav-item">
        <a class="nav-link" href="products.html">All Products</a>
      </li>
    ` + menuHtml;
    
    categoryMenuContainer.innerHTML = menuHtml;
    
  } catch (error) {
    console.error('Failed to load category menu:', error);
  }
}

// Set up global error handler
window.addEventListener('error', function(event) {
  console.error('Global error caught:', event.error);
  
  // Show user-friendly error message for serious errors
  if (event.error && event.error.message) {
    Swal.fire({
      title: 'Something went wrong',
      text: 'We encountered an unexpected error. Please try again or refresh the page.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
});

// Log application start
console.log('Computer Components Store application starting...');