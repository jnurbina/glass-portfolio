import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AchievementProvider } from '@/hooks/use-achievement-state';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Glass Portfolio',
  description: 'A portfolio of my work, built with Next.js and Three.js.',
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
        <AchievementProvider>
          {children}
          <Toaster />
        </AchievementProvider>
      </body>
    </html>
  );
}
