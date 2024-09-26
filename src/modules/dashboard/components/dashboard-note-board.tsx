import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { WidgetItem } from '../interfaces/dashboard.interface';

import { DASH_BOARD_NOTE_LIST } from '../constants/dashboard-data.constant';

import Note from './dashboard-note';

const DashboardNotesBoard: React.FC = () => {
  const [notes, setNotes] = useState<Array<WidgetItem>>(DASH_BOARD_NOTE_LIST);

  const moveNote = (fromIndex: number, toIndex: number) => {
    const updatedNotes = [...notes];
    const [movedNote] = updatedNotes.splice(fromIndex, 1);

    updatedNotes.splice(toIndex, 0, movedNote);
    setNotes(updatedNotes);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-wrap px-6">
        {notes.map((note, index) => (
          <Note key={note.id} id={note.id} index={index} moveNote={moveNote} size={note.size}>
            {note.content}
          </Note>
        ))}
      </div>
    </DndProvider>
  );
};

export default DashboardNotesBoard;
