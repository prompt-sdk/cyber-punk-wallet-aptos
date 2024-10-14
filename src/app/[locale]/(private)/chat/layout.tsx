import { Nunito, Orbitron } from 'next/font/google';
import classNames from 'classnames';
import { LayoutProps } from '@/common/interfaces';
import { SidebarDesktop } from '@/modules/chat/components/sidebar-desktop'
import Body from '@/components/common/layout/body';
import Head from '@/components/common/layout/head';
import Html from '@/components/common/layout/html';
import BoderImage from '@/components/common/border-image';
import ChatBorderFrame from '@/assets/svgs/chat-border-frame.svg';
import { Toaster } from '@/components/ui/toaster';
import Image from 'next/image';
import BackIcon from '@/assets/svgs/back-icon.svg';
import EditIcon from '@/assets/svgs/edit-icon.svg';

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
        <div className="flex w-full grow flex-col overflow-hidden">
          <div className='container flex grow flex-col items-center justify-center gap-6 overflow-hidden'>
            <BoderImage imageBoder={ChatBorderFrame.src} className="flex w-full grow flex-col overflow-hidden border-0">
              <div className="flex h-14 w-full shrink-0 items-center justify-between border-b-2 border-[#292F36] px-7">
                <button className="h-10 w-10" >
                  <Image
                    src={BackIcon.src}
                    alt="Back Icon"
                    className="h-full w-full translate-y-1 object-contain"
                    width={BackIcon.width}
                    height={BackIcon.height}
                  />
                </button>
                <button className="flex h-8 items-center justify-center gap-2" >
                  <Image
                    src={EditIcon.src}
                    alt="Back Icon"
                    className="h-full w-full object-contain"
                    width={EditIcon.width}
                    height={EditIcon.height}
                  />
                  <span className="text-nowrap">New Chat</span>
                </button>
              </div>
              <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] rounded-b-3xl overflow-hidden">
                <SidebarDesktop />
                {children}
              </div>

            </BoderImage>
          </div>
        </div>
        <Toaster />
      </Body>
    </Html>
  );
}
