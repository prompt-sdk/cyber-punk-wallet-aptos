import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

import CustomButton from '@/components/custom/custom-button';

interface Widget {
  _id: string;
  name: string;
  tool: {
    name: string;
    description: string;
    prompt: string;
    code: string;
    tool_ids: string;
  };
  user_id: string;
  type: string;
}

interface MultiSelectWidgetsProps {
  widgets: Widget[];
  selectedWidgets: string[];
  onChangeSelectedWidgets: (selectedWidgets: string[]) => void;
  isLoading: boolean;
}

const MultiSelectWidgets: React.FC<MultiSelectWidgetsProps> = ({
  widgets,
  selectedWidgets,
  onChangeSelectedWidgets,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleWidget = (widgetId: string) => {
    const updatedSelection = selectedWidgets.includes(widgetId)
      ? selectedWidgets.filter(id => id !== widgetId)
      : [...selectedWidgets, widgetId];
    onChangeSelectedWidgets(updatedSelection);
  };

  const getWidgetNameById = (widgetId: string) => {
    const widget = widgets.find(w => w._id === widgetId);
    return widget ? widget.name : '';
  };

  return (
    <div className="relative">
      <CustomButton
        className="font-sm flex min-h-[40px] cursor-pointer items-center justify-between rounded-md p-2 text-sm font-semibold text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedWidgets.length > 0 ? (
            selectedWidgets.map(widgetId => (
              <span key={widgetId} className="rounded bg-gray-600 px-2 py-1 text-sm">
                {getWidgetNameById(widgetId)}
              </span>
            ))
          ) : (
            <span className="text-white">Select tools...</span>
          )}
        </div>
        <motion.svg
          className={`size-5  transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </CustomButton>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border-[#5F5C64] bg-[#2C3035] shadow-lg"
            initial={{ opacity: 0, scale: 0.4, scaleY: 0.4 }}
            animate={{ opacity: 1, scale: 1, scaleY: 1 }}
            exit={{ opacity: 0, scale: 0.4, scaleY: 0.4 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: 'top' }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <span className="text-gray-400">Loading widgets...</span>
              </div>
            ) : (
              widgets.map(widget => (
                <div
                  key={widget._id}
                  className={`cursor-pointer p-2 hover:bg-[#383C41] ${selectedWidgets.includes(widget._id) ? 'bg-[#383C41]' : ''
                    }`}
                  onClick={() => toggleWidget(widget._id)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-white">{widget.name}</span>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiSelectWidgets;
