'use client';
import { useForm } from 'react-hook-form';
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ChatHeader } from '@/components/custom/chat-header';
import { Model } from '@/lib/model';
import CustomButton from '@/components/custom/custom-button';
import BoderImage from '@/components/common/border-image';
import WidgetFrame2 from '@/public/assets/svgs/widget-frame-2.svg';
import Link from 'next/link';
import AugmentedPopup from '@/components/augmented/components/augmented-popup';
import DashboardAvatar from '@/components/common/dashboard-avatar';
import FormTextField from '@/components/common/form-text-field';
import MultiSelectTools from '@/components/common/multi-select';

import axios from 'axios';
import { Textarea } from '@/components/ui/textarea';
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/utils';

type ChatTemplate = {
  title: string;
  description: string;
  content: string;
};

type WidgetParam = {
  name: string;
  description: string;
  type: string;
};

export function Agent({
  selectedModelName,
  session
}: {
  selectedModelName: Model['name'];
  session: any | null;
}) {

  //const [agents, setAgents] = useState<any[]>([]);
  const [isOpenCreateAgent, setIsOpenCreateAgent] = useState<boolean>(false);
  const [widgetPrompt, setWidgetPrompt] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [chatTemplates, setChatTemplates] = useState<ChatTemplate[]>([]);
  const [widgetParams, setWidgetParams] = useState<WidgetParam[]>([]);

  const agentForm = useForm({
    defaultValues: {
      avatar: '',
      name: '',
      description: '',
      introMessage: '',
      tools: [],
      widget: [],
      prompt: '',
      messenge_template: [] as ChatTemplate[],
    }
  });

  const chatTemplateForm = useForm({
    defaultValues: {
      templates: [{ title: '', description: '', content: '' }] // Initialize with one template
    }
  });

  const widgetParamsForm = useForm({
    defaultValues: {
      params: [{ name: '', description: '', type: '' }] // Initialize with one parameter
    }
  });

  const { data: toolsData, error, isLoading: isLoadingTools } = useSWR(
    session ? `/api/tools?userId=${session.user?.id}` : null,
    async (url) => {
      const response = await axios.get(url);
      return response.data.filter((tool: any) => tool.type !== 'apiTool');
    }, {
    fallbackData: []
  }
  );

  // console.log('toolsData', toolsData);

  // const { data: widgetToolsData, error: widgetToolsError,isLoading:isLoadingWidget } = useSWR(
  //   session ? `/api/tools?id=${session.user?.id}` : null,
  //   async (url) => {
  //     const response = await fetch(url);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch widget tools');
  //     }
  //     return response.json().then(data => data.filter((tool: any) => tool.type === 'widgetTool'));
  //   },{
  //     fallbackData:[]
  //   }
  // );

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
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      return response.json();
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
    messenge_template: ChatTemplate[];
  }) => {
    try {
      const userId = session?.user?.id;
      const agentData = {
        avatar: avatar || '/assets/images/avatar/logo_aptos.png',
        name: data.name,
        description: data.description,
        intro: data.introMessage,
        tool: data.tools ? data.tools : [],
        prompt: data.prompt,
        suggestedActions: chatTemplateForm.getValues('templates').some(template => template.title.length > 0)
          ? chatTemplateForm.getValues('templates')
          : [],
        userId: userId,
        createdAt: Date.now()
      };
      //@ts-ignore
      await createAgentAPI(agentData);

      // Refetch agents after creating a new agent
      mutate(session ? `/api/agents?userId=${userId}` : null); // Trigger a revalidation

      setIsOpenCreateAgent(false);
      agentForm.reset();
      chatTemplateForm.reset();
      setChatTemplates([]);
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

  //const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  const { data: agents, error: agentsError, isLoading: isLoadingAgents } = useSWR(
    session ? `/api/agents?userId=${session.user?.id}` : null, fetcher,
    {
      fallbackData: []
    }
  );

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

  const handleAddWidgetParam = () => {
    const newParam = { name: '', description: '', type: '' };
    setWidgetParams([...widgetParams, newParam]);
  };

  // Function to remove a chat template
  const handleRemoveChatTemplate = (index: number) => {
    const updatedTemplates = chatTemplates.filter((_, i) => i !== index);

    setChatTemplates(updatedTemplates);
    chatTemplateForm.setValue('templates', updatedTemplates);
  };

  const handleRemoveWidgetParam = (index: number) => {
    const updatedParams = widgetParams.filter((_, i) => i !== index);

    setWidgetParams(updatedParams);
    widgetParamsForm.setValue('params', updatedParams);
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


  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background ">
      <ChatHeader selectedModelName={selectedModelName} />
      <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll scrollbar">
        <div className="flex flex-col w-full h-full items-center max-w-screen-2xl mx-auto">
          <h1 className="md:text-4xl font-bold text-2xl">Agents</h1>
          <div className="flex flex-col w-full mt-12 items-end">
            <CustomButton onClick={() => setIsOpenCreateAgent(true)} className='text-xs font-bold'>Create Agent</CustomButton>
          </div>
          <div className="flex flex-col w-full mt-16 items-center">
            {isLoadingAgents ? (
              <div className="text-center">Loading agents...</div>
            ) : agents?.length > 0 ? (
              <div className="grid w-full grid-cols-3 gap-4 ">
                {agents.map((agent: any) => (
                  <Link key={agent.id} href={`/chat?startAgent=${agent.id}`}>
                    <BoderImage
                      imageBoder={WidgetFrame2.src}
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
          </div>
        </div>
        <AugmentedPopup visible={isOpenCreateAgent} textHeading={'Create Agent'} onClose={handleCloseCreateAgent}>
          <form className="flex max-h-[80vh] flex-col gap-2 overflow-y-auto p-8">
            <div className="mb-4 flex flex-col gap-3">
              <label className="text-xs text-white lg:text-[18px]">Upload Avatar</label>
              <div onClick={() => document.getElementById('avatar-input')?.click()}>
                <DashboardAvatar imageUrl={avatar || '/assets/images/avatar/logo_aptos.png'} />
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
                tools={toolsData || []}
                selectedTools={agentForm.watch('tools') || []}
                isLoading={isLoading}
                onChangeSelectedTools={(selectedTools: any) => {
                  console.log(selectedTools);
                  agentForm.setValue('tools', selectedTools);
                }}
              />
            </div>
            {/* <div className="mb-4 flex flex-col gap-3">
              <label htmlFor="widget" className="text-xs text-white lg:text-[18px]">
                Select widget
              </label>
              <MultiSelectWidgets
                widgets={widgetToolsData || []}
                selectedWidgets={agentForm.watch('widget') || []}
                isLoading={isLoadingWidget}
                onChangeSelectedWidgets={(selectedWidgets: any) => {
                  agentForm.setValue('widget', selectedWidgets);
                }}
              />
            </div> */}
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
            {/* <div className="mb-5 flex flex-col">
              <div className="flex flex-row items-center justify-between">
                <p className="text-lg font-semibold">Widget Parameters</p>
                <CustomButton onClick={handleAddWidgetParam}>
                  <span className="text-sm font-semibold">Add</span>
                </CustomButton>
              </div>
              {widgetParams.map((param: WidgetParam, index: number) => (
                <form key={index} className="mt-5 flex flex-col gap-3 text-sm">
                  <FormTextField
                    form={widgetParamsForm}
                    name={`params.${index}.name`} // Updated to use dynamic field names
                    label="Name"
                    value={widgetParamsForm.getValues(`params.${index}.name`)} // Get value from form state
                    //@ts-ignore
                    onChange={e => widgetParamsForm.setValue(`params.${index}.name`, e.target.value)} // Update value on change
                  />
                  <FormTextField
                    form={widgetParamsForm}
                    name={`params.${index}.description`} // Updated to use dynamic field names
                    label="Description"
                    value={widgetParamsForm.getValues(`params.${index}.description`)} // Get value from form state
                    //@ts-ignore
                    onChange={e => widgetParamsForm.setValue(`params.${index}.description`, e.target.value)} // Update value on change
                  />
                  <FormTextField
                    form={widgetParamsForm}
                    name={`params.${index}.type`} // Updated to use dynamic field names
                    label="Type"
                    value={widgetParamsForm.getValues(`params.${index}.type`)} // Get value from form state
                    //@ts-ignore
                    onChange={e => widgetParamsForm.setValue(`params.${index}.type`, e.target.value)} // Update value on change
                  />
                  <CustomButton className="text-red-500" onClick={() => handleRemoveWidgetParam(index)}>
                    Remove
                  </CustomButton>
                </form>
              ))}
            </div> */}
            <CustomButton disabled={!isValid()} onClick={agentForm.handleSubmit(handleCreateAgent)}>
              <span className="text-sm font-semibold">Create Agent</span>
            </CustomButton>
          </form>
        </AugmentedPopup>
      </div>
    </div>
  );
}
