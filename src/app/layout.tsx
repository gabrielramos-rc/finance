import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';

import { Providers } from '@/components/providers';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Finance | Gestão Financeira Pessoal',
  description:
    'Sistema pessoal de gestão financeira para controle de gastos, orçamentos e investimentos.',
  icons: {
    icon: '/favicon.ico',
  },
  keywords: ['finanças', 'orçamento', 'gastos', 'investimentos', 'controle financeiro'],
  authors: [{ name: 'Gabriel Ramos' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
