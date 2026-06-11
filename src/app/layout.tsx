import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { DataProvider } from '@/context/DataContext';
import { VisitProvider } from '@/context/VisitContext';

export const metadata: Metadata = {
  title: 'HealthTrack MCH | Community Health Registration & Reporting System',
  description: 'Digital platform for Maternal and Child Health registration, monitoring, and reporting for community health workers in Ethiopia.',
  keywords: 'maternal health management, child health registration, community health information system, digital health reporting, health worker data collection, MCH tracking, Ethiopia health',
  openGraph: {
    title: 'HealthTrack MCH | Community Health Management System',
    description: 'Digitizing maternal and child health registration for Ethiopian communities',
    type: 'website',
    locale: 'en_ET',
  },
  other: {
    'application-name': 'HealthTrack MCH',
    'theme-color': '#0F6CBD',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'HealthTrack MCH',
              applicationCategory: 'HealthApplication',
              description: 'Community Health Registration & Reporting Management System for Maternal and Child Health',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0' },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <AppProvider><DataProvider><VisitProvider>{children}</VisitProvider></DataProvider></AppProvider>
      </body>
    </html>
  );
}
