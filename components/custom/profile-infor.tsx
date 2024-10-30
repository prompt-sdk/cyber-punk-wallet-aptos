'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import classNames from 'classnames';
import { Copy, LogOut, SettingsIcon } from 'lucide-react';
import CustomButton from '@/components/custom/custom-button';

import BoderImage from '@/components/common/border-image';

import { collapseAddress } from '@/components/utils/address';
import ProfileElementDecor1 from '@/public/assets/svgs/profile-element-decor-1.svg';

import DashboardAvatar from '@/components/custom/dashboard-avatar';
import DashboardTopProfileDecor from '@/components/custom/dashboard-top-profile-decor';
import { useToast } from '@/hooks/use-toast';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { getAptosBalance } from '@/components/utils/aptos-client';
import { User } from '@/db/schema';

type ProfileInforProps = {
  user: User;
  className?: string
};

const ProfileInfor: FC<ProfileInforProps> = ({ className, user }) => {
  const [balance, setBalance] = useState<string | null>(null);
  const { toast } = useToast();

  const loadBalance = useCallback(async () => {
    if (user) {
      try {
        const balance = await getAptosBalance(user.username);
        // console.log('balance', balance);
        setBalance(Number(balance).toFixed(2));
      } catch (error) {
        console.error('Error loading balance:', error);
      }
    }

  }, [user]);

  useEffect(() => {
    if (user) {
      loadBalance();
    }

  }, [user]);

  const copyAddress = useCallback(async () => {

    try {
      await navigator.clipboard.writeText(user.username);
      toast({
        title: 'Success',
        description: 'Copied wallet address to clipboard.'
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy wallet address.'
      });
    }
  }, [user]);

  return (
    <BoderImage className={classNames('relative flex w-full max-w-[483px] justify-center', className)}>
      <DashboardTopProfileDecor />
      <div className="relative flex w-full flex-col gap-6 px-4 py-6">
        <div className="flex w-full flex-wrap items-start justify-between gap-2">
          <div className="flex grow flex-wrap items-center gap-2 md:flex-nowrap">
            <DashboardAvatar className="shrink-0" imageUrl={'/assets/images/avatar/avatar-1.jpeg'} altText="Avatar" />
            <div className="flex w-full flex-col items-start gap-3">
              <p className="text-wrap break-words text-xl font-bold">{user && collapseAddress(user.username)}</p>
              <p className="text-sm">Wellcome</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SettingsIcon className="h-6 w-6 shrink-0 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={copyAddress} className="gap-2">
                <Copy className="h-4 w-4" /> Copy address
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative flex flex-wrap justify-between gap-2">
          <div className="flex grow flex-col gap-2">
            <p className="text-base text-[#636363]">Total balance</p>
            <p className="text-h2">{balance ? balance : '0'}</p>
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
      </div>
    </BoderImage>
  );
};

export default ProfileInfor;
