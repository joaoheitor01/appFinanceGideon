// src/components/charts/ChartHeader.jsx
import React from 'react';

const ChartHeader = ({ title, children }) => {
  return (
    <div className="flex justify-between items-center pb-4 border-b border-border-color">
      <h3 className="h3 text-text-primary">{title}</h3>
      {children}
    </div>
  );
};

export default ChartHeader;
