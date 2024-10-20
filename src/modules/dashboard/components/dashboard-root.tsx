'use client';

import { FC, useEffect, useState } from 'react';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';
import { signOut } from 'next-auth/react';
import DashboardProfile from './dashboard-profile';
import DashboardWidget from './dashboard-widget';
import { WidgetSelectionModal } from './widget-selection-modal';
import { useWallet } from '@aptos-labs/wallet-adapter-react';


type DashboardRootProps = ComponentBaseProps;

const DashboardRoot: FC<DashboardRootProps> = ({ className }) => {
  const { connected } = useWallet();
  const [isConnected, setIsConnected] = useState(false);
  const handleSignOut = async () => {
    await signOut();
  }
  useEffect(() => {
    if (connected) {
      setIsConnected(true);
    } else {
      //  handleSignOut();
    }
  }, [connected])
  return (
    <div className={classNames('flex w-full grow items-center justify-center py-4', className)}>
      {isConnected ? (
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
