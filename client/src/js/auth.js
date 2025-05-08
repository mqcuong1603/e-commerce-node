// src/js/auth.js
import { authAPI } from './api/index.js';
import { showToast } from './utils.js';

/**
 * Initialize authentication functionality
 */
export function setupAuth() {
  // Set up login form
  setupLoginForm();
  
  // Set up register form
  setupRegisterForm();
  
  // Set up forgot password form
  setupForgotPasswordForm();
  
  // Set up logout functionality
  setupLogout();
  
  // Set up profile forms if on profile page
  if (window.location.pathname.includes('profile.html')) {
    setupProfileForms();
  }
}

/**
 * Check user authentication status and update UI
 */
export async function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const authMenuItems = document.getElementById('auth-menu-items');
  const userMenuItems = document.getElementById('user-menu-items');
  
  if (!authMenuItems || !userMenuItems) return;
  
  if (token) {
    try {
      // Get user profile from the API
      const response = await authAPI.getProfile();
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      const userData = response.data;
      
      // Store user data in localStorage for easy access
      localStorage.setItem('userId', userData._id);
      localStorage.setItem('userFullName', userData.fullName);
      localStorage.setItem('userEmail', userData.email);
      
      // Update UI elements with user data
      document.querySelectorAll('.user-fullname').forEach(el => {
        el.textContent = userData.fullName;
      });
      
      // Show user menu, hide auth menu
      authMenuItems.classList.add('d-none');
      userMenuItems.classList.remove('d-none');
      
      // Show admin-only elements if user is admin
      if (userData.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
          el.classList.remove('d-none');
        });
      }
      
      return userData;
    } catch (error) {
      console.error('Failed to verify authentication:', error);
      
      // Clear invalid token and user data
      clearAuthData();
      
      // Show auth menu, hide user menu
      authMenuItems.classList.remove('d-none');
      userMenuItems.classList.add('d-none');
      
      return null;
    }
  } else {
    // No token, show auth menu, hide user menu
    authMenuItems.classList.remove('d-none');
    userMenuItems.classList.add('d-none');
    
    return null;
  }
}

/**
 * Clear authentication data from local storage
 */
export function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userFullName');
  localStorage.removeItem('userEmail');
}

/**
 * Set up login form
 */
function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;
  
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simple validation
    if (!email || !password) {
      showToast('Error', 'Please enter both email and password.', 'error');
      return;
    }
    
    try {
      // Submit login request
      const response = await authAPI.login({ email, password });
      
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }
      
      // Get user and token from response
      const { token, _id, fullName, email: userEmail, role } = response.data;
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('userId', _id);
      localStorage.setItem('userFullName', fullName);
      localStorage.setItem('userEmail', userEmail);
      
      // Show success message
      Swal.fire({
        title: 'Success!',
        text: 'You have been logged in successfully!',
        icon: 'success',
        confirmButtonText: 'Continue'
      }).then(() => {
        // Redirect to previous page or home page
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
        window.location.href = redirectUrl;
      });
      
    } catch (error) {
      console.error('Login failed:', error);
      
      // Show error message
      Swal.fire({
        title: 'Login Failed',
        text: error.message || 'Invalid email or password.',
        icon: 'error',
        confirmButtonText: 'Try Again'
      });
    }
  });
  
  // Handle social login buttons if present
  const googleLoginBtn = document.getElementById('google-login');
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '/api/auth/google';
    });
  }
  
  const facebookLoginBtn = document.getElementById('facebook-login');
  if (facebookLoginBtn) {
    facebookLoginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '/api/auth/facebook';
    });
  }
}

/**
 * Set up registration form
 */
function setupRegisterForm() {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;
  
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const email = document.getElementById('register-email').value;
    const fullName = document.getElementById('register-fullname').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Simple validation
    if (!email || !fullName || !password || !confirmPassword) {
      showToast('Error', 'Please fill in all required fields.', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      showToast('Error', 'Passwords do not match.', 'error');
      return;
    }
    
    // Get address data
    const address = {
      fullName: document.getElementById('register-address-fullname').value || fullName,
      phoneNumber: document.getElementById('register-phone').value,
      addressLine1: document.getElementById('register-address-line1').value,
      addressLine2: document.getElementById('register-address-line2').value || '',
      city: document.getElementById('register-city').value,
      state: document.getElementById('register-state').value,
      postalCode: document.getElementById('register-postal-code').value,
      country: document.getElementById('register-country').value
    };
    
    try {
      // Submit registration request
      const response = await authAPI.register({
        email,
        fullName,
        password,
        address
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
      
      // Show success message
      Swal.fire({
        title: 'Registration Successful!',
        text: 'Your account has been created! You will receive a welcome email with login details.',
        icon: 'success',
        confirmButtonText: 'Continue to Login'
      }).then(() => {
        // Redirect to login page
        window.location.href = 'login.html';
      });
      
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Show error message
      Swal.fire({
        title: 'Registration Failed',
        text: error.message || 'Please check your information and try again.',
        icon: 'error',
        confirmButtonText: 'Try Again'
      });
    }
  });
}

/**
 * Set up logout functionality
 */
function setupLogout() {
  const logoutButtons = document.querySelectorAll('.logout-button');
  
  logoutButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Clear authentication data
      clearAuthData();
      
      // Show success message
      Swal.fire({
        title: 'Logged Out',
        text: 'You have been logged out successfully!',
        icon: 'success',
        confirmButtonText: 'Continue'
      }).then(() => {
        // Redirect to home page
        window.location.href = 'index.html';
      });
    });
  });
}