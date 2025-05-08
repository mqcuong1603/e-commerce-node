// src/js/utils.js
import Swal from 'sweetalert2';

/**
 * Show toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, info, warning)
 */
export function showToast(title, message, type = 'info') {
  // Use SweetAlert2 for toast notifications
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
  
  Toast.fire({
    icon: type,
    title: message
  });
}

/**
 * Format price with currency symbol
 * @param {number} price - Price value
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price
 */
export function formatPrice(price, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency 
  }).format(price);
}

/**
 * Format date
 * @param {string} dateString - Date string
 * @param {Object} options - Date format options
 * @returns {string} Formatted date
 */
export function formatDate(dateString, options = {}) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }).format(date);
}

/**
 * Generate star rating HTML
 * @param {number} rating - Rating value (0-5)
 * @returns {string} Star rating HTML
 */
export function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  let html = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="bi bi-star-fill text-warning"></i>';
  }
  
  // Half star
  if (halfStar) {
    html += '<i class="bi bi-star-half text-warning"></i>';
  }
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="bi bi-star text-warning"></i>';
  }
  
  return html;
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}