import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { WidgetItem } from '../interfaces/dashboard.interface';

import { DASH_BOARD_NOTE_LIST } from '../constants/dashboard-data.constant';

import Note from './dashboard-note';
import { useSession } from 'next-auth/react';
import { ViewFrame } from '@/modules/chat/validation/ViewFarm';

const DashboardNotesBoard: React.FC = () => {
  const [notes, setNotes] = useState<Array<WidgetItem>>(DASH_BOARD_NOTE_LIST);
  const [widgetTools, setWidgetTools] = useState<any>([]);
  const { data: session }: any = useSession();

  const fetchWidgetTools = useCallback(async () => {
    try {
      const response = await fetch(`/api/tools?userId=${session?.user?.username}`);
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
  }, [session?.user?.username]);

  useEffect(() => {
    fetchWidgetTools();
  }, [fetchWidgetTools]);

  const moveNote = (fromIndex: number, toIndex: number) => {
    const updatedNotes = [...notes];
    const [movedNote] = updatedNotes.splice(fromIndex, 1);

    updatedNotes.splice(toIndex, 0, movedNote);
    setNotes(updatedNotes);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-wrap px-6">
        {/* {notes.map((note, index) => (
          <Note key={note.id} id={note.id} index={index} moveNote={moveNote} size={note.size}>
            {note.content}
          </Note>
        ))} */}
        {widgetTools.map((tool: any, index: number) => (
          <Note key={tool._id} id={tool._id} index={index + widgetTools.length} moveNote={moveNote} size={tool.size}>
            <ViewFrame code={tool.tool.code} />
          </Note>
        ))}
      </div>
    </DndProvider>
  );
};

export default DashboardNotesBoard;
