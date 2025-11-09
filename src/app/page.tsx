"use client";

import React, { useState, useEffect } from 'react';
import MobileView from '@/components/MobileView';
import DesktopView from '@/components/DesktopView';

export default function Home() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 800);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isClient) {
    return null;
  }

  return isDesktop ? <DesktopView /> : <MobileView />;
}