'use client';

import { PageBaseProps } from '@/common/interfaces';

import AgentRoot from '@/modules/agent/components/agent-root';

type PageProps = PageBaseProps;
export default function WidgetPage(_pageProps: PageProps) {
  return <AgentRoot />;
}
