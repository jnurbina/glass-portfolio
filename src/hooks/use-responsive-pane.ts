import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';

export function useResponsivePane(desktopWidth: number, desktopHeight: number) {
  const { size } = useThree();
  const isMobile = size.width < 768;

  return useMemo(() => {
    // For desktop, ensure we don't exceed the actual window pixels
    const width = isMobile ? 340 : Math.min(desktopWidth, size.width * 0.9);
    const height = isMobile ? 600 : Math.min(desktopHeight, size.height * 0.85);

    return {
      style: {
        width: `${width}px`,
        height: `${height}px`,
      },
      distanceFactor: isMobile ? 8 : 15,
      isMobile,
    };
  }, [size.width, size.height, isMobile, desktopWidth, desktopHeight]);
}
