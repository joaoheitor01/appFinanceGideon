// src/components/common/ChartSkeleton.jsx
import React from 'react';

const ChartSkeleton = () => {
  return (
    <div className="card-main animate-pulse flex flex-col justify-between p-6 rounded-lg shadow-lg min-h-[300px]">
      {/* Header/Title Placeholder */}
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
      
      {/* Chart Area Placeholder */}
      <div className="flex-grow bg-gray-800 rounded-lg"></div>
      
      {/* Legend/Footer Placeholder */}
      <div className="flex justify-end mt-4 space-x-2">
        <div className="h-4 bg-gray-700 rounded w-16"></div>
        <div className="h-4 bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  );
};

export default ChartSkeleton;