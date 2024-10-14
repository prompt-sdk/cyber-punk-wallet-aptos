import { FC, useState } from 'react';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';
import { Button } from '@/components/ui/button';
import AugmentedPopup from '@/modules/augmented/components/augmented-popup';
import FormTextField from '@/modules/form/components/form-text-field';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

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
      description: ''
    }
  });

  const handleCreateAgent = (data: { name: string; description: string }) => {
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
            className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto p-8"
          >
            <FormTextField form={agentForm} name="name" label="Name" />
            <FormTextField form={agentForm} name="description" label="Description" />
            <Button type="submit">Create Agent</Button>
          </form>
        </AugmentedPopup>
      </div>
    </div>
  );
};

export default AgentRoot;
