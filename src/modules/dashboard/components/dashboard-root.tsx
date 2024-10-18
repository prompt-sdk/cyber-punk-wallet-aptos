'use client';

import { FC, useEffect, useState } from 'react';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';

import DashboardProfile from './dashboard-profile';
import DashboardWidget from './dashboard-widget';
import { useSession } from 'next-auth/react';
import { WidgetSelectionModal } from './widget-selection-modal';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

type DashboardRootProps = ComponentBaseProps;

const DashboardRoot: FC<DashboardRootProps> = ({ className }) => {
  const { connected } = useWallet();

  return (
    <div className={classNames('flex w-full grow items-center justify-center py-4', className)}>
      {connected ? (
        <div className="container flex flex-col items-center justify-center gap-6">
          <DashboardProfile />
          <DashboardWidget />
          <WidgetSelectionModal />
        </div>
      ) : (
        <div className="text-center">
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
};

export default DashboardRoot;
