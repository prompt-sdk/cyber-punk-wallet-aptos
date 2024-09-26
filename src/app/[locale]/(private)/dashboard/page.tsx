'use client';

import { PageBaseProps } from '@/common/interfaces';

import DashboardRoot from '@/modules/dashboard/components/dashboard-root';

type PageProps = PageBaseProps;
export default function ProfilePage(_pageProps: PageProps) {
  return <DashboardRoot />;
}
