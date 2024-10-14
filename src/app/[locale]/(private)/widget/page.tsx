'use client';

import { PageBaseProps } from '@/common/interfaces';

import WidgetRoot from '@/modules/widget/components/widget-root';

type PageProps = PageBaseProps;
export default function WidgetPage(_pageProps: PageProps) {
  return <WidgetRoot />;
}
