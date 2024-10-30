'use client';

import { FC, useRef, useState } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { motion } from 'framer-motion';

import { useWidgetModal,WIDGET_SIZE, WIDGET_TYPES } from '@/components/utils/use-widget-modal';

import DashboardWidgetToolToggleButton from './dashboard-widget-tool-toggle-button';

// Import the icons you need
import { Image, LayoutGrid, FileEdit, Bot } from 'lucide-react';

interface DashboardWidgetToolsProps {
  widgetItem?: any;
  onCkick?: () => void;
  className?: string
};

const DashboardWidgetTools: FC<DashboardWidgetToolsProps> = ({ className, widgetItem, onCkick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { openWidgetModal, addImageWidget, addWidget } = useWidgetModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = (isActive: boolean) => {
    setIsVisible(isActive);
  };

  const handleOpenWidgetModal = () => {
    console.log('Attempting to open widget modal');
    openWidgetModal();
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input triggered');
    const file = event.target.files?.[0];

    if (file) {
      try {
        const base64Image = await convertToBase64(file);

        console.log('Image converted to base64');
        addImageWidget(base64Image);
      } catch (error) {
        console.error('Error converting image:', error);
        // Handle error (e.g., show an error message to the user)
      }
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddInputWidget = () => {
    const newWidget = {
      id: Date.now().toString(),
      type: WIDGET_TYPES.INPUT,
      name: 'Input Widget',
      icon: 'ico-file-text-edit',
      code: 'default',
      size: WIDGET_SIZE.SMALL
    };

    addWidget(newWidget);
  };

  return (
    <div className={classNames('flex justify-end gap-4', className)}>
      <div className="h-10 grow overflow-hidden">
        <motion.div
          className="flex h-full items-center justify-center gap-8 rounded-sm border-2 border-[#5F5C64]"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 40 }}
          transition={{ duration: 0.3 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleUploadImage}
          />
          <button type="button" onClick={handleImageButtonClick} className="p-2 hover:text-gray-300">
            <Image className="w-5 h-5" />
          </button>
          <button onClick={handleOpenWidgetModal} className="p-2 hover:text-gray-300">
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button onClick={handleAddInputWidget} className="p-2 hover:text-gray-300">
            <FileEdit className="w-5 h-5" />
          </button>
          <Link href="/chat" className="p-2 hover:text-gray-300">
            <Bot className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
      <DashboardWidgetToolToggleButton className="shrink-0" onToggle={handleToggle} />
    </div>
  );
};

export default DashboardWidgetTools;
