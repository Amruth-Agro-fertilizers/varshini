import type { Metadata, Viewport } from 'next';
import { Anton, Archivo, Instrument_Serif } from 'next/font/google';
import './globals.css';

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
});

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

const instrument = Instrument_Serif({
  weight: '400',
  style: 'italic',
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Varshini Fertilizers — Your Brand. Our Plant.',
  description:
    'White-label organic, bio and NPK fertilizer manufacturing from Varshini Fertilizers Pvt Ltd. Sell your own label, made at our plant.',
};

export const viewport: Viewport = {
  themeColor: '#fbfaf7',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${archivo.variable} ${instrument.variable}`}>
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
