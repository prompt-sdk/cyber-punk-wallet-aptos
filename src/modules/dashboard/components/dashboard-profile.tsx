'use client';

import { FC } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import { SettingsIcon } from 'lucide-react';
import { ComponentBaseProps } from '@/common/interfaces';
import CustomButton from '@/libs/svg-icons/input/custom-button';

import BoderImage from '@/components/common/border-image';

import AvatarImage from '@/assets/images/avatar/avatar-1.jpeg';
import ProfileElementDecor1 from '@/assets/svgs/profile-element-decor-1.svg';

import DashboardAvatar from './dashboard-avatar';
import DashboardTopProfileDecor from './dashboard-top-profile-decor';

type DashboardProfileProps = ComponentBaseProps;

const DashboardProfile: FC<DashboardProfileProps> = ({ className }) => {
  return (
    <BoderImage className={classNames('relative flex w-full max-w-[483px] justify-center', className)}>
      <DashboardTopProfileDecor />
      <div className="relative flex flex-col gap-6 px-4 py-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex grow flex-wrap items-center gap-2 md:flex-nowrap">
            <DashboardAvatar className="shrink-0" imageUrl={AvatarImage.src} altText="Avatar" />
            <div className="flex w-full flex-col items-start gap-3">
              <p className="text-wrap break-words text-xl font-bold">quangchinh.unwallet</p>
              <p className="text-sm">Welcome back</p>
            </div>
          </div>
          <SettingsIcon className="h-6 w-6 shrink-0 cursor-pointer" onClick={() => {}} />
        </div>

        <div className="relative flex flex-wrap justify-between gap-2">
          <div className="flex grow flex-col gap-2">
            <p className="text-base text-[#636363]">Total balance</p>
            <p className="text-h2">$17,200</p>
          </div>
          <div
            className="flex shrink-0 flex-col justify-end font-semibold underline"
            style={{
              textUnderlineOffset: '4px'
            }}
          >
            <p>TOKENS (3)</p>
          </div>
          <Image
            src={ProfileElementDecor1.src}
            alt="Profile Top Right Element Decor"
            width={ProfileElementDecor1.width}
            height={ProfileElementDecor1.height}
            className="absolute right-0 top-0 z-0 -translate-y-1/2"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
          <CustomButton className="w-full md:w-auto" onClick={() => {}}>
            <i className="ico-send-right-icon" /> Send
          </CustomButton>
          <CustomButton className="w-full md:w-auto" onClick={() => {}}>
            <i className="ico-wallet-icon" /> Receive
          </CustomButton>
        </div>
      </div>
    </BoderImage>
  );
};

export default DashboardProfile;
