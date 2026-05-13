import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://aichess.com.br'),
  title: {
    default: 'ChessAI — Plataforma Inteligente de Repertórios de Abertura',
    template: '%s | ChessAI',
  },
  description:
    'Construa repertórios de abertura personalizados com análise de engine e IA pedagógica. Aprenda xadrez de forma intuitiva, eficiente e alinhada ao seu estilo de jogo, com o auxílio de desafios e pedagogia personalizada.',
  keywords: [
    'xadrez', 'abertura xadrez', 'repertório xadrez', 'análise xadrez',
    'stockfish', 'chess ai', 'aprender xadrez', 'treino xadrez',
  ],
  authors: [{ name: 'ChessAI Team' }],
  creator: 'ChessAI',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://aichess.com.br',
    siteName: 'ChessAI',
    title: 'ChessAI — Plataforma Inteligente de Repertórios de Abertura',
    description:
      'Construa repertórios de abertura personalizados com análise de engine e IA pedagógica.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ChessAI — Plataforma Inteligente de Repertórios de Abertura',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChessAI — Plataforma Inteligente de Repertórios de Abertura',
    description: 'Construa repertórios de abertura personalizados com análise de engine e IA pedagógica.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
