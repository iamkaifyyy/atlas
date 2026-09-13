'use client';

import React from 'react';

export const WatermarkShape: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none -z-10 w-[500px] h-[500px] flex items-center justify-center opacity-30 ${className}`}
      aria-hidden="true"
    >
      <div className="w-full h-full rounded-full bg-[radial-gradient(ellipse_at_center,rgba(13,116,206,0.12),transparent_70%)]" />
    </div>
  );
};
