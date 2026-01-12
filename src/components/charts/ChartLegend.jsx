// src/components/charts/ChartLegend.jsx
import React from 'react';

const ChartLegend = ({ items }) => {
  return (
    <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-text-secondary">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <span
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: item.color }}
          ></span>
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default ChartLegend;
