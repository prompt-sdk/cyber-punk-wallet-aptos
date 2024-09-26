'use client';

import { FC } from 'react';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';

import DashboardProfile from './dashboard-profile';
import DashboardWidget from './dashboard-widget';

type DashboardRootProps = ComponentBaseProps;

const DashboardRoot: FC<DashboardRootProps> = ({ className }) => {
  return (
    <div className={classNames('flex w-full grow items-center justify-center py-4', className)}>
      <div className="container flex flex-col items-center justify-center gap-6">
        <DashboardProfile />
        <DashboardWidget />
      </div>
    </div>
  );
};

export default DashboardRoot;
