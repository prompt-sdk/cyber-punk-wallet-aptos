"use client"
import { FC, useCallback, useEffect, useState } from 'react';

import BorderImage from '@/components/common/border-image';
import { Button } from '@/components/ui/button';

import AugmentedPopup from '@/components/augmented/components/augmented-popup';
import { ViewFrameDashboard } from '@/components/custom/view-frame';
import { useWidgetModal } from '@/components/utils/use-widget-modal';

import WidgetFrame2 from '@/public/assets/svgs/widget-frame-2.svg';

import { User } from '@/db/schema';
interface WidgetOption {
  id: string;
  type: string;
  name: string;
  tool: any;
  icon: string;
  description: string;
  code: string;
}

type WidgetSelectionModalProps = {
  user: User | null;
  className?: string
};

export const WidgetSelectionModal: FC<WidgetSelectionModalProps> = ({ className, user }) => {
  const { isOpen, closeWidgetModal, addWidget } = useWidgetModal();
  const [widgetOptions, setWidgetOptions] = useState<WidgetOption[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWidgetTools = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tools?userId=${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }
      const data = await response.json();
      //console.log('data', data);
      const filteredTools = data.filter((tool: any) => tool.typeName === 'widgetTool');
      //console.log('filteredTools', filteredTools);
      setWidgetOptions(filteredTools);
    } catch (error) {
      console.error('Error fetching widget tools:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWidgetTools();
  }, [fetchWidgetTools]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedWidget(null);
    }
  }, [isOpen]);

  const handleSelectWidget = (id: string) => {
    setSelectedWidget(id);
  };

  const handleAddWidget = () => {
    if (selectedWidget) {
      const widgetToAdd = widgetOptions.find(widget => widget.id === selectedWidget);

      if (widgetToAdd) {
        const sizes = ['small', 'medium', 'large'];
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        const widgetWithSize = { 
          ...widgetToAdd, 
          size: 'fit', 
          index: widgetOptions?.length,
        };

        //@ts-ignore
        addWidget(widgetWithSize);
        closeWidgetModal();
      }
    }
  };

  return (
    <AugmentedPopup className="max-w-3xl" visible={isOpen} textHeading="Select Widget" onClose={closeWidgetModal}>
      <div className="flex max-h-[80vh] flex-col gap-5 overflow-y-auto p-8">
        <div className="w-full">
          {/* Replaced select with a list of clickable items */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {isLoading ? (
              <p>Loading widgets...</p>
            ) : (
              widgetOptions.map(option => (
                <BorderImage
                  key={option.id}
                  imageBoder={WidgetFrame2.src} // Use your desired border image URL
                  className="w-full cursor-pointer rounded-md shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    className="flex flex-col items-start justify-start gap-3"
                    onClick={() => {
                      handleSelectWidget(option.id); // Select the widget
                      handleAddWidget(); // Add the widget immediately
                    }}
                  >
                    <div className="flex w-full flex-col gap-1 border-b-[0.5px] border-gray-700">
                      <div className="flex flex-col gap-1 p-2 pb-4">
                        <span className="font-semibold">{option.name}</span>
                        <span className="text-sm text-gray-300">{option?.description.slice(0, 20) + '...'}</span>
                      </div>
                    </div>
                    <div className="mt-4"></div>
                    <ViewFrameDashboard id={option.id} code={option?.code} />
                  </div>
                </BorderImage>
              ))
            )}
          </div>
        </div>
        {/* <div className="mt-4 flex justify-end">
          <Button onClick={handleAddWidget} disabled={!selectedWidget || isLoading}>
            {isLoading ? 'Loading...' : 'Add Widget'}
          </Button>
        </div> */}
      </div>
    </AugmentedPopup>
  );
};
