/**
 * Utility functions for the Smart Road System Frontend
 */

// Format rating for display
export const formatRating = (rating) => {
  return parseFloat(rating).toFixed(2);
};

// Get rating color class
export const getRatingColor = (rating) => {
  if (rating >= 4.5) return 'bg-green-100 text-green-800';
  if (rating >= 4.0) return 'bg-blue-100 text-blue-800';
  if (rating >= 3.0) return 'bg-yellow-100 text-yellow-800';
  if (rating >= 2.0) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

// Get rating category text
export const getRatingCategory = (rating) => {
  if (rating >= 4.5) return 'Excellent ✓';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.0) return 'Good';
  if (rating >= 2.0) return 'Fair ⚠';
  return 'Poor ✗';
};

// Get risk level color
export const getRiskColor = (riskLevel) => {
  switch (riskLevel) {
    case 'Very Low':
      return 'bg-green-100 text-green-800';
    case 'Low':
      return 'bg-blue-100 text-blue-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'High':
      return 'bg-orange-100 text-orange-800';
    case 'Very High':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Format date for display
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Check if road is under warranty
export const isUnderWarranty = (warrantyEndDate) => {
  return new Date() <= new Date(warrantyEndDate);
};

// Calculate days until warranty expiration
export const daysUntilWarrantyExpiration = (warrantyEndDate) => {
  const today = new Date();
  const expiry = new Date(warrantyEndDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Format warranty period
export const formatWarrantyPeriod = (warrantyEndDate) => {
  const days = daysUntilWarrantyExpiration(warrantyEndDate);
  
  if (days < 0) {
    return `Expired ${Math.abs(days)} days ago`;
  }
  
  if (days === 0) {
    return 'Expires today';
  }
  
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;

  let result = [];
  if (years > 0) result.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) result.push(`${months} month${months > 1 ? 's' : ''}`);
  if (remainingDays > 0) result.push(`${remainingDays} day${remainingDays > 1 ? 's' : ''}`);

  return result.join(', ') + ' remaining';
};

// Convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
};

// Validate email
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate phone
export const validatePhone = (phone) => {
  const regex = /^\+?[0-9\s\-()]{10,}$/;
  return regex.test(phone);
};

// Calculate average rating
export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return (sum / ratings.length).toFixed(2);
};

// Get damage type emoji
export const getDamageTypeEmoji = (damageType) => {
  const emojiMap = {
    'Pothole': '🕳️',
    'Crack': '🔀',
    'Erosion': '🌊',
    'Flooding': '💧',
    'Other': '⚠️'
  };
  return emojiMap[damageType] || '❓';
};

// Get severity emoji
export const getSeverityEmoji = (severity) => {
  const emojiMap = {
    'Low': '🟢',
    'Medium': '🟡',
    'High': '🟠',
    'Critical': '🔴'
  };
  return emojiMap[severity] || '❓';
};
