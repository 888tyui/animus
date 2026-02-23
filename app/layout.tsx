import type { Metadata } from 'next'
import { Instrument_Serif, Outfit } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400'],
  style: ['normal', 'italic'],
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://animus.dev'),
  title: 'Animus — See the soul of your code',
  description:
    'Transform any GitHub repository into an interactive 3D neural network. Files become neurons, imports become synapses — revealing patterns invisible in flat code.',
  icons: {
    icon: '/icon.svg',
    apple: '/mascot.png',
  },
  openGraph: {
    title: 'Animus — See the soul of your code',
    description:
      'Transform any GitHub repository into an interactive 3D neural network.',
    type: 'website',
    images: [{ url: '/mascot.png', width: 512, height: 512, alt: 'Animus mascot' }],
  },
  twitter: {
    card: 'summary',
    title: 'Animus — See the soul of your code',
    description:
      'Transform any GitHub repository into an interactive 3D neural network.',
    images: ['/mascot.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${outfit.variable}`}>
      <body>
        {children}

        {/* Noise grain overlay */}
        <svg className="grain-overlay" width="100%" height="100%">
          <filter id="grain-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect filter="url(#grain-filter)" />
        </svg>
      </body>
    </html>
  )
}
