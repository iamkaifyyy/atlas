'use client';

import React from 'react';

export const WatermarkShape: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none -z-10 w-[680px] h-[680px] sm:w-[850px] sm:h-[850px] flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      {/* Outer ambient glow halo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-coral/15 via-emerald-500/10 to-action-blue/15 blur-3xl opacity-60 animate-pulse-glow" />

      {/* SVG Geometric Holographic Graphic */}
      <svg
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full opacity-[0.14] animate-spin-ultra-slow"
      >
        <defs>
          <linearGradient id="wm-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff7759" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="wm-grad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1863dc" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ff7759" stopOpacity="0.6" />
          </linearGradient>
          <radialGradient id="wm-center" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff7759" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Center Glow Sphere */}
        <circle cx="400" cy="400" r="280" fill="url(#wm-center)" />

        {/* Outer Concentric Orbital Coordinate Rings */}
        <circle cx="400" cy="400" r="380" stroke="url(#wm-grad1)" strokeWidth="1" strokeDasharray="6 10" />
        <circle cx="400" cy="400" r="340" stroke="url(#wm-grad2)" strokeWidth="1.5" opacity="0.7" />
        <circle cx="400" cy="400" r="300" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="3 6" opacity="0.5" />
        <circle cx="400" cy="400" r="250" stroke="url(#wm-grad1)" strokeWidth="1" />
        <circle cx="400" cy="400" r="190" stroke="url(#wm-grad2)" strokeWidth="1.5" strokeDasharray="12 8" />
        <circle cx="400" cy="400" r="130" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
        <circle cx="400" cy="400" r="70" stroke="url(#wm-grad1)" strokeWidth="2" />

        {/* Angular Geometric Crosshairs & Ray Matrix */}
        <line x1="400" y1="20" x2="400" y2="780" stroke="url(#wm-grad1)" strokeWidth="1" strokeDasharray="8 8" opacity="0.5" />
        <line x1="20" y1="400" x2="780" y2="400" stroke="url(#wm-grad1)" strokeWidth="1" strokeDasharray="8 8" opacity="0.5" />
        <line x1="131" y1="131" x2="669" y2="669" stroke="url(#wm-grad2)" strokeWidth="0.75" strokeDasharray="4 8" opacity="0.4" />
        <line x1="669" y1="131" x2="131" y2="669" stroke="url(#wm-grad2)" strokeWidth="0.75" strokeDasharray="4 8" opacity="0.4" />

        {/* Rotated Hexagram / Cryptographic Octagon Geometries */}
        <polygon
          points="400,100 660,250 660,550 400,700 140,550 140,250"
          stroke="url(#wm-grad1)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.8"
        />
        <polygon
          points="400,140 625,270 625,530 400,660 175,530 175,270"
          stroke="url(#wm-grad2)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="10 5"
          opacity="0.6"
        />
        <polygon
          points="250,140 550,140 700,400 550,660 250,660 100,400"
          stroke="#ffffff"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        />

        {/* Central Delta Crest Triangle */}
        <polygon
          points="400,220 540,490 260,490"
          stroke="url(#wm-grad1)"
          strokeWidth="2.5"
          fill="none"
          opacity="0.9"
        />
        <polygon
          points="400,260 505,470 295,470"
          stroke="url(#wm-grad2)"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
        <polygon
          points="400,490 260,220 540,220"
          stroke="#ffffff"
          strokeWidth="0.75"
          fill="none"
          strokeDasharray="6 6"
          opacity="0.35"
        />

        {/* Celestial Node Points */}
        <circle cx="400" cy="100" r="5" fill="#ff7759" />
        <circle cx="660" cy="250" r="5" fill="#ffffff" />
        <circle cx="660" cy="550" r="5" fill="#10b981" />
        <circle cx="400" cy="700" r="5" fill="#ff7759" />
        <circle cx="140" cy="550" r="5" fill="#1863dc" />
        <circle cx="140" cy="250" r="5" fill="#ffffff" />
        <circle cx="400" cy="220" r="4" fill="#ffffff" />
        <circle cx="540" cy="490" r="4" fill="#ff7759" />
        <circle cx="260" cy="490" r="4" fill="#10b981" />
      </svg>
    </div>
  );
};
