// src/utils/validators.js

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  
  // For a stronger password, you can add more checks
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumbers = /\d/.test(password);
  // const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return { isValid: true, message: 'Password is valid' };
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether phone number is valid
 */
export const isValidPhone = (phone) => {
  // Basic phone validation - can be adjusted for specific formats
  const phoneRegex = /^\+?[0-9]{8,15}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
};

/**
 * Validate if a value is empty
 * @param {*} value - Value to check
 * @returns {boolean} Whether value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Validate postal code format
 * @param {string} postalCode - Postal code to validate
 * @param {string} countryCode - Country code (default: 'VN' for Vietnam)
 * @returns {boolean} Whether postal code is valid
 */
export const isValidPostalCode = (postalCode, countryCode = 'VN') => {
  if (!postalCode) return false;
  
  // Different regex for different countries
  const postalRegexes = {
    VN: /^\d{6}$/,
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
  };
  
  const regex = postalRegexes[countryCode] || /^\w+$/;
  return regex.test(postalCode);
};