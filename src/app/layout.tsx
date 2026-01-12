import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AchievementProvider } from '@/hooks/use-achievement-state';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: '1 J 1',
  description: 'Creative Code meets Audio Engineering',
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
