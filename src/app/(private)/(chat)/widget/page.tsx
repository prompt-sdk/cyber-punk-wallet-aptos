import { Session } from 'next-auth/types';
import { PageBaseProps } from '@/common/interfaces';

import { auth } from '@/modules/auth/constants/auth.config';
import WidgetRoot from '@/modules/widget/components/widget-root';

type PageProps = PageBaseProps;
export default async function WidgetPage(_pageProps: PageProps) {
  const session: Session | null = await auth();

  return <WidgetRoot session={session} />;
}
