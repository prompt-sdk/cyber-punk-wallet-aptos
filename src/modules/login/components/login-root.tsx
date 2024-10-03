'use client';

import { FC, useEffect, useState } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { ComponentBaseProps } from '@/common/interfaces';
import { zodResolver } from '@hookform/resolvers/zod';

import { useRouter } from '@/navigation';

import { LoginFormData } from '../interfaces/login.interface';

import AugementedButton from '@/modules/augmented/components/chat-area';
import { useKeylessAccount } from '@/modules/auth/context/keyless-account-context';
import useEphemeralKeyPair from '@/modules/auth/hooks/use-ephemeral-key-pair';
import FormNameField from '@/modules/form/components/form-name-field';
import { useToast } from '@/modules/toast/context/toast.context';

import ModalLoginFrame from '@/assets/svgs/modal-login-frame.svg';
import TransparentBtnFrame from '@/assets/svgs/transparent-btn-frame.svg';
import WhiteBtnFrame from '@/assets/svgs/white-btn-frame.svg';

import { loginFormSchema } from '../validations/login-form';
import ChatPopup from '@/modules/chat/components/chat-popup';

type LoginRootProps = ComponentBaseProps;

const LoginRoot: FC<LoginRootProps> = ({ className }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [openPopup, setOpenPopup] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onChange'
  });

  const {
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = form;

  const onSubmit = (_data: LoginFormData) => {
    showToast('This is a success message!', 'success');

    // console.log(data);
    // Handle form submission
  };
  const name = watch('name');

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID is not set in env');
  }

  const { keylessAccount } = useKeylessAccount();
  const ephemeralKeyPair = useEphemeralKeyPair();

  useEffect(() => {
    if (keylessAccount) {
      router.push('/chat');
    }
  }, [keylessAccount]);

  const redirectUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  const searchParams = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    // local
    // redirect_uri: 'http://localhost:5173' + '/callback',
    // vercel
    redirect_uri:
      typeof window !== 'undefined'
        ? `${window.location.origin}/callback`
        : (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_VERCEL_URL) +
          '/callback',
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: ephemeralKeyPair.nonce
  });

  redirectUrl.search = searchParams.toString();

  return (
    <div className={classNames('flex grow items-center justify-center', className)}>
      <div className="container flex flex-col items-center justify-center">
        <div className="relative w-full max-w-[458px]">
          <Image
            src={ModalLoginFrame.src}
            alt="Modal Login Frame"
            width={ModalLoginFrame.width}
            height={ModalLoginFrame.height}
            className="absolute left-0 top-0 z-0 h-full w-full"
          />
          <form
            className="relative z-1 flex flex-col gap-4 px-10 py-14 sm:gap-8 sm:px-7"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <h1 className="text-xs sm:text-xl">Welcome to Aptos</h1>
              <p className="text-[10px] sm:text-xs">Sign in with your Google account to continue</p>
            </div>
            <div className="lg-gap-3 flex flex-col gap-1">
              <FormNameField label="Name" name="name" form={form} error={errors.name} isValid={isValid} value={name} />
            </div>

            <div className="flex flex-col gap-3 sm:gap-5">
              <button type="submit">
                <Image src={WhiteBtnFrame.src} alt="create" width={WhiteBtnFrame.width} height={WhiteBtnFrame.height} />
              </button>
              <hr />
              <a href={redirectUrl.toString()}>
                <Image
                  src={TransparentBtnFrame.src}
                  alt="sign in with google"
                  width={TransparentBtnFrame.width}
                  height={TransparentBtnFrame.height}
                />
              </a>
            </div>
          </form>
        </div>
        <button onClick={() => setOpenPopup(true)}>chat popup</button>
      </div>
      <ChatPopup visible={openPopup} onClose={() => setOpenPopup(false)} />
    </div>
  );
};

export default LoginRoot;
