import { FC, useCallback, useEffect, useState } from 'react';
import { ComponentBaseProps } from '@/common/interfaces';

import BorderImage from '@/components/common/border-image';
import { Button } from '@/components/ui/button';

import AugmentedPopup from '@/modules/augmented/components/augmented-popup';
import { ViewFrameDashboard } from '@/modules/chat/validation/ViewFarm';
import { useWidgetModal } from '@/modules/dashboard/hooks/useWidgetModal';

import WidgetFrame2 from '@/assets/svgs/widget-frame-2.svg';

interface WidgetOption {
  _id: string;
  type: string;
  name: string;
  tool: any;
  icon: string;
}

export const WidgetSelectionModal: FC<any> = ({ className, session }) => {
  const { isOpen, closeWidgetModal, addWidget } = useWidgetModal();
  const [widgetOptions, setWidgetOptions] = useState<WidgetOption[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const userId = session.user.username;
  const [isLoading, setIsLoading] = useState(false);

  const fetchWidgetTools = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tools?userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }
      const data = await response.json();
      const filteredTools = data.filter((tool: any) => tool.type === 'widgetTool');

      setWidgetOptions(filteredTools);
    } catch (error) {
      console.error('Error fetching widget tools:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

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
      const widgetToAdd = widgetOptions.find(widget => widget._id === selectedWidget);

      if (widgetToAdd) {
        const sizes = ['small', 'medium', 'large'];
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        const widgetWithSize = { ...widgetToAdd, size: 'fit', index: widgetOptions?.length };
        //@ts-ignore
        addWidget(widgetWithSize);
        closeWidgetModal();
      }
    }
  };

  console.log('widgetOptions', widgetOptions);

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
                  key={option._id}
                  imageBoder={WidgetFrame2.src} // Use your desired border image URL
                  className="w-full cursor-pointer rounded-md shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    className="flex flex-col items-start justify-start gap-3"
                    onClick={() => {
                      handleSelectWidget(option._id); // Select the widget
                      handleAddWidget(); // Add the widget immediately
                    }}
                  >
                    <div className="flex w-full flex-col gap-1 border-b-[0.5px] border-gray-700">
                      <div className="flex flex-col gap-1 p-2 pb-4">
                        <span className="font-semibold">{option.name}</span>
                        <span className="text-sm text-gray-300">{option.tool.description.slice(0, 20) + '...'}</span>
                      </div>
                    </div>
                    <div className="mt-4"></div>
                    <ViewFrameDashboard id={option._id.toString()} code={option.tool?.code} />
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
