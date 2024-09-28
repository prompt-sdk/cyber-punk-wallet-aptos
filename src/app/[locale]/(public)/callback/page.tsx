'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import { EphemeralKeyPair } from '@aptos-labs/ts-sdk';

import { useKeylessAccount } from '@/modules/auth/context/keyless-account-context';
import { getLocalEphemeralKeyPair } from '@/modules/auth/hooks/use-ephemeral-key-pair';
import { getAptosClient } from '@/modules/auth/utils/aptos-client';

const parseJWTFromURL = (url: string): string | null => {
  const urlObject = new URL(url);
  const fragment = urlObject.hash.substring(1);
  const params = new URLSearchParams(fragment);

  return params.get('id_token');
};

function CallbackPage() {
  const { setKeylessAccount } = useKeylessAccount();
  const { push } = useRouter();

  useEffect(() => {
    async function deriveAccount() {
      const jwt = parseJWTFromURL(window.location.href);

      if (!jwt) {
        toast.error('No JWT found in URL. Please try logging in again.');

        return;
      }
      const payload = jwtDecode<{ nonce: string }>(jwt);

      const jwtNonce = payload.nonce;

      const ephemeralKeyPair = getLocalEphemeralKeyPair(jwtNonce);

      if (!ephemeralKeyPair) {
        toast.error('No ephemeral key pair found for the given nonce. Please try logging in again.');

        return;
      }

      await createKeylessAccount(jwt, ephemeralKeyPair);

      push('/chat');
    }

    deriveAccount();
  }, []);

  const createKeylessAccount = async (jwt: string, ephemeralKeyPair: EphemeralKeyPair) => {
    const aptosClient = getAptosClient();
    const keylessAccount = await aptosClient.deriveKeylessAccount({
      jwt,
      ephemeralKeyPair
    });

    const accountCoinsData = await aptosClient.getAccountCoinsData({
      accountAddress: keylessAccount?.accountAddress.toString()
    });

    // account does not exist yet -> fund it
    if (accountCoinsData.length === 0) {
      try {
        await aptosClient.fundAccount({
          accountAddress: keylessAccount.accountAddress,
          amount: 200000000 // faucet 2 APT to create the account
        });
      } catch (error) {
        console.log('Error funding account: ', error);
      }
    }

    setKeylessAccount(keylessAccount);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="relative flex cursor-not-allowed items-center justify-center rounded-lg border px-8 py-2 tracking-wider shadow-sm">
        <span className="absolute -right-1 -top-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
        </span>
        Redirecting...
      </div>
    </div>
  );
}

export default CallbackPage;
