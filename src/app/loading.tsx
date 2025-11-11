import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-gray-200"></div>
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-primary border-t-transparent animate-spin" style={{ animationDuration: '800ms' }}></div>
      </div>
    </div>
  );
}