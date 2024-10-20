'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { Session } from 'next-auth/types';
import axios from 'axios';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { ComponentBaseProps } from '@/common/interfaces';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import CustomButton from '@/libs/svg-icons/input/custom-button';

import { Widget } from '../interfaces/widget.interface';

import { useToast } from '@/hooks/use-toast';

import BoderImage from '@/components/common/border-image';
import MultiSelectTools from '@/components/common/multi-select';
import { Textarea } from '@/components/ui/textarea';

import AugmentedPopup from '@/modules/augmented/components/augmented-popup';
import { ViewFrame } from '@/modules/chat/validation/ViewFarm';
import FormTextField from '@/modules/form/components/form-text-field';

import WidgetFrame2 from '@/assets/svgs/widget-frame-2.svg';

type WidgetRootProps = ComponentBaseProps & {
  session: Session | null;
};

const WidgetRoot: FC<WidgetRootProps> = ({ className, session }) => {
  const { account } = useWallet();
  const { toast } = useToast();
  const [isOpenCreateWidget, setIsOpenCreateWidget] = useState<boolean>(false);
  const [widgetPrompt, setWidgetPrompt] = useState<string>('');
  const [widgetCode, setWidgetCode] = useState<string>('');
  const [selectedWidgetTools, setSelectedWidgetTools] = useState<string[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [previewWidgetCode, setPreviewWidgetCode] = useState<string>('');
  const [tools, setTools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const accountAddress = session?.user.username;

  const fetchTools = useCallback(async () => {
    try {
      const userId = accountAddress;
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

      //console.log('filteredTools', filteredTools);
      setWidgets(filteredTools);
    } catch (error) {
      console.error('Error fetching widget tools:', error);
    } finally {
      setIsLoading(false);
    }
  }, [account?.address.toString()]);

  useEffect(() => {
    fetchWidgetTools();
  }, [fetchWidgetTools]);

  const widgetForm = useForm({
    defaultValues: {
      name: '',
      description: ''
    }
  });

  const onchangeWidgetPrompt = (e: any) => {
    setWidgetPrompt(e.target.value);
  };

  const onchangeWidgetCode = (e: any) => {
    setWidgetCode(e.target.value);
  };

  // Add this new function to reset the form and related state
  const resetForm = useCallback(() => {
    widgetForm.reset();
    setWidgetPrompt('');
    setWidgetCode('');
    setSelectedWidgetTools([]);
    setPreviewWidgetCode('');
  }, [widgetForm]);

  const handleSaveWidget = async () => {
    try {
      const widgetData = {
        type: 'widgetTool',
        name: widgetForm.getValues('name'),
        tool: {
          name: widgetForm.getValues('name'),
          description: widgetForm.getValues('description'),
          prompt: widgetPrompt,
          code: widgetCode,
          tool_ids: selectedWidgetTools
        },
        user_id: accountAddress
      };

      console.log('widgetData', widgetData);
      const response = await axios.post('/api/tools', widgetData);

      console.log('Widget saved successfully:', response.data);

      // Use the new resetForm function
      resetForm();
      fetchWidgetTools();
      setIsOpenCreateWidget(false);

      // Show success message
      toast({
        title: 'Widget created successfully!',
        description: 'Your widget has been created and saved.'
      });
    } catch (error) {
      console.error('Error saving widget:', error);
      toast({
        title: 'Error creating widget',
        description: 'Please try again.'
      });
    }
  };

  const handlePreviewWidget = async () => {
    try {
      toast({
        title: 'Previewing widget...',
        description: 'Please wait while we generate the preview.'
      });
      const data = {
        prompt: widgetPrompt,
        tool_ids: selectedWidgetTools
      };

      const response = await axios.post('/api/create-widget', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const code = response.data.code;

      setPreviewWidgetCode(code);
      setWidgetCode(code);
      toast({
        title: 'Widget previewed successfully!',
        description: 'Your widget has been previewed successfully.'
      });
      console.log('Previewing widget', response.data);
    } catch (error) {
      console.error('Error previewing widget:', error);
      toast({
        title: 'Error previewing widget',
        description: 'Please try again.'
      });
    }
  };

  return (
    <div className={classNames('scrollbar flex w-full grow overflow-hidden py-4', className)}>
      <div className="container flex flex-col items-center gap-6">
        <h1 className="mt-5 text-h5 font-bold">Widgets</h1>
        <div className="flex w-full justify-end">
          <CustomButton className="w-full md:w-auto" onClick={() => setIsOpenCreateWidget(true)}>
            <span className="font-semibold">Create Widget</span>
          </CustomButton>
        </div>
        {isLoading ? (
          <div className="text-center">Loading widgets...</div>
        ) : widgets.length > 0 ? (
          <div className="grid w-full grid-cols-3 gap-4">
            {widgets.map(widget => (
              <BoderImage
                key={widget._id}
                imageBoder={WidgetFrame2.src} // Use your desired border image URL
                className="flex flex-col items-start justify-between gap-2 rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <h2 className="text-lg font-semibold">{widget.name}</h2>
                <span className="rounded text-xs text-gray-500">{widget?.tool?.type || 'Widget'}</span>
                <p className="text-sm text-white">{widget?.tool?.description?.slice(0, 70) + '...'}</p>
              </BoderImage>
            ))}
          </div>
        ) : (
          <div className="text-center">No widgets found. Create your first widget!</div>
        )}
        <AugmentedPopup
          visible={isOpenCreateWidget}
          textHeading={'Create Widget'}
          onClose={() => {
            setIsOpenCreateWidget(false);
            resetForm(); // Add this line to reset the form when closing the modal
          }}
        >
          <form className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto p-8">
            <FormTextField form={widgetForm} name="name" label="Name" />
            <FormTextField form={widgetForm} name="description" label="Description" />
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Select Tools</label>
              <MultiSelectTools
                tools={tools || []}
                selectedTools={selectedWidgetTools}
                onChangeSelectedTools={setSelectedWidgetTools}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Prompt</label>
              <Textarea value={widgetPrompt} className="min-h-[100px]" onChange={onchangeWidgetPrompt} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Code</label>
              <Textarea value={widgetCode} className="font-mono min-h-[150px]" onChange={onchangeWidgetCode} />
            </div>
            {previewWidgetCode && (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-white">Preview</label>
                <ViewFrame code={previewWidgetCode} />
              </div>
            )}
            <div className="flex justify-end gap-4">
              <CustomButton className="w-full md:w-auto" onClick={handlePreviewWidget}>
                <span className="text-sm font-semibold">Preview</span>
              </CustomButton>
              <CustomButton className="w-full md:w-auto" onClick={handleSaveWidget}>
                <span className="text-sm font-semibold">Save</span>
              </CustomButton>
            </div>
          </form>
        </AugmentedPopup>
      </div>
    </div>
  );
};

export default WidgetRoot;
