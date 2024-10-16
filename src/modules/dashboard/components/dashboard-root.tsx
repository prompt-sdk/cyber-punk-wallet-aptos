'use client';

import { FC, useEffect, useState } from 'react';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';

import DashboardProfile from './dashboard-profile';
import DashboardWidget from './dashboard-widget';
import { useSession } from 'next-auth/react';
import { WidgetSelectionModal } from './widget-selection-modal';

type DashboardRootProps = ComponentBaseProps;

const DashboardRoot: FC<DashboardRootProps> = ({ className }) => {
  const { data: session } = useSession();


  return (
    session ? <div className={classNames('flex w-full grow items-center justify-center py-4', className)}>
      <div className="container flex flex-col items-center justify-center gap-6">
        <DashboardProfile />
        <DashboardWidget />
        <WidgetSelectionModal />
      </div>
    </div> :
      <div className={classNames('flex w-full grow items-center justify-center py-4', className)}>
        <div className="container flex flex-col items-center justify-center gap-6">
          loading
        </div>
      </div>
  );
};

export default DashboardRoot;
