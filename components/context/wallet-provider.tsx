'use client';
import { type Network } from '@aptos-labs/ts-sdk';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { ReactNode } from 'react';


export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: process.env.APTOS_NETWORK as Network }}
      optInWallets={['Continue with Google']}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
