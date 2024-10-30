"use client";
import Image from 'next/image';
import { useRouter } from "next/navigation";

import { WalletSelector } from '@/components/context/wallet-selector';
import LoginBg from '@/public/assets/images/modal-login-frame.png';

import { login, LoginActionState } from "../actions";
export default function Page() {
  const router = useRouter();



  return (
    <div className="flex grow items-center justify-center">
      <div className="container flex flex-col items-center justify-center">

        <div className="relative h-[400px] w-full max-w-[400px]">

          <Image
            src={LoginBg.src}
            alt="Modal Login Frame"
            width={458}
            height={658}
            className="absolute left-0 top-0 z-0 size-full"
          />
          <div className="mb-20 mt-5 flex w-full flex-col gap-3 sm:gap-5">
            <div className='relative z-1 flex h-full flex-col gap-12 px-10 py-14 sm:gap-8 sm:px-7'>
              <h1 className="text-xs sm:text-xl">Welcome to Aptos</h1>
              <p className="text-[10px] sm:text-xs">Sign in with your Google account to continue</p>
              <WalletSelector />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
