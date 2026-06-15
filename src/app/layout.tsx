import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Skillquest - Plataforma de Treinamentos Gamificados',
  description: 'Plataforma gamificada para treinamentos corporativos obrigatorios',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="16x16" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
