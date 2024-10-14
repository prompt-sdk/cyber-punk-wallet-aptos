'use client';

import { PageBaseProps } from '@/common/interfaces';

import ProfileRoot from '@/modules/profile/components/profile-root';

type PageProps = PageBaseProps;
export default function ProfilePage(_pageProps: PageProps) {
  return <ProfileRoot />;
}
