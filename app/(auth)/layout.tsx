
import MainFooter from '@/components/common/footers/main-footer';
import MainHeader from '@/components/common/headers/main-header';
import { LayoutProps } from '@/components/common/interface/layout.interface';

export default async function PublicLayout({ children }: LayoutProps) {
  return (
    <>
      <MainHeader />
      <div className="flex w-full grow flex-col overflow-hidden">{children}</div>
      <MainFooter />
    </>
  );
}
