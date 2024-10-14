import { FC, useState } from 'react';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';
import { Button } from '@/components/ui/button';
import AugmentedPopup from '@/modules/augmented/components/augmented-popup';
import FormTextField from '@/modules/form/components/form-text-field';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Agent = {
  id: string;
  name: string;
  description: string;
};

const mockAgents: Agent[] = [
  { id: '1', name: 'Agent Smith', description: 'A versatile agent for general tasks' },
  { id: '2', name: 'Data Analyzer', description: 'Specializes in data analysis and visualization' },
  { id: '3', name: 'Customer Support Bot', description: 'Handles customer inquiries and support tickets' }
];

const AgentRoot: FC<ComponentBaseProps> = ({ className }) => {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [isOpenCreateAgent, setIsOpenCreateAgent] = useState<boolean>(false);
  const { toast } = useToast();

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

  // Mock data for tools and widgets (replace with actual data)
  const toolOptions = [
    { value: 'tool1', label: 'Tool 1' },
    { value: 'tool2', label: 'Tool 2' },
    { value: 'tool3', label: 'Tool 3' }
  ];

  const widgetOptions = [
    { value: 'widget1', label: 'Widget 1' },
    { value: 'widget2', label: 'Widget 2' },
    { value: 'widget3', label: 'Widget 3' }
  ];

  const handleCreateAgent = (data: {
    name: string;
    description: string;
    introMessage: string;
    tools: string[];
    widget: string;
    prompt: string;
  }) => {
    const newAgent: Agent = {
      id: (agents.length + 1).toString(),
      name: data.name,
      description: data.description
    };
    setAgents([...agents, newAgent]);
    setIsOpenCreateAgent(false);
    agentForm.reset();
    toast({
      title: 'Agent created successfully!',
      description: 'Your agent has been created and saved.'
    });
  };

  return (
    <div className={classNames('flex w-full grow py-4', className)}>
      <div className="container flex flex-col items-center gap-6">
        <h1 className="mt-5 text-h5 font-bold">Agents</h1>
        <div className="flex w-full justify-end">
          <Button onClick={() => setIsOpenCreateAgent(true)}>Create Agent</Button>
        </div>
        <div className="grid w-full grid-cols-3 gap-4">
          {agents.map((agent: Agent) => (
            <div
              key={agent.id}
              className="flex flex-col items-start justify-between gap-2 rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <h2 className="text-lg font-semibold">{agent.name}</h2>
              <p className="text-sm text-white">{agent.description}</p>
            </div>
          ))}
        </div>
        <AugmentedPopup
          visible={isOpenCreateAgent}
          onClose={() => setIsOpenCreateAgent(false)}
          textHeading={'Create Agent'}
        >
          <form
            onSubmit={agentForm.handleSubmit(handleCreateAgent)}
            className="flex max-h-[80vh] flex-col gap-2 overflow-y-auto p-8"
          >
            <FormTextField form={agentForm} name="name" label="Name" />
            <FormTextField form={agentForm} name="description" label="Description" />
            <FormTextField form={agentForm} name="introMessage" label="Intro Message" />
            <div className="mb-4 flex flex-col gap-3">
              <label htmlFor="tools" className="text-xs text-white lg:text-[18px]">
                Select tools
              </label>
              <Select onValueChange={value => agentForm.setValue('tools', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select tools" />
                </SelectTrigger>
                <SelectContent>
                  {toolOptions.map(tool => (
                    <SelectItem key={tool.value} value={tool.value}>
                      {tool.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4 flex flex-col gap-3">
              <label htmlFor="widget" className="text-xs text-white lg:text-[18px]">
                Select widget
              </label>
              <Select onValueChange={value => agentForm.setValue('widget', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select widget" />
                </SelectTrigger>
                <SelectContent>
                  {widgetOptions.map(widget => (
                    <SelectItem key={widget.value} value={widget.value}>
                      {widget.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                Prompt
              </label>
              <Textarea {...agentForm.register('prompt')} placeholder="Enter prompt" className="mt-1" />
            </div>
            <Button type="submit">Create Agent</Button>
          </form>
        </AugmentedPopup>
      </div>
    </div>
  );
};

export default AgentRoot;
