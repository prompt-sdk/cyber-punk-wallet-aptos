import { FC, useState, useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';
import { Button } from '@/components/ui/button';
import AugmentedPopup from '@/modules/augmented/components/augmented-popup';
import FormTextField from '@/modules/form/components/form-text-field';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from 'next-auth/react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import axios from 'axios';

const AgentRoot: FC<ComponentBaseProps> = ({ className }) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [isOpenCreateAgent, setIsOpenCreateAgent] = useState<boolean>(false);
  const { toast } = useToast();
  const [isLoadingWidget, setIsLoadingWidget] = useState(false);
  const [widgetPrompt, setWidgetPrompt] = useState('');

  const [tools, setTools] = useState<any[]>([]);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session } = useSession();
  const { account } = useWallet();
  const agentForm = useForm({
    defaultValues: {
      name: '',
      description: '',
      introMessage: '',
      tools: [],
      widget: '',
      prompt: ''
    }
  });

  const fetchTools = useCallback(async () => {
    try {
      const userId = session?.user?.username || account?.address.toString();
      const response = await axios.get(`/api/tools?userId=${userId}`);
      const contractTools = response.data.filter((tool: any) => tool.type === 'contractTool');
      setTools(contractTools);
      //console.log('contractTools', contractTools);
    } catch (error) {
      console.error('Error fetching tools:', error);
    }
  }, [account, session]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const fetchWidgetTools = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = session?.user?.username || account?.address.toString();
      const response = await fetch(`/api/tools?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }
      const data = await response.json();
      const filteredTools = data.filter((tool: any) => tool.type === 'widgetTool');
      setWidgets(filteredTools);
    } catch (error) {
      console.error('Error fetching widget tools:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.username, account?.address.toString()]);

  useEffect(() => {
    fetchWidgetTools();
  }, [fetchWidgetTools]);

  const createAgentAPI = async (agentData: {
    name: string;
    description: string;
    introMessage: string;
    tools: string[];
    widget: string;
    prompt: string;
  }) => {
    try {
      const response = await axios.post('/api/agent', agentData);
      return response.data;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  };

  const handleCreateAgent = async (data: {
    name: string;
    description: string;
    introMessage: string;
    tools: string[];
    widget: string;
    prompt: string;
  }) => {
    try {
      const userId = session?.user?.username || account?.address.toString();
      const agentData = {
        ...data,
        user_id: userId
      };
      const createdAgent = await createAgentAPI(agentData);
      setAgents([...agents, createdAgent]);
      setIsOpenCreateAgent(false);
      agentForm.reset();
      toast({
        title: 'Agent created successfully!',
        description: 'Your agent has been created and saved.'
      });
    } catch (error) {
      toast({
        title: 'Error creating agent',
        description: 'There was a problem creating the agent. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleCloseCreateAgent = useCallback(() => {
    setIsOpenCreateAgent(false);
    agentForm.reset();
    setWidgetPrompt('');
  }, [agentForm]);

  const isValid = useCallback(() => {
    const { name, description, introMessage, tools, widget, prompt } = agentForm.getValues();
    return (
      name.trim() !== '' &&
      description.trim() !== '' &&
      introMessage.trim() !== '' &&
      tools.length > 0 &&
      widget !== '' &&
      prompt.trim() !== ''
    );
  }, [agentForm]);

  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  const fetchAgents = useCallback(async () => {
    setIsLoadingAgents(true);
    try {
      const userId = session?.user?.username || account?.address.toString();
      const response = await axios.get(`/api/agent?userId=${userId}`);
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setIsLoadingAgents(false);
    }
  }, [session?.user?.username, account?.address, toast]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return (
    <div className={classNames('flex w-full grow py-4', className)}>
      <div className="container flex flex-col items-center gap-6">
        <h1 className="mt-5 text-h5 font-bold">Agents</h1>
        <div className="flex w-full justify-end">
          <Button onClick={() => setIsOpenCreateAgent(true)}>Create Agent</Button>
        </div>
        {isLoadingAgents ? (
          <div className="text-center">Loading agents...</div>
        ) : agents.length > 0 ? (
          <div className="grid w-full grid-cols-3 gap-4">
            {agents.map((agent: any) => (
              <div
                key={agent.id}
                className="flex flex-col items-start justify-between gap-2 rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <h2 className="text-lg font-semibold">{agent.name}</h2>
                <p className="text-sm text-white">{agent.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">No agents found. Create your first agent!</div>
        )}
        <AugmentedPopup visible={isOpenCreateAgent} onClose={handleCloseCreateAgent} textHeading={'Create Agent'}>
          <form className="flex max-h-[80vh] flex-col gap-2 overflow-y-auto p-8">
            <FormTextField form={agentForm} name="name" label="Name" />
            <FormTextField form={agentForm} name="description" label="Description" />
            <FormTextField form={agentForm} name="introMessage" label="Intro Message" />
            <div className="mb-4 flex flex-col gap-3">
              <label htmlFor="tools" className="text-xs text-white lg:text-[18px]">
                Select tools
              </label>
              <select
                className="max-h-40 w-full overflow-y-auto rounded border border-gray-700 bg-transparent p-2 text-white"
                value={agentForm.watch('tools')}
                onChange={e => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  agentForm.setValue('tools', selectedOptions);
                }}
              >
                {isLoading ? (
                  <option value="" disabled className="text-[#6B7280]">
                    Loading tools...
                  </option>
                ) : tools.length > 0 ? (
                  <>
                    <option value="" disabled className="text-[#6B7280]">
                      Choose tools
                    </option>
                    {tools.map((tool, idx) => (
                      <option key={idx} value={tool._id} className="text-[#6B7280]">
                        {tool.name}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value="" disabled className="text-[#6B7280]">
                    No tools available
                  </option>
                )}
              </select>
            </div>
            <div className="mb-4 flex flex-col gap-3">
              <label htmlFor="widget" className="text-xs text-white lg:text-[18px]">
                Select widget
              </label>
              <select
                className="w-full rounded border border-gray-700 bg-transparent p-2 text-white"
                value={agentForm.watch('widget')}
                onChange={e => {
                  const widgetId = e.target.value;
                  agentForm.setValue('widget', widgetId);
                }}
                disabled={isLoadingWidget}
              >
                <option value="" disabled className="text-[#6B7280]">
                  {isLoadingWidget ? 'Loading widget...' : 'Choose a widget'}
                </option>
                {widgets.map((widget, idx) => (
                  <option key={idx} value={widget._id} className="text-[#6B7280]">
                    {widget.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex flex-col gap-3">
              <label htmlFor="prompt" className="text-xs text-white lg:text-[18px]">
                Prompt
              </label>
              <Textarea
                value={agentForm.watch('prompt')}
                onChange={e => agentForm.setValue('prompt', e.target.value)}
                placeholder={'Enter prompt'}
                rows={4}
                className="min-h-[120px]"
              />
            </div>
            <Button onClick={agentForm.handleSubmit(handleCreateAgent)} type="submit" disabled={!isValid()}>
              Create Agent
            </Button>
          </form>
        </AugmentedPopup>
      </div>
    </div>
  );
};

export default AgentRoot;
