import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';
import LayoutShell from '@/components/layout/LayoutShell';
import AuthProvider from '@/components/providers/AuthProvider';
import dynamic from 'next/dynamic';

// ─── Performance: Next.js font optimization (self-hosted, no render-blocking CSS) ───
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  preload: false,
});

// ─── Performance: Lazy-load non-critical components ───
const AIChatWidget = dynamic(() => import('@/components/chat/AIChatWidget'), {
  ssr: false,
  loading: () => null,
});

const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { ssr: false, loading: () => null }
);

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e1b4b',
};

export const metadata: Metadata = {
  title: {
    default: 'LifeLink Mental Medical Center | Premium Healthcare in Kenya',
    template: '%s | LifeLink Mental Medical Center',
  },
  description:
    'Kenya\'s premier mental and medical healthcare center. Expert psychiatrists, therapists, and counselors providing world-class care. Book your session today.',
  keywords: [
    'mental health kenya', 'therapy nairobi', 'psychiatrist kenya', 'online therapy',
    'counseling', 'depression treatment', 'anxiety treatment', 'couples therapy',
    'corporate wellness kenya', 'telehealth kenya'
  ],
  openGraph: {
    title: 'LifeLink Mental Medical Center',
    description: 'Premium mental & medical healthcare in Kenya',
    url: 'https://lifelink.co.ke',
    siteName: 'LifeLink Mental Medical Center',
    locale: 'en_KE',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://lifelink.co.ke'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* DNS prefetch for API and external services */}
        <link rel="dns-prefetch" href="//localhost:4000" />
        <link rel="preconnect" href="//localhost:4000" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#312e81', color: '#fff', borderRadius: '12px' },
            success: { iconTheme: { primary: '#22d3ee', secondary: '#312e81' } },
          }}
        />
        <LayoutShell>
          {children}
        </LayoutShell>
        <AIChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
