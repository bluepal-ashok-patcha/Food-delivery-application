import React from 'react';

const ShimmerCard = () => {
  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-md p-4">
      <div className="animate-pulse flex flex-col space-y-4">
        <div className="rounded bg-gray-300 h-48 w-full"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="flex justify-between items-center pt-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

export default ShimmerCard;