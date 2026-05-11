import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ChessAI — Plataforma Inteligente de Repertórios de Abertura',
    template: '%s | ChessAI',
  },
  description:
    'Construa repertórios de abertura personalizados com análise de engine e IA pedagógica. Aprenda xadrez de forma intuitiva, eficiente e alinhada ao seu estilo de jogo.',
  keywords: [
    'xadrez', 'abertura xadrez', 'repertório xadrez', 'análise xadrez',
    'stockfish', 'chess ai', 'aprender xadrez', 'treino xadrez',
  ],
  authors: [{ name: 'ChessAI Team' }],
  creator: 'ChessAI',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://chessai.app',
    siteName: 'ChessAI',
    title: 'ChessAI — Plataforma Inteligente de Repertórios de Abertura',
    description:
      'Construa repertórios de abertura personalizados com análise de engine e IA pedagógica.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChessAI — Plataforma Inteligente de Repertórios de Abertura',
    description: 'Construa repertórios de abertura personalizados com análise de engine e IA pedagógica.',
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
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
