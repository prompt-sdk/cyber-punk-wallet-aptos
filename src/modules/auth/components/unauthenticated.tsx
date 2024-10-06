'use client';

import React, { FC } from 'react';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/navigation';
import { ComponentBaseProps } from '@/common/interfaces';
import { Button } from '@/components/ui/button';

const Unauthenticated: FC<ComponentBaseProps> = ({ visible = false, ...rest }) => {
  const router = useRouter();
  const t = useTranslations();

  if (!visible) return null;

  return (
    <div className="flex items-center gap-x-3" data-testid="unauthenticated" {...rest}>
      <Button className="rounded-full" data-testid="btn-signin" onClick={() => router.push({ pathname: '/login' })}>
        {t('signin')}
      </Button>
    </div>
  );
};

export default Unauthenticated;
