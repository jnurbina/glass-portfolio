import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AchievementProvider } from '@/hooks/use-achievement-state';
import { Toaster } from '@/components/ui/sonner';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';

export const metadata: Metadata = {
  title: 'Glass Portfolio',
  description: 'A portfolio of my work, built with Next.js and Three.js.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Instantiate the font
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <AchievementProvider>
            {children}
            <Toaster />
          </AchievementProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
