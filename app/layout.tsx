import type { Metadata } from 'next';
import './globals.css';
import './raster-overrides.css';
import './clan-badge.css';

export const metadata: Metadata = {
  title: 'Clan Manager',
  description: 'Painel administrativo para gestão de clã no Clash of Clans',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
