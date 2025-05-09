// src/js/utils.js
import Swal from "sweetalert2";

/**
 * Show toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, info, warning)
 */
export function showToast(title, message, type = "info") {
  // Use SweetAlert2 for toast notifications with Bootstrap-compatible styling
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    iconColor: getBootstrapColorForType(type),
    customClass: {
      popup: "shadow-sm rounded",
      title: "fw-normal",
    },
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: type,
    title: message,
  });
}

/**
 * Format price with currency symbol
 * @param {number} price - Price value
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price
 */
export function formatPrice(price, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
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
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(date);
}

/**
 * Generate star rating HTML using only Bootstrap icons
 * @param {number} rating - Rating value (0-5)
 * @returns {string} Star rating HTML
 */
export function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  let html = "";

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
  return text.substring(0, maxLength) + "...";
}

/**
 * Setup add to cart buttons
 */
export function setupAddToCartButtons() {
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", async function () {
      const productVariantId =
        this.getAttribute("data-variant-id") ||
        this.getAttribute("data-product-variant-id");
      const productName = this.getAttribute("data-product-name");
      const quantity = 1;

      try {
        // Show loading state
        const originalText = this.innerHTML;
        this.disabled = true;
        this.innerHTML =
          '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Adding...';

        // Import from the correct API module
        const { cartAPI } = await import("./api/index.js");

        // Add item to cart
        const response = await cartAPI.addItemToCart(
          productVariantId,
          quantity
        );

        // Reset button state
        this.disabled = false;
        this.innerHTML = originalText;

        // Show success message
        showToast(
          "Success",
          `${productName} has been added to your cart.`,
          "success"
        );

        // Update cart count badge
        updateCartCount(response.data.items?.length || 0);
      } catch (error) {
        console.error("Failed to add item to cart:", error);

        // Reset button state
        this.disabled = false;
        this.innerHTML = originalText;

        // Show error message
        showToast("Error", "Failed to add item to cart.", "error");
      }
    });
  });
}

/**
 * Update cart count badge with Bootstrap styling
 * @param {number} count - Number of items in cart
 */
export function updateCartCount(count) {
  const cartCountElements = document.querySelectorAll(".cart-count");

  cartCountElements.forEach((element) => {
    element.textContent = count;

    if (count > 0) {
      element.classList.remove("d-none");
    } else {
      element.classList.add("d-none");
    }
  });
}

/**
 * Get Bootstrap color for alert/toast type
 * @param {string} type - Alert type (success, error, info, warning)
 * @returns {string} Bootstrap color value
 */
function getBootstrapColorForType(type) {
  switch (type) {
    case "success":
      return "#198754"; // Bootstrap success color
    case "error":
      return "#dc3545"; // Bootstrap danger color
    case "warning":
      return "#ffc107"; // Bootstrap warning color
    case "info":
    default:
      return "#0dcaf0"; // Bootstrap info color
  }
}

/**
 * Show a confirmation dialog using SweetAlert2 with Bootstrap styling
 * @param {string} title - Dialog title
 * @param {string} text - Dialog text
 * @param {string} confirmButtonText - Text for confirm button
 * @param {string} cancelButtonText - Text for cancel button
 * @param {string} type - Dialog type (success, error, info, warning)
 * @returns {Promise} Promise resolving to user's choice
 */
export function showConfirmDialog(
  title,
  text,
  confirmButtonText = "Yes",
  cancelButtonText = "No",
  type = "warning"
) {
  return Swal.fire({
    title,
    text,
    icon: type,
    showCancelButton: true,
    confirmButtonColor: "#0d6efd", // Bootstrap primary color
    cancelButtonColor: "#6c757d", // Bootstrap secondary color
    confirmButtonText,
    cancelButtonText,
    customClass: {
      container: "my-swal",
      popup: "rounded-3 shadow",
      header: "border-bottom-0",
      title: "fs-4",
      closeButton: "btn-close",
      icon: "text-center",
      content: "fs-6",
      actions: "d-flex gap-2",
      confirmButton: "btn btn-primary py-2 px-3",
      cancelButton: "btn btn-secondary py-2 px-3",
      footer: "border-top-0",
    },
    buttonsStyling: false,
  });
}

/**
 * Create a Bootstrap badge with appropriate styling
 * @param {string} text - Badge text
 * @param {string} type - Badge type (primary, secondary, success, danger, warning, info)
 * @param {boolean} pill - Whether badge should be pill-shaped
 * @returns {string} HTML for badge
 */
export function createBadge(text, type = "primary", pill = false) {
  const pillClass = pill ? "rounded-pill" : "";
  return `<span class="badge bg-${type} ${pillClass}">${text}</span>`;
}

/**
 * Format currency values using Bootstrap text classes
 * @param {number} price - Regular price
 * @param {number|null} salePrice - Sale price (if exists)
 * @returns {string} Formatted HTML with appropriate styling
 */
export function formatPriceDisplay(price, salePrice = null) {
  if (salePrice && salePrice < price) {
    return `
      <span class="text-decoration-line-through text-muted small me-1">${formatPrice(
        price
      )}</span>
      <span class="fw-bold text-danger">${formatPrice(salePrice)}</span>
    `;
  } else {
    return `<span class="fw-bold">${formatPrice(price)}</span>`;
  }
}
