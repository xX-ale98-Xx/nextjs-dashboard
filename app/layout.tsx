import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: {
    template: '%s | OMP! Dashboard',
    default: 'OMP! Dashboard',
  },
  description: 'OMP è la nuova piattaforma online che aiuta i professionisti della riabilitazione muscolo-scheletrica.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
openGraph: {
    title: 'OMP! Dashboard',
    description: 'OMP è la nuova piattaforma online che aiuta i professionisti della riabilitazione muscolo-scheletrica.',
    url: 'https://next-learn-dashboard.vercel.sh',
    siteName: 'OMP! - OhMyPhysio',
    images: [
      {
        url: 'https://nextjs-dashboard-ecru-eight-84.vercel.app/OMP_logo_rsz-removebg.png',
        width: 1200,
        height: 630,
        alt: 'OMP! - OhMyPhysio',
      },
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OMP! - OhMyPhysio',
    description: 'OMP è la nuova piattaforma online che aiuta i professionisti della riabilitazione muscolo-scheletrica.',
    site: '@OMPDashboard',
    images: ['https://nextjs-dashboard-ecru-eight-84.vercel.app/OMP_logo_rsz-removebg.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  alternates: {
    canonical: 'https://next-learn-dashboard.vercel.sh',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
