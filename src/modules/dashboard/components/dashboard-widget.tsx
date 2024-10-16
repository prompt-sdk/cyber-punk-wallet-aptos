'use client';

import { FC, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import BoderImage from '@/components/common/border-image';
import line from '@/assets/svgs/line.svg';
import ProfileBottomFrameBorder from '@/assets/svgs/profile-bottom-frame-border.png';

import DashboardAgentList from './dashboard-agent-list';
import DashboardBottomProfileDecor from './dashboard-bottom-profile-decor';
import DashboardNotesBoard from './dashboard-note-board';
import DashboardWidgetTools from './dashboard-widget-tools';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import AugmentedPopup from '@/modules/augmented/components/augmented-popup';
import DashboardAvatar from './dashboard-avatar';
import axios from 'axios';
import { useSession } from 'next-auth/react';
type DashboardWidgetProps = ComponentBaseProps;

const DashboardWidget: FC<DashboardWidgetProps> = ({ className }) => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { account } = useWallet();
  const [selectedAgent, setSelectedAgent] = useState(null) as any;
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();

  const createAgentAPI = async (agentData: {
    name: string;
    description: string;
    introMessage: string;
    tools: string[];
    widget: string[];
    prompt: string;
    user_id: string;
  }) => {
    try {
      const response = await axios.post('/api/agent', agentData);
      return response.data;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  };

  const fetchAgentByUsername = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = account?.address.toString();
      if (userId) {
        const response = await fetch(`/api/agent?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch agent');
        }
        let agents = await response.json();
        console.log(agents);

        if (agents.length === 0) {
          // Create a new agent if no agents are found
          const newAgent = await createAgentAPI({
            name: 'Default Agent',
            description: 'This is your default agent.',
            introMessage: "Hello! I'm your default agent ready to assist you.",
            tools: [],
            widget: [],
            prompt: '',
            user_id: userId
          });
          agents = [newAgent];
        }

        // Add avatar to each agent
        const updatedAgents = agents.map((agent: any) => ({
          ...agent,
          avatar: `/avatar1.png`
        }));

        setAgents(updatedAgents);
      }
    } catch (error) {
      console.error('Error fetching or creating agent:', error);
      toast({
        title: 'Error',
        description: 'There was a problem fetching or creating the agent. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [account, toast]);

  useEffect(() => {
    fetchAgentByUsername();
  }, [fetchAgentByUsername]);

  const handleAgentClick = (agent: any) => {
    console.log(agent);
    setSelectedAgent(agent);
    setIsOpenModal(true);
  };

  const startChat = async (agentId: string) => {
    router.push(`/chat?agentId=${agentId}`);
  };
  // console.log(agents);

  return (
    <BoderImage
      imageBoder={ProfileBottomFrameBorder.src}
      className={classNames('relative flex w-full max-w-[483px] justify-center p-0', className)}
    >
      <DashboardBottomProfileDecor />
      <div className="w-full">
        <p className="px-8 py-4">Agent Creator ({agents.length})</p>
        <div className="flex flex-col gap-6 px-8 py-6">
          {isLoading ? (
            <div className="flex h-20 items-center justify-center">
              <p>Loading agents...</p>
            </div>
          ) : (
            <DashboardAgentList onClick={handleAgentClick} items={agents} />
          )}
        </div>
        <Image src={line.src} alt="line" className="w-full" width={line.width} height={line.height} />
        <DashboardNotesBoard />
        <div className="px-8 py-6">
          <DashboardWidgetTools />
        </div>
      </div>
      <AugmentedPopup
        visible={isOpenModal}
        onClose={() => {
          setIsOpenModal(false);
          setSelectedAgent(null);
        }}
        textHeading={'Profile Agent'}
      >
        {selectedAgent && (
          <div className="flex max-h-[80vh] flex-col items-center gap-4 overflow-y-auto p-8">
            <DashboardAvatar imageUrl={selectedAgent.avatar} altText={selectedAgent.name} />
            <h2 className="text-xl font-bold">{selectedAgent.name}</h2>
            <p className="text-center">Description: {selectedAgent.description}</p>
            <p className="italic">Intro Message: "{selectedAgent.introMessage}"</p>
            <div className="mt-4 flex w-full justify-end">
              <button
                onClick={() => startChat(selectedAgent._id)}
                className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
              >
                Start Chat
              </button>
            </div>
          </div>
        )}
      </AugmentedPopup>
    </BoderImage>
  );
};

export default DashboardWidget;
