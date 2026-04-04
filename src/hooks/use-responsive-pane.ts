import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';

export type BreakpointTier = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ResponsivePaneConfig {
  style: { width: string; height: string };
  distanceFactor: number;
  tier: BreakpointTier;
  isPortrait: boolean;
  isMobile: boolean;   // xs, sm, or md (stacked layouts)
  isTablet: boolean;   // md only
  isDesktop: boolean;  // lg or xl (side-by-side layouts)
  viewportWidth: number;
  viewportHeight: number;
}

interface TierConfig {
  widthPercent: number;
  maxWidth: number;
  heightPercent: number;
  maxHeight: number;
  distanceFactor: number;
}

const TIER_CONFIGS: Record<BreakpointTier, TierConfig> = {
  xs: { widthPercent: 0.95, maxWidth: 380,  heightPercent: 0.85, maxHeight: 600,  distanceFactor: 10 },
  sm: { widthPercent: 0.90, maxWidth: 450,  heightPercent: 0.95, maxHeight: 900,  distanceFactor: 10 },
  md: { widthPercent: 0.85, maxWidth: 650,  heightPercent: 0.85, maxHeight: 750,  distanceFactor: 11 },
  lg: { widthPercent: 0.55, maxWidth: 700,  heightPercent: 0.65, maxHeight: 500,  distanceFactor: 17 },
  xl: { widthPercent: 0.40, maxWidth: 750,  heightPercent: 0.35, maxHeight: 500,  distanceFactor: 20 },
};

function getTier(width: number): BreakpointTier {
  if (width < 400) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1200) return 'md';  // Extended tablet range
  if (width < 1600) return 'lg';
  return 'xl';
}

export function useResponsivePane(
  maxWidth?: number,
  maxHeight?: number
): ResponsivePaneConfig {
  const { size } = useThree();

  return useMemo(() => {
    const tier = getTier(size.width);
    const config = TIER_CONFIGS[tier];
    const isPortrait = size.height > size.width;

    // Calculate dimensions based on viewport percentages with constraints
    let width = Math.round(size.width * config.widthPercent);
    let height = Math.round(size.height * config.heightPercent);

    // Apply tier max constraints
    width = Math.min(width, config.maxWidth);
    height = Math.min(height, config.maxHeight);

    // Apply optional caller-specified max constraints
    if (maxWidth) width = Math.min(width, maxWidth);
    if (maxHeight) height = Math.min(height, maxHeight);

    // Ensure minimum usable size
    width = Math.max(width, 280);
    height = Math.max(height, 400);

    return {
      style: {
        width: `${width}px`,
        height: `${height}px`,
      },
      distanceFactor: config.distanceFactor,
      tier,
      isPortrait,
      isMobile: tier === 'xs' || tier === 'sm' || tier === 'md',
      isTablet: tier === 'md',
      isDesktop: tier === 'lg' || tier === 'xl',
      viewportWidth: size.width,
      viewportHeight: size.height,
    };
  }, [size.width, size.height, maxWidth, maxHeight]);
}
