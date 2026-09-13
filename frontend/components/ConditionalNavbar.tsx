'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

export const ConditionalNavbar: React.FC = () => {
  const pathname = usePathname();

  // Render Navbar ONLY on homepage ('/' i.e. http://localhost:3000/)
  if (pathname !== '/') {
    return null;
  }

  return <Navbar />;
};
