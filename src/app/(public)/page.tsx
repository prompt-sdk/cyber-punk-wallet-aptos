'use client';

import { PageBaseProps } from '@/common/interfaces';

import ClientOnly from '@/modules/auth-aptos/components/ClientOnly';
import LoginRoot from '@/modules/login/components/login-root';

type PageProps = PageBaseProps;
export default function LoginPage(_pageProps: PageProps) {
  return (
    <ClientOnly>
      <LoginRoot />
    </ClientOnly>
  );
}
