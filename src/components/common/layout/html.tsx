import React, { FC, ReactNode } from 'react';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';

import { defaultLocale } from '@/navigation';

type HtmlProps = {
  children?: ReactNode;
  locale?: string;
} & ComponentBaseProps;

const Html: FC<HtmlProps> = ({ className, children, locale = defaultLocale.split('-')[0] }) => {
  return (
    <html className={classNames('h-full', className)} lang={locale}>
      {children}
    </html>
  );
};

export default Html;
