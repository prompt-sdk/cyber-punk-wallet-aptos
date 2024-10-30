import { auth } from '@/app/(auth)/auth';

import DashboardProfile from '@/components/custom/dashboard-profile';
import DashboardWidget from '@/components/custom/dashboard-widget';
import { WidgetSelectionModal } from '@/components/custom/widget-selection-modal';


export default async function Page(props: { searchParams: Promise<any> }) {
  const session: any = await auth()
  const user = session.user;

  return (
    <div className={'flex w-full grow items-center justify-center py-4'}>
      <div className="container flex flex-col items-center justify-center gap-6">
        <DashboardProfile user={user} />
        <DashboardWidget user={user} />
        <WidgetSelectionModal user={user} />
      </div>
    </div>);
}
