import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ComponentBaseProps } from '@/common/interfaces';
import CustomButton from '@/libs/svg-icons/input/custom-button';

import AugmentedPopup from '@/modules/augmented/components/augmented-popup';
import { ViewFrameDashboard } from '@/modules/chat/validation/ViewFarm';
import { useWidgetModal } from '@/modules/dashboard/hooks/useWidgetModal';
import { DUMMY_WIDGET_LIST, WIDGET_SIZE } from '@/modules/widget/constants/widget.constant';
import { Widget } from '@/modules/widget/interfaces/widget.interface';

import Note from './dashboard-note';
import DashboardWidgetTools from './dashboard-widget-tools';

type DashboardNotesBoardProps = ComponentBaseProps & {
  address?: string;
};

const DashboardNotesBoard: React.FC<DashboardNotesBoardProps> = ({ address }) => {
  const { widgets, removeWidget, updateWidget } = useWidgetModal();
  const [widgetsList, setWidgetsList] = useState<Widget[]>(widgets);
  const [isShowDeletePopup, setIsShowDeletePopup] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  // const checkIfWidgetHasButton = useCallback((code: string) => {
  //   //console.log('code', code);
  //   return code.toLowerCase().includes('<a') || code.toLowerCase().includes('a>');
  // }, []);

  const moveNote = (fromIndex: number, toIndex: number) => {
    //moveWidget(fromIndex, toIndex);
    const updatedWidgets = [...widgetsList];

    console.log('🚀 ~ moveNote ~ updatedWidgets:', updatedWidgets);
    const [movedWidget] = updatedWidgets.splice(fromIndex, 1);

    console.log('🚀 ~ moveNote ~ movedWidget:', movedWidget);

    updatedWidgets.splice(toIndex, 0, movedWidget);
    console.log('updatedWidgets', updatedWidgets);
    setWidgetsList(updatedWidgets);
  };

  const handleWidgetClick = (widgetId: string) => {
    if (!address) {
      setSelectedWidgetId(widgetId);
      // setShowDeletePopup(true);
    }
  };

  const handleConfirmRemove = () => {
    if (selectedWidgetId) {
      removeWidget(selectedWidgetId);
    }
    setIsShowDeletePopup(false);
  };

  useEffect(() => {
    if (widgets.length === 0) {
      setWidgetsList(DUMMY_WIDGET_LIST);
    } else {
      setWidgetsList(widgets);
    }
  }, [widgets]);

  const handleClickDelete = () => {
    setIsShowDeletePopup(true);
  };

  const handleChangeSize = (size: WIDGET_SIZE) => {
    updateWidget(selectedWidgetId || '', { size });
  };

  const handleClickOutside = () => {
    setSelectedWidgetId(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-[200px] flex-wrap px-6">
        {widgetsList.map((widget, index) => (
          <Note
            key={widget.index}
            id={widget._id}
            index={index}
            moveNote={moveNote}
            size={widget.size || WIDGET_SIZE.MEDIUM}
            isSelected={selectedWidgetId === widget._id}
            onClick={() => handleWidgetClick(widget._id)}
            onClickOutside={handleClickOutside}
            onDelete={handleClickDelete}
            onChangeSize={handleChangeSize}
          >
            {widget.type === 'image' ? (
              <Image
                src={widget.tool?.code || ''}
                width={400}
                height={400}
                alt={widget.tool?.description || 'Widget Image'}
                className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-cover"
              />
            ) : widget.type === 'text' ? (
              <span>{widget.content}</span>
            ) : (
              <ViewFrameDashboard id={widget._id.toString()} code={widget.tool?.code || ''} />
            )}
          </Note>
        ))}
      </div>
      <AugmentedPopup
        visible={isShowDeletePopup}
        textHeading="Remove Widget"
        onClose={() => setIsShowDeletePopup(false)}
      >
        <div className="flex flex-col gap-5 p-8">
          <p>{`Are you sure you want to remove this widget?`}</p>
          <div className="mt-4 flex justify-end gap-2">
            <CustomButton
              className="text-sm font-semibold"
              onClick={() => setIsShowDeletePopup(false)}
            >{`Cancel`}</CustomButton>
            <CustomButton className="text-sm font-semibold" onClick={handleConfirmRemove}>{`Remove`}</CustomButton>
          </div>
        </div>
      </AugmentedPopup>
      <div className="px-8 py-6">
        <DashboardWidgetTools />
      </div>
    </DndProvider>
  );
};

export default DashboardNotesBoard;
