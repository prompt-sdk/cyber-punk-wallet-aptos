'use client';

import React, { FC } from 'react';
import { Session } from 'next-auth';
import { useTranslations } from 'next-intl';

import { useAuthState } from '../states/auth.state';
import { Button } from '@/components/ui/button';
import { ComponentBaseProps } from '@/common/interfaces';

type AuthenticatedProps = ComponentBaseProps & {
  userSession: Session | null;
};

const Authenticated: FC<AuthenticatedProps> = ({ userSession, ...rest }) => {
  const t = useTranslations();
  const authState = useAuthState();

  if (!userSession) return null;

  return (
    <div className="flex items-center space-x-1" data-testid="authenticated" {...rest}>
      <strong data-testid="username">{userSession.user.name}</strong>
      <Button className="rounded-full" onClick={() => authState.signOut({ redirect: true, callbackUrl: '/' })}>
        {t('signout')}
      </Button>
    </div>
  );
};

export default Authenticated;
