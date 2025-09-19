import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import NavigatorBar from '@/components/NavigatorBar';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Banco de Talentos',
  description: 'Projeto Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />

        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              var pref = localStorage.getItem('theme') || 'auto';
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              var mode = pref === 'auto' ? (prefersDark ? 'dark' : 'light') : pref;

              var root = document.documentElement;
              root.setAttribute('data-theme', mode);

              // Se você usa classes também:
              root.classList.remove('theme-light','theme-dark');
              if (mode === 'light') root.classList.add('theme-light');
              if (mode === 'dark') root.classList.add('theme-dark');
            } catch(_) {}
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <NavigatorBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
