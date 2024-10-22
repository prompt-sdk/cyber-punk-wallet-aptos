'use client';

import { FC, useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Session } from 'next-auth/types';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';
import { AccountInfo, useWallet } from '@aptos-labs/wallet-adapter-react';

import DashboardProfile from './dashboard-profile';
import DashboardWidget from './dashboard-widget';
import { WidgetSelectionModal } from './widget-selection-modal';

type DashboardRootProps = ComponentBaseProps & {
  session: Session | null;
};

const DashboardRoot: FC<DashboardRootProps> = ({ className, session }) => {
  const { connected: hasConnected, account } = useWallet();
  const [isConnected, setIsConnected] = useState(false);

  const handle = async (handleAccount: AccountInfo) => {
    if (handleAccount?.address == session?.user.username) {
      setIsConnected(true);
    } else {
      await signOut();
    }
  };
  const disconnect = async () => {
    await signOut();
  }
  useEffect(() => {
    if (hasConnected && account) {
      handle(account);
    } else {
      disconnect()
    }
  }, [account, hasConnected]);

  return (
    <div className={classNames('flex w-full grow items-center justify-center py-4', className)}>
      {isConnected ? (
        <div className="container flex flex-col items-center justify-center gap-6">
          <DashboardProfile />
          <DashboardWidget session={session} />
          <WidgetSelectionModal session={session} />
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
