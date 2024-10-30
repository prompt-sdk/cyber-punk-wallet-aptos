import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

import { Tool } from '@/components/common/interface/tool.interface';
import CustomButton from '@/components/custom/custom-button';


interface IMultiSelectToolsProps {
  tools: Tool[];
  selectedTools: string[];
  onChangeSelectedTools: (selectedTools: string[]) => void;
  isLoading?: boolean;
}

const MultiSelectTools: React.FC<IMultiSelectToolsProps> = ({
  tools,
  selectedTools,
  onChangeSelectedTools,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleTool = (toolId: string) => {
    const updatedSelection = selectedTools.includes(toolId)
      ? selectedTools.filter(id => id !== toolId)
      : [...selectedTools, toolId];

    onChangeSelectedTools(updatedSelection);
  };

  const getToolNameById = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);

    return tool ? tool.name : null;
  };

  return (
    <div className="relative">
      <CustomButton
        className="flex min-h-[52px] cursor-pointer items-center justify-between rounded-md p-2 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedTools.length > 0 ? (
            selectedTools.map(toolId => (
              <span key={toolId} className="rounded bg-[#383C41] px-2 py-1 text-sm">
                {getToolNameById(toolId)}
              </span>
            ))
          ) : (
            <span className="text-sm font-semibold text-white">Select tools...</span>
          )}
        </div>
        <motion.svg
          className={`size-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
                <span className="text-gray-400">Loading tools...</span>
              </div>
            ) : (
              tools.map(tool => (
                <div
                  key={tool.id}
                  className={`cursor-pointer p-2 py-3 hover:bg-[#383C41] ${selectedTools.includes(tool.id) ? 'bg-[#383C41]' : ''
                    }`}
                  onClick={() => toggleTool(tool.id)}
                >
                  <div className="flex flex-col">
                    <span className="text-white">{tool.name}</span>
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

export default MultiSelectTools;
