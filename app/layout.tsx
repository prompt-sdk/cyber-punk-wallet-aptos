import classNames from 'classnames';
import { Metadata } from 'next';
import { Nunito, Orbitron } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

import { ThemeProvider } from '@/components/context/theme-provider';
import { WalletProvider } from '@/components/context/wallet-provider'
import Backdrop from '@/public/assets/images/bg.png';

const fontNunito = Nunito({
  subsets: ['vietnamese'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['300', '400', '500', '700']
});

const fontOrbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
  weight: ['400', '500', '700', '800', '900']
});
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://chat.vercel.ai'),
  title: 'Prompt Wallet - SDK',
  description: 'Prompt Wallet',
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)';
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      suppressHydrationWarning
      className='h-full'
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className={classNames(fontNunito.variable, fontOrbitron.variable, fontOrbitron.className, ' scrollbar flex h-full flex-col antialiased')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div
            className={'nap-root relative flex grow flex-col items-center bg-cover bg-center bg-no-repeat'}
            style={{ backgroundImage: `url(${Backdrop.src})` }}
          >
            <WalletProvider>
              <Toaster />
              {children}
            </WalletProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
