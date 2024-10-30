import dynamic from 'next/dynamic';
import React, { FC, ReactNode } from 'react';

interface INoSSRProps {
  children: ReactNode;
}

const NoSSR: FC<INoSSRProps> = props => <>{props.children}</>;

export default dynamic(() => Promise.resolve(NoSSR), { ssr: false });
