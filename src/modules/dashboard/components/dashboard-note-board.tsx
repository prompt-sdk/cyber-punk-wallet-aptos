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
import InputWidget from './input-widget';

type DashboardNotesBoardProps = ComponentBaseProps & {
  address?: string;
};

const DashboardNotesBoard: React.FC<DashboardNotesBoardProps> = ({ address }) => {
  const [notes, setNotes] = useState<Array<WidgetItem>>(DASH_BOARD_NOTE_LIST);
  const [widgetTools, setWidgetTools] = useState<any>([]);
  const { data: session }: any = useSession();
  const { widgets, moveWidget, removeWidget } = useWidgetModal();
  const [widgetsList, setWidgetsList] = useState<any>(widgets);
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

  const checkIfWidgetHasButton = useCallback((code: string) => {
    //console.log('code', code);
    return code.toLowerCase().includes('<a') || code.toLowerCase().includes('a>');
  }, []);

  const moveNote = (fromIndex: number, toIndex: number) => {
    //moveWidget(fromIndex, toIndex);
    const updatedWidgets = [...widgetsList];
    const [movedWidget] = updatedWidgets.splice(fromIndex, 1);

    updatedWidgets.splice(toIndex, 0, movedWidget);
    setWidgetsList(updatedWidgets);
  };

  const handleWidgetClick = (widgetId: string, code: string) => {
    if (!address && !checkIfWidgetHasButton(code)) {
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

  useEffect(() => {
    setWidgetsList(widgets);
  }, [widgets]);

  console.log('widgetsList', widgets);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-[200px] flex-wrap px-6">
        {widgetsList.map((widget: any, index: number) => (
          <Note
            key={widget.index}
            id={widget.index}
            index={index}
            moveNote={moveNote}
            size={widget.size || 'medium'}
            onClick={() => handleWidgetClick(widget._id, widget.tool?.code)}
          >
            {widget.type === 'image' ? (
              <img src={widget.tool?.code} alt={widget.tool?.description || 'Widget Image'} />
            ) : widget.type === 'input' ? (
              <span>{widget.tool?.code}</span>
            ) : (
              <ViewFrameDashboard id={widget._id.toString()} code={widget.tool?.code} />
            )}
          </Note>
        ))}
        {/* {notes.map((note, index) => (
          <Note
            onClick={() => {
              console.log('note', note);
            }}
            key={note.id}
            id={note.id}
            index={index}
            moveNote={moveNote}
            size={note.size}
          >
            {note.content}
          </Note>
        ))} */}
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
