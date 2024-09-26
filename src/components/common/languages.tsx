import React, { FC } from 'react';
import { ComponentBaseProps } from '@/common/interfaces';

import { Link } from '@/navigation';

import FlagUK from '../icons/flag-en';
import FlagVN from '../icons/flag-vn';

const Languages: FC<ComponentBaseProps> = ({ ...rest }) => {
  return (
    <div className="languages ml-6 flex items-center" data-testid="languages" {...rest}>
      <Link className="flex items-center space-x-2 p-2 text-white" href="/" locale="vi-vn" data-testid="vi-vn-flag">
        <FlagVN />
        <span>Vietnamese</span>
      </Link>
      <Link className="flex items-center space-x-2 p-2 text-white" href="/" locale="en-us" data-testid="en-us-flag">
        <FlagUK />
        <span>English</span>
      </Link>
    </div>
  );
};

export default Languages;
