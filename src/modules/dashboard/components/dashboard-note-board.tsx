import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { WidgetItem } from '../interfaces/dashboard.interface';

import { DASH_BOARD_NOTE_LIST } from '../constants/dashboard-data.constant';

import Note from './dashboard-note';
import { useSession } from 'next-auth/react';
import { ViewFrame, ViewFrameDashboard } from '@/modules/chat/validation/ViewFarm';
import { useWidgetModal } from '@/modules/dashboard/hooks/useWidgetModal';
import AugmentedPopup from '@/modules/augmented/components/augmented-popup';
import { Button } from '@/components/ui/button';
import { ComponentBaseProps } from '@/common/interfaces';

type DashboardNotesBoardProps = ComponentBaseProps & {
  address?: string;
};

const DashboardNotesBoard: React.FC<DashboardNotesBoardProps> = ({ address }) => {
  const [notes, setNotes] = useState<Array<WidgetItem>>(DASH_BOARD_NOTE_LIST);
  const [widgetTools, setWidgetTools] = useState<any>([]);
  const { data: session }: any = useSession();
  const { widgets, removeWidget } = useWidgetModal();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  const fetchWidgetTools = useCallback(async () => {
    try {
      const response = await fetch(`/api/tools?userId=${session?.user?.username || address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }
      const data = await response.json();
      const filteredTools = data.filter((tool: any) => tool.type === 'widgetTool');
      console.log('filteredTools', filteredTools);
      setWidgetTools(filteredTools);
    } catch (error) {
      console.error('Error fetching widget tools:', error);
    }
  }, [session?.user?.username, address]);

  useEffect(() => {
    fetchWidgetTools();
  }, [fetchWidgetTools]);

  const moveNote = (fromIndex: number, toIndex: number) => {
    const updatedNotes = [...notes];
    const [movedNote] = updatedNotes.splice(fromIndex, 1);

    updatedNotes.splice(toIndex, 0, movedNote);
    setNotes(updatedNotes);
  };

  const handleWidgetClick = (widgetId: string) => {
    if (!address) {
      setSelectedWidgetId(widgetId);
      setShowPopup(true);
    }
  };

  const handleConfirmRemove = () => {
    if (selectedWidgetId) {
      removeWidget(selectedWidgetId);
    }
    setShowPopup(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-[200px] flex-wrap px-6">
        {widgets.map((widget: any, index: number) => (
          <Note
            key={widget._id}
            id={widget._id}
            index={index}
            moveNote={moveNote}
            size={widget.size || 'medium'}
            onClick={() => handleWidgetClick(widget._id)}
          >
            <ViewFrameDashboard id={widget._id.toString()} code={widget.tool?.code} />
          </Note>
        ))}
      </div>
      <AugmentedPopup visible={showPopup} onClose={() => setShowPopup(false)} textHeading="Remove Widget">
        <div className="flex flex-col gap-5 p-8">
          <p>{`Are you sure you want to remove this widget?`}</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setShowPopup(false)}>{`Cancel`}</Button>
            <Button onClick={handleConfirmRemove}>{`Remove`}</Button>
          </div>
        </div>
      </AugmentedPopup>
    </DndProvider>
  );
};

export default DashboardNotesBoard;
