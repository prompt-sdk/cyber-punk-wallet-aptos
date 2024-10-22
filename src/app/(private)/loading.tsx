'use client';

import { PageBaseProps } from '@/common/interfaces';

type PageProps = PageBaseProps;
export default function LoadingPage(_pageProps: PageProps) {
  return (
    <div className={'flex w-full grow items-center justify-center py-4'}>
      <div className="text-center">
        <p>Loading...</p>
      </div>
    </div>
  );
}
