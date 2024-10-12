'use client';

import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { WalletProvider } from '@/components/context/WalletProvider';
import { GeoTargetly } from '@/modules/auth-aptos/utils/geo-targetly';

interface ClientProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: any;
}

export default function ClientProviders({ children, locale, messages }: ClientProvidersProps) {
  return (
    <SessionProvider>
      <NextIntlClientProvider timeZone="America/New_York" locale={locale} messages={messages}>
        <WalletProvider>{children}</WalletProvider>
        <GeoTargetly />
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
