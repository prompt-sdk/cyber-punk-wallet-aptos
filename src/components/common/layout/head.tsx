import React, { FC, ReactNode } from 'react';

import HeadInjector from './head-injector';

type HeadProps = {
  children?: ReactNode;
};

const Head: FC<HeadProps> = ({ children }) => {
  return (
    // eslint-disable-next-line @next/next/no-head-element
    <head>
      {children}
      <HeadInjector />
    </head>
  );
};

export default Head;
