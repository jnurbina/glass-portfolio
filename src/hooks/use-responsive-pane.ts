import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';

export function useResponsivePane(desktopWidth: number, desktopHeight: number) {
  const { size } = useThree();
  const isMobile = size.width < 768;

  return useMemo(() => {
    return {
      style: {
        width: isMobile ? '340px' : `${desktopWidth}px`, // Fixed small width for mobile to force wrapping
        height: isMobile ? '600px' : `${desktopHeight}px`,
      },
      distanceFactor: isMobile ? 8 : 15, // Closer on mobile to appear larger
      isMobile,
    };
  }, [size.width, isMobile, desktopWidth, desktopHeight]);
}
