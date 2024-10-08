import { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales } from '@/config';

import {
  COMPANY_NAME,
  COMPANY_URL,
  WEBSITE_DESCRIPTION,
  WEBSITE_KEYWORD,
  WEBSITE_NAME,
  WEBSITE_URL
} from '@/common/constants/site.constant';
import { LayoutProps } from '@/common/interfaces';
import { GeoTargetly } from '@/modules/auth-aptos/utils/geo-targetly';
import { WalletProvider } from '@/components/context/WalletProvider';

export default async function RootLayout({ children, params: { locale } }: LayoutProps) {
  unstable_setRequestLocale(locale);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!locales.includes(locale as any)) notFound();

  let messages;

  try {
    messages = (await import(`@/locales/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <NextIntlClientProvider timeZone="America/New_York" locale={locale} messages={messages}>
      <WalletProvider>{children}</WalletProvider>
      <GeoTargetly />
    </NextIntlClientProvider>
  );
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' }
  ]
};

export async function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata(_layoutProps: LayoutProps): Promise<Metadata> {
  // https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields
  return {
    metadataBase: new URL(WEBSITE_URL),
    title: {
      default: WEBSITE_NAME,
      template: '%s | ' + WEBSITE_NAME
    },
    description: WEBSITE_DESCRIPTION,
    applicationName: WEBSITE_NAME,
    keywords: WEBSITE_KEYWORD,
    creator: COMPANY_NAME,
    publisher: COMPANY_NAME,
    authors: [{ name: COMPANY_NAME, url: COMPANY_URL }],
    twitter: {
      title: WEBSITE_NAME,
      description: WEBSITE_DESCRIPTION,
      card: 'summary_large_image',
      creator: '@creator',
      images: { url: '/og-img.jpg', alt: WEBSITE_NAME }
    },
    openGraph: {
      siteName: WEBSITE_NAME,
      title: WEBSITE_NAME,
      description: WEBSITE_DESCRIPTION,
      type: 'website',
      images: [{ alt: WEBSITE_NAME, url: '/og-img.jpg', width: 1200, height: 630 }]
    },
    verification: {
      google: 'VERIFICATION_CODE',
      yandex: 'YANDEX_CODE',
      yahoo: 'YAHOO_CODE'
    },
    alternates: {
      canonical: '/',
      languages: {
        'en-US': `${WEBSITE_URL}/en-us`,
        'vi-VN': `${WEBSITE_URL}/vi-vn`
      },
      types: {
        'application/rss+xml': `${WEBSITE_URL}/rss`
      }
    },
    icons: [
      {
        rel: 'shortcut icon',
        type: 'image/x-icon',
        url: '/favicon.ico'
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        url: '/favicon.ico'
      },
      {
        rel: 'icon',
        sizes: '192x192',
        url: '/icon-192.png'
      },
      {
        rel: 'icon',
        sizes: '512x512',
        url: '/icon-512.png'
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        url: '/apple-touch-icon.png'
      },
      {
        rel: 'mask-icon',
        sizes: '192x192',
        url: '/icon-192-maskable.png'
      },
      {
        rel: 'mask-icon',
        sizes: '512x512',
        url: '/icon-512-maskable.png'
      }
    ],
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true
      }
    },
    manifest: '/manifest.webmanifest',
    other: {
      HandheldFriendly: 'true',
      MobileOptimized: '360',
      google: 'notranslate'
    }
  };
}
