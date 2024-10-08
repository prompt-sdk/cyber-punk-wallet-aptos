'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import classNames from 'classnames';
import { SettingsIcon } from 'lucide-react';
import { ComponentBaseProps } from '@/common/interfaces';
import CustomButton from '@/libs/svg-icons/input/custom-button';

import BoderImage from '@/components/common/border-image';

import GoogleLogo from '@/modules/auth-aptos/components/GoogleLogo';
import { useGetNFTInBalance } from '@/modules/auth-aptos/hooks/use-query';
import { collapseAddress } from '@/modules/auth-aptos/utils/address';

import AvatarImage from '@/assets/images/avatar/avatar-1.jpeg';
import ProfileElementDecor1 from '@/assets/svgs/profile-element-decor-1.svg';

import DashboardAvatar from './dashboard-avatar';
import DashboardTopProfileDecor from './dashboard-top-profile-decor';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

type DashboardProfileProps = ComponentBaseProps;

const DashboardProfile: FC<DashboardProfileProps> = ({ className }) => {
  const [balance, setBalance] = useState<string | null>(null);
  const { account } = useWallet();

  const { fetchNFTs } = useGetNFTInBalance();

  const loadBalance = useCallback(async () => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const respo = await axios.get(
      `https://aptos-testnet.nodit.io/${
        process.env.NEXT_PUBLIC_API_KEY_NODIT
      }/v1/accounts/${account?.address.toString()}/resources`,
      options
    );
    const datas = respo?.data[1];
    const resBalance = datas?.data?.coin.value;
    const formatBalance = Number(resBalance ? resBalance : 0) * Math.pow(10, -8);

    setBalance(formatBalance.toFixed(2));
  }, [account]);

  useEffect(() => {
    if (account?.address) {
      loadBalance();
      fetchNFTs();
    }
  }, [account?.address]);

  if (!account?.address) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center px-4">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Welcome to Aptos!</h1>
          <p className="mb-8 text-lg">Please login</p>
          <div className="grid gap-2">
            <Link
              href="/"
              className="flex cursor-not-allowed items-center justify-center rounded-lg border px-8 py-2 shadow-sm"
            >
              <GoogleLogo />
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BoderImage className={classNames('relative flex w-full max-w-[483px] justify-center', className)}>
      <DashboardTopProfileDecor />
      <div className="relative flex flex-col gap-6 px-4 py-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex grow flex-wrap items-center gap-2 md:flex-nowrap">
            <DashboardAvatar className="shrink-0" imageUrl={AvatarImage.src} altText="Avatar" />
            <div className="flex w-full flex-col items-start gap-3">
              <p className="text-wrap break-words text-xl font-bold">
                {collapseAddress(account?.address.toString() as string)}
              </p>
              <p className="text-sm">Welcome back</p>
            </div>
          </div>
          <SettingsIcon className="h-6 w-6 shrink-0 cursor-pointer" onClick={() => {}} />
        </div>

        <div className="relative flex flex-wrap justify-between gap-2">
          <div className="flex grow flex-col gap-2">
            <p className="text-base text-[#636363]">Total balance</p>
            <p className="text-h2">{balance}</p>
          </div>
          <div
            className="flex shrink-0 flex-col justify-end font-semibold underline"
            style={{
              textUnderlineOffset: '4px'
            }}
          >
            <p>TOKENS (3)</p>
          </div>
          <Image
            src={ProfileElementDecor1.src}
            alt="Profile Top Right Element Decor"
            width={ProfileElementDecor1.width}
            height={ProfileElementDecor1.height}
            className="absolute right-0 top-0 z-0 -translate-y-1/2"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
          <CustomButton className="w-full md:w-auto" onClick={() => {}}>
            <i className="ico-send-right-icon" /> Send
          </CustomButton>
          <CustomButton className="w-full md:w-auto" onClick={() => {}}>
            <i className="ico-wallet-icon" /> Receive
          </CustomButton>
        </div>
      </div>
    </BoderImage>
  );
};

export default DashboardProfile;
