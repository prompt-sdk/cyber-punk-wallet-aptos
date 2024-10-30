import classNames from 'classnames';
import React, { FC } from 'react';

import { ComponentBaseProps } from '@/components/common/interface/component.interface';;

// eslint-disable-next-line import/order
import Link from 'next/link';

type MenuProps = ComponentBaseProps;

const Menu: FC<MenuProps> = ({ className, ...rest }) => {
  return (
    <div className={classNames('menu ml-auto', className)} data-testid="main-menu" {...rest}>
      <Link className="p-2 text-white" href={'/'}>
        Home
      </Link>
      <Link className="p-2 text-white" href={'/posts'}>
        Posts
      </Link>
      <Link className="p-2 text-white" href={'/photos'}>
        Photos
      </Link>
      <Link className="p-2 text-white" href={'/animations'}>
        Animations
      </Link>
      <Link className="p-2 text-white" href={'/game'}>
        Game
      </Link>
      <Link className="p-2 text-white" href={'/ui'}>
        UI Kit
      </Link>
    </div>
  );
};

export default Menu;
