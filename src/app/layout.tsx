import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server';
import './globals.css';
import { AchievementProvider } from '@/hooks/use-achievement-state';
import { Toaster } from '@/components/ui/sonner';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';

export const metadata: Metadata = {
  title: '1 J 1',
  description: 'Creative Code meets Audio Engineering',
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
    <ConvexAuthNextjsServerProvider>
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
    </ConvexAuthNextjsServerProvider>
  );
}
