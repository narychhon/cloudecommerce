import React from 'react';

export function Rating({ value = 4.9, count = 121 }) {
  return (
    <span className="rating" role="img" aria-label={`${value} out of 5 stars`}>
      <span aria-hidden="true">★★★★★</span>
      {count > 0 && <small>({count})</small>}
    </span>
  );
}

export default Rating;
