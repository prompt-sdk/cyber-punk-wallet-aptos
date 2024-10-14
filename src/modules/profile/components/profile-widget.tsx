'use client';

import { FC } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';

import { DASH_BOARD_AGENT_LIST } from '@/modules/dashboard/constants/dashboard-data.constant';

import BoderImage from '@/components/common/border-image';

import line from '@/assets/svgs/line.svg';
import ProfileBottomFrameBorder from '@/assets/svgs/profile-bottom-frame-border.png';

import DashboardAgentList from '@/modules/dashboard/components/dashboard-agent-list';
import DashboardBottomProfileDecor from '@/modules/dashboard/components/dashboard-bottom-profile-decor';
import DashboardNotesBoard from '@/modules/dashboard/components/dashboard-note-board';

type ProfileWidgetProps = ComponentBaseProps;

const ProfileWidget: FC<ProfileWidgetProps> = ({ className }) => {
  return (
    <BoderImage
      imageBoder={ProfileBottomFrameBorder.src}
      className={classNames('relative flex w-full max-w-[483px] justify-center p-0', className)}
    >
      <DashboardBottomProfileDecor />
      <div className="w-full">
        <p className="px-8 py-4">Agent Creator (9)</p>
        <div className="flex flex-col gap-6 px-8 py-6">
          <DashboardAgentList items={DASH_BOARD_AGENT_LIST} />
        </div>
        <Image src={line.src} alt="line" className="w-full" width={line.width} height={line.height} />
        <DashboardNotesBoard />
      </div>
    </BoderImage>
  );
};

export default ProfileWidget;
