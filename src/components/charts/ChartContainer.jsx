// src/components/charts/ChartContainer.jsx
import React from 'react';

const ChartContainer = ({ children, innerRef }) => {
  return (
    <div ref={innerRef} className="card h-full flex flex-col">
      {children}
    </div>
  );
};

export default ChartContainer;
