// src/components/common/Rating.jsx
import React from 'react';

const Rating = ({ value, onChange, size = 'sm' }) => {
  const stars = [1, 2, 3, 4, 5];
  
  // Determine star sizes based on the size prop
  const getStarClass = () => {
    switch(size) {
      case 'lg': return 'fs-4';
      case 'md': return 'fs-5';
      default: return 'fs-6';
    }
  };
  
  // For static display
  if (!onChange) {
    return (
      <div className="rating">
        {stars.map(star => (
          <i 
            key={star}
            className={`bi ${star <= value ? 'bi-star-fill' : 'bi-star'} text-warning ${getStarClass()}`}
          ></i>
        ))}
      </div>
    );
  }
  
  // For interactive rating selector
  return (
    <div className="rating">
      {stars.map(star => (
        <i 
          key={star}
          className={`bi ${star <= value ? 'bi-star-fill' : 'bi-star'} text-warning ${getStarClass()}`}
          onClick={() => onChange(star)}
          style={{ cursor: 'pointer' }}
        ></i>
      ))}
    </div>
  );
};

export default Rating;