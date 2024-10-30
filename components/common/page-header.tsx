import classNames from 'classnames';
import React, { FC } from 'react';

import { ComponentBaseProps } from '@/components/common/interface/component.interface';;

type PageHeaderProps = {
  title: string;
  description: string;
} & ComponentBaseProps;

const PageHeader: FC<PageHeaderProps> = ({ className, title, description }) => {
  return (
    <div className={classNames('space-y-0.5', className)}>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default PageHeader;
