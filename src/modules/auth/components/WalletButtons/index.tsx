'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useKeylessAccount } from '../../context/keyless-account-context';
import useEphemeralKeyPair from '../../hooks/use-ephemeral-key-pair';
import GoogleLogo from '../GoogleLogo';

export default function WalletButtons() {
  const router = useRouter();

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID is not set in env');
  }

  const { keylessAccount } = useKeylessAccount();
  const ephemeralKeyPair = useEphemeralKeyPair();

  useEffect(() => {
    if (keylessAccount) {
      router.push('/home');
    }
  }, [keylessAccount]);

  const redirectUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  const searchParams = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    redirect_uri: 'http://localhost:5173' + '/callback',
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: ephemeralKeyPair.nonce
  });

  redirectUrl.search = searchParams.toString();

  return (
    <div className="flex h-full w-screen items-center justify-center">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Welcome to Aptos</h1>
        <p className="mb-8 text-lg">Sign in with your Google account to continue</p>
        <a
          href={redirectUrl.toString()}
          className="flex items-center justify-center rounded-lg border px-8 py-2 transition-all hover:bg-gray-100 hover:shadow-sm active:scale-95 active:bg-gray-50"
        >
          <GoogleLogo />
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
