import { PageBaseProps } from '@/common/interfaces';

import { auth } from '@/modules/auth/constants/auth.config';
import ToolRoot from '@/modules/tools/components/tool-root';

type PageProps = PageBaseProps;
export default async function ToolsPage(_pageProps: PageProps) {
  const session = await auth();

  return <ToolRoot session={session} />;
}
