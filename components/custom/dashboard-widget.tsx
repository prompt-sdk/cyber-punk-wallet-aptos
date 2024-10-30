'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import classNames from 'classnames';
import BoderImage from '@/components/common/border-image';

import ChatPopup from '@/components/custom/chat-popup';

import line from '@/public/assets/svgs/line.svg';
import ProfileBottomFrameBorder from '@/public/assets/svgs/profile-bottom-frame-border.png';

import DashboardAgentList from './dashboard-agent-list';
import DashboardBottomProfileDecor from './dashboard-bottom-profile-decor';
import DashboardNotesBoard from './dashboard-note-board';
import { User } from '@/db/schema';

type DashboardWidgetProps = {
  user: User | null;
  className?: string
};

const DashboardWidget: FC<DashboardWidgetProps> = ({ className, user }) => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  // const router = useRouter();
  const [toolIds, setToolIds] = useState('');
  const [widgetIds, setWidgetIds] = useState('');
  const [tools, setTools] = useState([]);
  const [isLoadingTools, setIsLoadingTools] = useState(true);
  const [isLoadingWidget, setIsLoadingWidget] = useState(true);

  const createDefaultAgent = useCallback(async () => {

    const defaultAgent = {
      name: 'Staking Agent',
      description: 'This is a staking agent.',
      intro: 'Hello! I am your staking agent.',
      tool: [toolIds, widgetIds],
      prompt: `create button action stake 0.1 aptos to ${user?.id}`,
      userId: user?.id,
      avatar: '/assets/images/avatar/logo_aptos.png',
      suggestedActions: [
        {
          title: 'Stake APT',
          description: 'Stake 0.1 APT',
          content: `create button action stake 0.1 aptos to ${user?.id}`
        },
        {
          title: 'Transfer APT',
          description: 'Send 0.1 APT to 0x1',
          content: `create button action transfer 0.1 aptos to 0x1`
        },
        {
          title: 'View Balance',
          description: 'View my balance.',
          content: `create label view balance for ${user?.id}`
        },
        {
          title: 'View Transactions',
          description: 'View my transaction history.',
          content: `create label view total transactions for ${user?.id}`
        }
      ],
      createdAt: Date.now(),
      address: user?.username
    };

    await createAgentAPI(defaultAgent as any);
    fetchAgents();
  }, [toolIds, widgetIds]);

  const fetchTools = useCallback(async () => {
    setIsLoadingTools(true);
    try {
      const userId = user?.id;
      const response = await axios.get(`/api/tools?userId=${userId}`);
      if (response) {
        const contractTools = response.data.filter((tool: any) => tool.type === 'contractTool');
        setTools(contractTools);
      }

      //console.log('contractTools', contractTools);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setIsLoadingTools(false);
    }
  }, []);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const createAgentAPI = async (agentData: {
    name: string;
    description: string;
    intro: string;
    tool: string[];
    prompt: string;
    userId: string;
    createdAt: number;
    suggestedActions: any[];
    avatar: string;
  }) => {
    try {
      const response = await axios.post('/api/agents', agentData);

      return response.data;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  };

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);

    try {
      if (user?.id) {
        const response = await axios.get(`/api/agents?userId=${user?.id}`);
        const fetchedAgents = response.data;
        console.log('fetchedAgents', fetchedAgents);
        setAgents(fetchedAgents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [createDefaultAgent]);

  useEffect(() => {
    fetchAgents();
  }, [user]);

  const uploadDataToApi = async (data: any) => {
    try {
      const response = await axios.post('/api/tools', data);

      return response.data.result.id;
    } catch (error) {
      console.error('Error uploading data:', error);
    }
  };

  const createToolAPI = useCallback(async () => {
    const toolData = {
      id: crypto.randomUUID(),
      typeName: 'contractTool',
      name: `0x1::delegation_pool::add_stake`,
      description:
        "The `add_stake` function allows a delegator to add a specified amount of coins to the delegation pool. This amount is converted into shares, which represent the delegator's stake in the pool. The function ensures that the delegator is allowlisted and synchronizes the delegation pool with the underlying stake pool before executing the addition. The function also calculates and deducts any applicable fees from the added stake, ensuring that the delegator's balance is updated accordingly.",
      params: {
        user: {
          type: 'address',
          description: 'The address of the delegator.'
        },
        amount: {
          type: 'u64',
          description: 'The amount of coins to be added to the delegation pool.'
        }
      },
      type_params: [],
      typeFunction: 'entry',
      functions: 'add_stake',
      address: '0x1',
      userId: user?.id
    };

    //console.log('Tool data:', toolData);
    try {
      await uploadDataToApi(toolData);

      if (toolData.id) {
        setToolIds(toolData.id); // Ensure toolIds is set only if toolId is valid
        console.log('toolData.id', toolData.id);
      } else {
        console.error('Failed to create tool, toolId is null');
      }
    } catch (error) {
      console.error('Error creating tool:', error);
    }
  }, []);

  useEffect(() => {
    if (!isLoadingTools && tools.length === 0) {
      createToolAPI();
    }
  }, [isLoadingTools, tools, createToolAPI]);

  const saveWidget = useCallback(async () => {
    setIsLoadingWidget(true);
    if (user?.id) {
      try {
        const widgetData = {
          id: crypto.randomUUID(),
          typeName: 'widgetTool',
          description: `create button action stake 0.1 aptos to ${user?.id}`,
          prompt: 'create button action stake 0.1 aptos to 0x123123',
          code: `(props) => {
              return (
                  <a href={'/chat?prompt=stake 0.1 aptos to ${user?.id} &widgetId=' + props.widgetId} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                      stake 0.1 aptos to ${user?.id}
                  </a>
              )
          }`,
          toolWidget: [toolIds],
          userId: user?.id,
          name: 'Widget Stake'
        };
        try {
          await uploadDataToApi(widgetData);
          if (widgetData.id) {
            setWidgetIds(widgetData.id); // Ensure toolIds is set only if toolId is valid
            console.log('widgetData.id', widgetData.id);
          } else {
            console.error('Failed to create widget, widgetId is null');
          }
        } catch (error) {
          console.error('Error creating tool:', error);
        }
      } catch (error) {
        console.error('Error saving widget:', error);
      } finally {
        setIsLoadingWidget(false);
      }
    }
  }, [toolIds]);

  useEffect(() => {
    if (toolIds?.length > 0) {
      saveWidget();
    }
  }, [saveWidget, toolIds]);

  useEffect(() => {
    //console.log('Checking to create default agent:', { toolIds, widgetIds, agents });
    // Check if both toolIds and widgetIds are set and agents are empty
    if (toolIds?.length > 0 && widgetIds?.length > 0 && agents.length === 0) {
      createDefaultAgent();
    }
  }, [createDefaultAgent, widgetIds, agents.length, toolIds]);

  const handleAgentClick = (agent: any) => {
    console.log(agent);
    setSelectedAgent(agent);
    setIsOpenModal(true);
  };

  // const startChat = async (agentId: string) => {
  //   router.push(`/chat?agentId=${agentId}`);
  // };
  //console.log(agents);

  return (
    <BoderImage
      imageBoder={ProfileBottomFrameBorder.src}
      className={classNames('relative flex w-full max-w-[483px] justify-center p-0', className)}
    >
      <DashboardBottomProfileDecor />
      <div className="w-full">
        <Link href="/agent">
          <p className="px-8 py-4">Agent Creator ({agents.length})</p>
        </Link>
        <div className="flex flex-col gap-6 px-8 py-6">
          {isLoading ? (
            <div className="flex h-20 items-center justify-center">
              <p>Loading agents...</p>
            </div>
          ) : (
            <DashboardAgentList items={agents} onClick={handleAgentClick} />
          )}
        </div>
        <Image src={line.src} alt="line" className="w-full" width={line.width} height={line.height} />
        <DashboardNotesBoard />
      </div>
      {selectedAgent && (
        <ChatPopup
          visible={isOpenModal}
          refetch={fetchAgents}
          inforAgent={selectedAgent}
          onClose={() => setIsOpenModal(false)}
        />
      )}
    </BoderImage>
  );
};

export default DashboardWidget;
