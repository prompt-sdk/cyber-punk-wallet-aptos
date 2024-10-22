'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { ComponentBaseProps } from '@/common/interfaces';

import { LoginFormData } from '../interfaces/login.interface';

import { useToast } from '@/hooks/use-toast';
import ChatPopup from '@/modules/chat/components/chat-popup';
import { WalletSelector } from '@/components/context/WalletSelector';
import { Toaster } from '@/components/ui/toaster';

// Import the SVG directly
import ModalLoginFrame from '@/assets/svgs/modal-login-frame.svg';

type LoginRootProps = ComponentBaseProps;

const LoginRoot: FC<LoginRootProps> = ({ className }) => {
  const { toast } = useToast();
  const [openPopup, setOpenPopup] = useState(false);

  const form = useForm<LoginFormData>({
    mode: 'onChange'
  });

  const { handleSubmit } = form;

  const onSubmit = (_data: LoginFormData) => {
    toast({
      title: 'This is a success message!',
      description: 'This is a success message!',
      variant: 'default'
    });
  };

  return (
    <div className={classNames('flex grow items-center justify-center', className)}>
      <div className="container flex flex-col items-center justify-center">
        <div className="relative h-[400px] w-full max-w-[400px]">
          <Image
            src={'/modal-login-frame.png'}
            alt="Modal Login Frame"
            width={458}
            height={658}
            className="absolute left-0 top-0 z-0 h-full w-full"
          />
          <form
            className="relative z-1 flex h-full flex-col gap-12 px-10 py-14 sm:gap-8 sm:px-7"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mb-20 mt-5 flex w-full flex-col gap-3 sm:gap-5">
              <h1 className="text-xs sm:text-xl">Welcome to Aptos</h1>
              <p className="text-[10px] sm:text-xs">Sign in with your Google account to continue</p>
            </div>
            <WalletSelector />
          </form>
        </div>
      </div>

      <ChatPopup visible={openPopup} onClose={() => setOpenPopup(false)} />
      <Toaster />
    </div>
  );
};

export default LoginRoot;
