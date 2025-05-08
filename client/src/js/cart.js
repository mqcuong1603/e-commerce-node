import Swal from 'sweetalert2';
import { cartAPI } from './api.js';

// Initialize cart functionality
export function setupCart() {
  // Update cart count on page load
  updateCartBadge();
  
  // Setup cart page functionality if on cart page
  if (window.location.pathname.includes('cart.html')) {
    loadCartContents();
    setupCartEventHandlers();
  }
  
  // Setup checkout page functionality if on checkout page
  if (window.location.pathname.includes('checkout.html')) {
    loadCartSummary();
    setupCheckoutForm();
  }
}

// Load cart contents and display them
async function loadCartContents() {
  const cartTableBody = document.getElementById('cart-items');
  const cartSummary = document.getElementById('cart-summary');
  
  if (!cartTableBody || !cartSummary) return;
  
  try {
    const response = await cartAPI.getCart();
    const cart = response.data.data;
    
    if (!cart.items || cart.items.length === 0) {
      // Cart is empty
      document.getElementById('cart-container').classList.add('d-none');
      document.getElementById('empty-cart').classList.remove('d-none');
      return;
    }
    
    // Cart has items
    document.getElementById('cart-container').classList.remove('d-none');
    document.getElementById('empty-cart').classList.add('d-none');
    
    // Render cart items
    let itemsHtml = '';
    let subtotal = 0;
    
    cart.items.forEach(item => {
      const variant = item.productVariantId;
      const product = variant.productId;
      const image = variant.images && variant.images.length > 0 ? variant.images[0] : null;
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      itemsHtml += `
        <tr data-product-variant-id="${variant._id}">
          <td>
            <div class="d-flex align-items-center">
              <img src="${image ? image.imageUrl : '/images/placeholder.jpg'}" 
                   alt="${product.name}" class="cart-item-image me-3">
              <div>
                <h6 class="mb-0">${product.name}</h6>
                <small class="text-muted">${variant.name}</small>
              </div>
            </div>
          </td>
          <td class="text-end">$${item.price.toFixed(2)}</td>
          <td>
            <div class="input-group quantity-control">
              <button class="btn btn-outline-secondary decrease-quantity" type="button">-</button>
              <input type="number" class="form-control text-center item-quantity" 
                     value="${item.quantity}" min="1" max="99">
              <button class="btn btn-outline-secondary increase-quantity" type="button">+</button>
            </div>
          </td>
          <td class="text-end item-total">$${itemTotal.toFixed(2)}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-danger remove-item">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
    
    cartTableBody.innerHTML = itemsHtml;
    
    // Calculate tax and shipping
    const shipping = subtotal > 100 ? 0 : 15;
    const tax = subtotal * 0.10; // 10% tax
    const total = subtotal + shipping + tax;
    
    // Update cart summary
    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-shipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
    
    // Update cart count
    updateCartCount(cart.items.length);
    
  } catch (error) {
    console.error('Failed to load cart:', error);
    
    Swal.fire({
      title: 'Error!',
      text: 'Failed to load your shopping cart. Please try again later.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
}

// Setup cart event handlers
function setupCartEventHandlers() {
  const cartTableBody = document.getElementById('cart-items');
  if (!cartTableBody) return;
  
  // Quantity increase/decrease buttons
  cartTableBody.addEventListener('click', async function(e) {
    if (e.target.classList.contains('increase-quantity') || 
        e.target.classList.contains('decrease-quantity')) {
      
      const row = e.target.closest('tr');
      const quantityInput = row.querySelector('.item-quantity');
      const currentQuantity = parseInt(quantityInput.value);
      
      let newQuantity = currentQuantity;
      
      if (e.target.classList.contains('increase-quantity')) {
        newQuantity = currentQuantity + 1;
      } else {
        newQuantity = Math.max(1, currentQuantity - 1);
      }
      
      if (newQuantity !== currentQuantity) {
        quantityInput.value = newQuantity;
        await updateCartItemQuantity(row, newQuantity);
      }
    }
  });
  
  // Quantity input change
  cartTableBody.addEventListener('change', async function(e) {
    if (e.target.classList.contains('item-quantity')) {
      const row = e.target.closest('tr');
      const newQuantity = parseInt(e.target.value);
      
      if (newQuantity < 1) {
        e.target.value = 1;
        await updateCartItemQuantity(row, 1);
      } else {
        await updateCartItemQuantity(row, newQuantity);
      }
    }
  });
  
  // Remove item button
  cartTableBody.addEventListener('click', async function(e) {
    if (e.target.classList.contains('remove-item') || 
        e.target.closest('.remove-item')) {
      
      const row = e.target.closest('tr');
      await removeCartItem(row);
    }
  });
  
  // Clear cart button
  const clearCartBtn = document.getElementById('clear-cart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      Swal.fire({
        title: 'Are you sure?',
        text: 'This will remove all items from your cart.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, clear cart',
        cancelButtonText: 'Cancel'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await cartAPI.clearCart();
            
            // Reload cart contents
            loadCartContents();
            
            // Update cart count
            updateCartCount(0);
            
            Swal.fire({
              title: 'Cart Cleared!',
              text: 'Your shopping cart has been cleared.',
              icon: 'success',
              confirmButtonText: 'Continue Shopping'
            }).then(() => {
              // Redirect to home page
              window.location.href = 'index.html';
            });
            
          } catch (error) {
            console.error('Failed to clear cart:', error);
            
            Swal.fire({
              title: 'Error!',
              text: 'Failed to clear your shopping cart. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        }
      });
    });
  }
  
  // Checkout button
  const checkoutBtn = document.getElementById('proceed-to-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      
      if (!token) {
        // User is not logged in, redirect to login page with redirect URL
        Swal.fire({
          title: 'Login Required',
          text: 'Please log in to proceed with checkout.',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Login',
          cancelButtonText: 'Continue as Guest'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = `login.html?redirect=${encodeURIComponent('checkout.html')}`;
          } else {
            window.location.href = 'checkout.html';
          }
        });
      } else {
        // User is logged in, redirect to checkout page
        window.location.href = 'checkout.html';
      }
    });
  }
}

// Update cart item quantity
async function updateCartItemQuantity(row, newQuantity) {
  const productVariantId = row.getAttribute('data-product-variant-id');
  const totalElement = row.querySelector('.item-total');
  
  try {
    const response = await cartAPI.updateCartItem(productVariantId, newQuantity);
    const updatedCart = response.data.data;
    
    // Find updated item
    const updatedItem = updatedCart.items.find(item => 
      item.productVariantId._id === productVariantId
    );
    
    if (updatedItem) {
      // Update item total
      const itemTotal = updatedItem.price * updatedItem.quantity;
      totalElement.textContent = `$${itemTotal.toFixed(2)}`;
      
      // Update cart summary
      updateCartSummary(updatedCart);
    }
    
  } catch (error) {
    console.error('Failed to update cart item:', error);
    
    // Reset quantity to previous value
    Swal.fire({
      title: 'Error!',
      text: 'Failed to update item quantity. Please try again.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
    
    // Reload cart to get correct quantities
    loadCartContents();
  }
}

// Remove cart item
async function removeCartItem(row) {
  const productVariantId = row.getAttribute('data-product-variant-id');
  
  try {
    const response = await cartAPI.removeCartItem(productVariantId);
    const updatedCart = response.data.data;
    
    // Remove row from table
    row.remove();
    
    // Update cart summary
    updateCartSummary(updatedCart);
    
    // Update cart count
    updateCartCount(updatedCart.items.length);
    
    // Show empty cart message if no items left
    if (updatedCart.items.length === 0) {
      document.getElementById('cart-container').classList.add('d-none');
      document.getElementById('empty-cart').classList.remove('d-none');
    }
    
  } catch (error) {
    console.error('Failed to remove cart item:', error);
    
    Swal.fire({
      title: 'Error!',
      text: 'Failed to remove item from cart. Please try again.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
}

// Update cart summary based on updated cart
function updateCartSummary(cart) {
  // Calculate subtotal
  let subtotal = 0;
  cart.items.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  
  // Calculate tax and shipping
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.10; // 10% tax
  const total = subtotal + shipping + tax;
  
  // Update cart summary
  document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('cart-shipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
  document.getElementById('cart-tax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
}

// Load cart summary for checkout page
async function loadCartSummary() {
  const cartSummaryContainer = document.getElementById('checkout-cart-summary');
  if (!cartSummaryContainer) return;
  
  try {
    const response = await cartAPI.getCart();
    const cart = response.data.data;
    
    if (!cart.items || cart.items.length === 0) {
      // Cart is empty, redirect to cart page
      window.location.href = 'cart.html';
      return;
    }
    
    // Render cart summary
    let itemsHtml = '';
    let subtotal = 0;
    
    cart.items.forEach(item => {
      const variant = item.productVariantId;
      const product = variant.productId;
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      itemsHtml += `
        <div class="d-flex justify-content-between mb-2">
          <div>
            <span class="fw-bold">${product.name}</span>
            <small class="d-block text-muted">${variant.name}</small>
            <small class="d-block text-muted">Qty: ${item.quantity}</small>
          </div>
          <span>$${itemTotal.toFixed(2)}</span>
        </div>
      `;
    });
    
    // Calculate tax and shipping
    const shipping = subtotal > 100 ? 0 : 15;
    const tax = subtotal * 0.10; // 10% tax
    const total = subtotal + shipping + tax;
    
    // Update summary
    cartSummaryContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Order Summary</h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            ${itemsHtml}
          </div>
          <hr>
          <div class="d-flex justify-content-between mb-2">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span>Shipping</span>
            <span>${shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span>Tax (10%)</span>
            <span>$${tax.toFixed(2)}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span>Discount</span>
            <span id="discount-amount">$0.00</span>
          </div>
          <hr>
          <div class="d-flex justify-content-between mb-2">
            <span class="fw-bold">Total</span>
            <span class="fw-bold" id="checkout-total">$${total.toFixed(2)}</span>
          </div>
          
          <div class="mt-3">
            <div class="input-group">
              <input type="text" class="form-control" id="discount-code" 
                     placeholder="Discount Code">
              <button class="btn btn-outline-secondary" type="button" 
                      id="apply-discount">Apply</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Setup discount code application
    setupDiscountCode();
    
  } catch (error) {
    console.error('Failed to load cart summary:', error);
    
    Swal.fire({
      title: 'Error!',
      text: 'Failed to load cart summary. Please try again later.',
      icon: 'error',
      confirmButtonText: 'OK'
    }).then(() => {
      window.location.href = 'cart.html';
    });
  }
}

// Setup discount code application
function setupDiscountCode() {
  const applyDiscountBtn = document.getElementById('apply-discount');
  if (!applyDiscountBtn) return;
  
  applyDiscountBtn.addEventListener('click', async function() {
    const discountCode = document.getElementById('discount-code').value.trim();
    
    if (!discountCode) {
      Swal.fire({
        title: 'Error!',
        text: 'Please enter a discount code.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    try {
      // Apply discount - to be implemented in backend
      // const response = await cartAPI.applyDiscount(discountCode);
      
      // For demo, simulate discount
      const subtotalEl = document.querySelector('.card-body .d-flex:nth-child(4) span:last-child');
      const subtotal = parseFloat(subtotalEl.textContent.replace('$', ''));
      
      // Apply 10% discount
      const discountAmount = subtotal * 0.1;
      document.getElementById('discount-amount').textContent = `-$${discountAmount.toFixed(2)}`;
      
      // Update total
      const shippingText = document.querySelector('.card-body .d-flex:nth-child(5) span:last-child').textContent;
      const shipping = shippingText === 'FREE' ? 0 : parseFloat(shippingText.replace('$', ''));
      const tax = parseFloat(document.querySelector('.card-body .d-flex:nth-child(6) span:last-child').textContent.replace('$', ''));
      
      const newTotal = subtotal + shipping + tax - discountAmount;
      document.getElementById('checkout-total').textContent = `$${newTotal.toFixed(2)}`;
      
      Swal.fire({
        title: 'Success!',
        text: 'Discount code applied successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
    } catch (error) {
      console.error('Failed to apply discount:', error);
      
      Swal.fire({
        title: 'Error!',
        text: 'Invalid or expired discount code.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  });
}

// Setup checkout form
function setupCheckoutForm() {
  const checkoutForm = document.getElementById('checkout-form');
  if (!checkoutForm) return;
  
  // Load user addresses if logged in
  const token = localStorage.getItem('token');
  if (token) {
    loadUserAddresses();
  }
  
  checkoutForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate form
    if (!checkoutForm.checkValidity()) {
      e.stopPropagation();
      checkoutForm.classList.add('was-validated');
      return;
    }
    
    // Get form data
    const formData = new FormData(checkoutForm);
    const orderData = {
      // Shipping info
      email: formData.get('email'),
      fullName: formData.get('fullName'),
      shippingAddress: {
        fullName: formData.get('fullName'),
        phoneNumber: formData.get('phone'),
        addressLine1: formData.get('address'),
        addressLine2: formData.get('address2') || '',
        city: formData.get('city'),
        state: formData.get('state'),
        postalCode: formData.get('zip'),
        country: formData.get('country')
      },
      // Payment info
      paymentMethod: formData.get('paymentMethod')
    };
    
    try {
      // For logged in users, use addressId if available
      if (token && formData.get('useExistingAddress') === 'on') {
        const addressId = formData.get('addressId');
        if (addressId) {
          orderData.addressId = addressId;
          // Remove shipping address since we're using existing address
          delete orderData.shippingAddress;
        }
      }
      
      // Create order - to be implemented in backend
      // const response = await orderAPI.createOrder(orderData);
      
      // For demo, simulate order creation
      Swal.fire({
        title: 'Order Placed!',
        text: 'Your order has been placed successfully! A confirmation email has been sent to your email address.',
        icon: 'success',
        confirmButtonText: 'View Order Details'
      }).then(() => {
        // Redirect to order confirmation page
        window.location.href = 'order-confirmation.html?id=123456';
      });
      
    } catch (error) {
      console.error('Failed to place order:', error);
      
      Swal.fire({
        title: 'Error!',
        text: 'Failed to place your order. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  });
  
  // Toggle between existing addresses and new address form
  const addressToggle = document.getElementById('address-toggle');
  if (addressToggle) {
    addressToggle.addEventListener('change', function() {
      const existingAddressForm = document.getElementById('existing-address-form');
      const newAddressForm = document.getElementById('new-address-form');
      
      if (this.checked) {
        existingAddressForm.classList.remove('d-none');
        newAddressForm.classList.add('d-none');
      } else {
        existingAddressForm.classList.add('d-none');
        newAddressForm.classList.remove('d-none');
      }
    });
  }
}

// Load user addresses for checkout page
async function loadUserAddresses() {
  const addressSelect = document.getElementById('address-select');
  if (!addressSelect) return;
  
  try {
    // Import API client
    const { addressAPI } = await import('./api.js');
    
    // Get user addresses
    const response = await addressAPI.getUserAddresses();
    const addresses = response.data.data;
    
    if (addresses && addresses.length > 0) {
      // Enable address toggle
      document.getElementById('address-toggle-container').classList.remove('d-none');
      
      // Populate address dropdown
      let options = '';
      addresses.forEach(address => {
        options += `
          <option value="${address._id}" ${address.isDefault ? 'selected' : ''}>
            ${address.fullName} - ${address.addressLine1}, ${address.city}, ${address.state} ${address.postalCode}
          </option>
        `;
      });
      
      addressSelect.innerHTML = options;
    } else {
      // Hide address toggle if no addresses
      document.getElementById('address-toggle-container').classList.add('d-none');
    }
    
  } catch (error) {
    console.error('Failed to load user addresses:', error);
    
    // Hide address toggle on error
    document.getElementById('address-toggle-container').classList.add('d-none');
  }
}

// Update cart count badge
export function updateCartCount(count) {
  const cartBadges = document.querySelectorAll('.cart-count');
  
  cartBadges.forEach(badge => {
    badge.textContent = count;
    
    if (count > 0) {
      badge.classList.remove('d-none');
    } else {
      badge.classList.add('d-none');
    }
  });
}

// Update cart badge with current item count
async function updateCartBadge() {
  try {
    const response = await cartAPI.getCart();
    const cart = response.data.data;
    
    // Update cart count badge
    updateCartCount(cart.items.length);
    
  } catch (error) {
    console.error('Failed to update cart badge:', error);
    // Don't show error to user, just fail silently
  }
}