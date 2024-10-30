'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import BoderImage from '@/components/common/border-image';

import line from '@/public/assets/svgs/line.svg';
import ProfileBottomFrameBorder from '@/public/assets/svgs/profile-bottom-frame-border.png';

import DashboardAgentList from '@/components/custom/dashboard-agent-list';
import DashboardBottomProfileDecor from '@/components/custom/dashboard-bottom-profile-decor';
import DashboardNotesBoard from '@/components/custom/dashboard-note-board';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { User } from '@/db/schema';
type ProfileWidgetProps = {
  user: User;
  className?: string
};

const ProfileWidget: FC<ProfileWidgetProps> = ({ className, user }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const fetchAgentByUsername = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        const response = await fetch(`/api/agents?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch agent');
        }
        const agents = await response.json();

        setAgents(agents);
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAgentByUsername();
  }, [fetchAgentByUsername]);

  const handleAgentClick = (agent: any) => {
    console.log(agent);
    setSelectedAgent(agent);
    setIsOpenModal(true);
  };


  return (
    <BoderImage
      imageBoder={ProfileBottomFrameBorder.src}
      className={classNames('relative flex w-full max-w-[483px] justify-center p-0', className)}
    >
      <DashboardBottomProfileDecor />
      <div className="w-full">
        <p className="px-8 py-4">Agent Creator ({agents.length})</p>
        <div className="flex flex-col gap-6 px-8 py-6">
          <DashboardAgentList items={agents} onClick={() => { }} />
        </div>
        <Image src={line.src} alt="line" className="w-full" width={line.width} height={line.height} />
        <DashboardNotesBoard address={user.username} />
      </div>
    </BoderImage>
  );
};

export default ProfileWidget;
