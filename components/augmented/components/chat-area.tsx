'use client';

import classNames from 'classnames';
import { FC } from 'react';

import { ComponentBaseProps } from '@/components/common/interface/component.interface';

import '../style.scss';

type AugementedButtonProps = ComponentBaseProps;

const AugementedButton: FC<AugementedButtonProps> = () => {
  return (
    <>
      <div
        data-augmented-ui
        className={classNames('aug-tl1-20 aug-tl2-10 aug-clip-tl', 'aug-clip-br aug-br-40', 'bg-slate-200 p-3')}
      >
        Augmented Button
      </div>
    </>
  );
};

export default AugementedButton;
