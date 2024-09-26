'use client';

import { FC, useState } from 'react';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { ComponentBaseProps } from '@/common/interfaces';

import DashboardWidgetToolToggleButton from './dashboard-widget-tool-toggle-button';

type DashboardWidgetToolsProps = ComponentBaseProps;

const DashboardWidgetTools: FC<DashboardWidgetToolsProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleToggle = (isActive: boolean) => {
    setIsVisible(isActive);
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
          <button>
            <i className="ico-image text-xl" />
          </button>
          <button>
            <i className="ico-layout-web-12 text-xl" />
          </button>
          <button>
            <i className="ico-file-text-edit text-xl" />
          </button>
          <button>
            <i className="ico-ai text-xl" />
          </button>
        </motion.div>
      </div>
      <DashboardWidgetToolToggleButton className="shrink-0" onToggle={handleToggle} />
    </div>
  );
};

export default DashboardWidgetTools;
