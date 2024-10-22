'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import CustomButton from '@/libs/svg-icons/input/custom-button';

import { useToast } from '@/hooks/use-toast';

import BoderImage from '@/components/common/border-image';
import MultiSelectTools from '@/components/common/multi-select';
import MultiSelectWidgets from '@/components/common/multi-select-widget';
import { Textarea } from '@/components/ui/textarea';

import AugmentedPopup from '@/modules/augmented/components/augmented-popup';
import FormTextField from '@/modules/form/components/form-text-field';

import WidgetFrame2 from '@/assets/svgs/widget-frame-2.svg';
import DashboardAvatar from '@/modules/dashboard/components/dashboard-avatar';

type ChatTemplate = {
  title: string;
  description: string;
  content: string;
};

const AgentRoot: FC<any> = ({ className, accountAddress }) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [isOpenCreateAgent, setIsOpenCreateAgent] = useState<boolean>(false);
  const { toast } = useToast();
  const [isLoadingWidget] = useState(false);
  const [widgetPrompt, setWidgetPrompt] = useState('');
  const [avatar, setAvatar] = useState<string>('');

  const [tools, setTools] = useState<any[]>([]);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { account } = useWallet();
  const agentForm = useForm({
    defaultValues: {
      avatar: '',
      name: '',
      description: '',
      introMessage: '',
      tools: [],
      widget: [],
      prompt: '',
      messenge_template: [] as ChatTemplate[]
    }
  });

  const chatTemplateForm = useForm({
    defaultValues: {
      templates: [{ title: '', description: '', content: '' }] // Initialize with one template
    }
  });

  const fetchTools = useCallback(async () => {
    try {
      const userId: any = accountAddress;
      const response = await axios.get(`/api/tools?userId=${userId}`);
      const contractTools = response.data.filter((tool: any) => tool.type === 'contractTool');

      setTools(contractTools);
      //console.log('contractTools', contractTools);
    } catch (error) {
      console.error('Error fetching tools:', error);
    }
  }, [account]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const fetchWidgetTools = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = accountAddress;
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
  }, []);

  useEffect(() => {
    fetchWidgetTools();
  }, [fetchWidgetTools]);

  const createAgentAPI = async (agentData: {
    name: string;
    description: string;
    introMessage: string;
    tools: string[];
    widget: string[];
    prompt: string;
    messenge_template: any[]; // Change this to any[]
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
    avatar: string;
    name: string;
    description: string;
    introMessage: string;
    tools: string[];
    widget: string[];
    prompt: string;
    messenge_template: any[];
  }) => {
    try {
      const userId = accountAddress;
      const agentData = {
        avatar: avatar || '/logo_aptos.png',
        name: data.name,
        description: data.description,
        introMessage: data.introMessage,
        tool_ids: data.tools,
        widget_ids: data.widget,
        prompt: data.prompt,
        messenge_template: chatTemplateForm.getValues('templates'),
        user_id: userId
      };
      //@ts-ignore
      const createdAgent = await createAgentAPI(agentData);

      setAgents([...agents, createdAgent]);
      setIsOpenCreateAgent(false);
      agentForm.reset();
      chatTemplateForm.reset();
      setChatTemplates([]);
      fetchAgents();
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
    agentForm.reset(); // Reset agent form
    chatTemplateForm.reset(); // Reset chat template form
    setWidgetPrompt('');
    setChatTemplates([]); // Clear chat templates state
    setAvatar('');
  }, [agentForm, chatTemplateForm]);

  const isValid = useCallback(() => {
    const { name, description, introMessage } = agentForm.getValues();

    return name.trim() !== '' && description.trim() !== '' && introMessage.trim() !== '';
  }, [agentForm]);

  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  const fetchAgents = useCallback(async () => {
    setIsLoadingAgents(true);
    try {
      const userId = accountAddress;

      if (userId) {
        const response = await axios.get(`/api/agent?userId=${userId}`);

        setAgents(response.data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setIsLoadingAgents(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  //console.log('chatTemplates', chatTemplates);

  const [chatTemplates, setChatTemplates] = useState<ChatTemplate[]>([]); // State to manage chat templates

  // Function to add a new chat template
  const handleAddChatTemplate = () => {
    if (chatTemplates.length < 4) {
      // Check if the current count is less than 4
      const newTemplate = { title: '', description: '', content: '' };

      setChatTemplates([...chatTemplates, newTemplate]);
    } else {
      toast({
        title: 'Limit reached',
        description: 'You can only add up to 4 chat templates.',
        variant: 'destructive'
      });
    }
  };

  // Function to remove a chat template
  const handleRemoveChatTemplate = (index: number) => {
    const updatedTemplates = chatTemplates.filter((_, i) => i !== index);

    setChatTemplates(updatedTemplates);
    chatTemplateForm.setValue('templates', updatedTemplates);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  //console.log('chatTemplates', chatTemplateForm.getValues());

  return (
    <div className={classNames('scrollbar flex w-full grow overflow-hidden py-4', className)}>
      <div className="container flex flex-col items-center gap-6">
        <h1 className="mt-5 text-h5 font-bold">Agents</h1>
        <div className="flex w-full justify-end">
          <CustomButton className="text-sm font-semibold" onClick={() => setIsOpenCreateAgent(true)}>
            Create Agent
          </CustomButton>
        </div>
        {isLoadingAgents ? (
          <div className="text-center">Loading agents...</div>
        ) : agents.length > 0 ? (
          <div className="grid w-full grid-cols-3 gap-4 ">
            {agents.map((agent: any) => (
              <Link key={agent._id} href={`/chat?agentId=${agent._id.toString()}`}>
                <BoderImage
                  imageBoder={WidgetFrame2.src} // Use your desired border image URL
                  className="flex flex-col items-start justify-between gap-2 rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h2 className="text-lg font-semibold">{agent.name}</h2>
                  <p className="text-sm text-white">{agent.description}</p>
                </BoderImage>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center">No agents found. Create your first agent!</div>
        )}
        <AugmentedPopup visible={isOpenCreateAgent} textHeading={'Create Agent'} onClose={handleCloseCreateAgent}>
          <form className="flex max-h-[80vh] flex-col gap-2 overflow-y-auto p-8">
            <div className="mb-4 flex flex-col gap-3">
              <label className="text-xs text-white lg:text-[18px]">Upload Avatar</label>
              <div onClick={() => document.getElementById('avatar-input')?.click()}>
                <DashboardAvatar imageUrl={avatar || '/logo_aptos.png'} />
              </div>
              <input
                type="file"
                id="avatar-input"
                name="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }} // Hide the file input
              />
            </div>
            <FormTextField form={agentForm} name="name" label="Name" />
            <FormTextField form={agentForm} name="description" label="Description" />
            <FormTextField form={agentForm} name="introMessage" label="Intro Message" />
            <div className="mb-4 flex flex-col gap-3">
              <label htmlFor="tools" className="text-xs text-white lg:text-[18px]">
                Select tools
              </label>
              <MultiSelectTools
                tools={tools || []}
                selectedTools={agentForm.watch('tools') || []}
                isLoading={isLoading}
                onChangeSelectedTools={(selectedTools: any) => {
                  console.log(selectedTools);
                  agentForm.setValue('tools', selectedTools);
                }}
              />
            </div>
            <div className="mb-4 flex flex-col gap-3">
              <label htmlFor="widget" className="text-xs text-white lg:text-[18px]">
                Select widget
              </label>
              <MultiSelectWidgets
                widgets={widgets || []}
                selectedWidgets={agentForm.watch('widget') || []}
                isLoading={isLoadingWidget}
                onChangeSelectedWidgets={(selectedWidgets: any) => {
                  agentForm.setValue('widget', selectedWidgets);
                }}
              />
            </div>
            <div className="mb-4 flex flex-col gap-3">
              <label htmlFor="prompt" className="text-xs text-white lg:text-[18px]">
                Prompt
              </label>
              <Textarea
                value={agentForm.watch('prompt')}
                placeholder={'Enter prompt'}
                rows={4}
                className="min-h-[120px]"
                onChange={e => agentForm.setValue('prompt', e.target.value)}
              />
            </div>
            <div className="mb-5 flex flex-col">
              <div className="flex flex-row items-center justify-between">
                <p className="text-lg font-semibold">Chat Templates</p>
                <CustomButton onClick={handleAddChatTemplate}>
                  <span className="text-sm font-semibold">Add</span>
                </CustomButton>
              </div>
              {chatTemplates.map((template: ChatTemplate, index: number) => (
                <form key={index} className="mt-5 flex flex-col gap-3 text-sm">
                  <FormTextField
                    form={chatTemplateForm}
                    name={`templates.${index}.title`} // Updated to use dynamic field names
                    label="Title chat template"
                    value={chatTemplateForm.getValues(`templates.${index}.title`)} // Get value from form state
                    //@ts-ignore
                    onChange={e => chatTemplateForm.setValue(`templates.${index}.title`, e.target.value)} // Update value on change
                  />
                  <FormTextField
                    form={chatTemplateForm}
                    name={`templates.${index}.description`} // Updated to use dynamic field names
                    label="Description chat template"
                    value={chatTemplateForm.getValues(`templates.${index}.description`)} // Get value from form state
                    //@ts-ignore
                    onChange={e => chatTemplateForm.setValue(`templates.${index}.description`, e.target.value)} // Update value on change
                  />
                  <FormTextField
                    form={chatTemplateForm}
                    name={`templates.${index}.content`} // Updated to use dynamic field names
                    label="Content chat template"
                    value={chatTemplateForm.getValues(`templates.${index}.content`)} // Get value from form state
                    //@ts-ignore
                    onChange={e => chatTemplateForm.setValue(`templates.${index}.content`, e.target.value)} // Update value on change
                  />
                  <CustomButton className="text-red-500" onClick={() => handleRemoveChatTemplate(index)}>
                    Remove
                  </CustomButton>
                </form>
              ))}
            </div>
            <CustomButton disabled={!isValid()} onClick={agentForm.handleSubmit(handleCreateAgent)}>
              <span className="text-sm font-semibold">Create Agent</span>
            </CustomButton>
          </form>
        </AugmentedPopup>
      </div>
    </div>
  );
};

export default AgentRoot;
