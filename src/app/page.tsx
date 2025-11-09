"use client";

import React from 'react';
import MobileView from '@/components/MobileView';
import DesktopView from '@/components/DesktopView';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Home() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileView /> : <DesktopView />;
}