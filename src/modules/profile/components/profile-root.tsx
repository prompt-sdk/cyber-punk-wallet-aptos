'use client';

import { FC, useEffect, useState } from 'react';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';

import DashboardProfile from '@/modules/dashboard/components/dashboard-profile';
import DashboardWidget from '@/modules/dashboard/components/dashboard-widget';

type ProfileRootProps = ComponentBaseProps;

const ProfileRoot: FC<ProfileRootProps> = ({ className }) => {
  return (
    <div className={classNames('flex w-full grow items-center justify-center py-4', className)}>
      <div className="container flex flex-col items-center justify-center gap-6">
        <DashboardProfile />
        <DashboardWidget />
      </div>
    </div>
  );
};

export default ProfileRoot;
