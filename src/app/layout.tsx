import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { ClientOnly } from './ClientOnly'; // import the helper

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Event Calendar',
  description: 'A Google Calendar-like event management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientOnly>
          <AuthProvider>{children}</AuthProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
