import { Nunito, Orbitron } from 'next/font/google';
import classNames from 'classnames';
import { LayoutProps } from '@/common/interfaces';

import MainFooter from '@/components/common/footers/main-footer';
import MainHeader from '@/components/common/headers/main-header';
import Body from '@/components/common/layout/body';
import Head from '@/components/common/layout/head';
import Html from '@/components/common/layout/html';
import Root from '@/components/common/layout/root';

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

export default async function PublicLayout({ children, params }: LayoutProps) {
  return (
    <Html locale={params.locale}>
      <Head />
      <Body className={classNames(fontNunito.variable, fontOrbitron.variable, fontOrbitron.className)}>
        <Root className="overflow-hidden">
          <MainHeader title="Agent Wallet" />
          <div className="flex w-full grow flex-col overflow-hidden">{children}</div>
          <MainFooter />
        </Root>
      </Body>
    </Html>
  );
}
