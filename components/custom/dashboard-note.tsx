import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { EditIcon, Trash2Icon } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';

import BoderImage from '@/components/common/border-image';

import { WIDGET_SIZE } from '@/components/utils/use-widget-modal';

import WidgetFrame from '@/public/assets/svgs/widget-frame.svg';
import WidgetFrame2 from '@/public/assets/svgs/widget-frame-2.svg';
import WidgetNoteDecor from '@/public/assets/svgs/widget-note-decor.svg';

const ItemTypes = {
  NOTE: 'note'
};

interface INoteProps {
  id: string;
  index: number;
  moveNote: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
  size: WIDGET_SIZE;
  onClick: () => void;
  isSelected?: boolean;
  onDelete?: () => void;
  onChangeSize?: (size: WIDGET_SIZE) => void;
  onClickOutside?: () => void;
}

const Note: React.FC<INoteProps> = ({
  id,
  index,
  moveNote,
  children,
  size,
  onClick,
  isSelected = false,
  onDelete,
  onChangeSize,
  onClickOutside
}) => {
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);

  const [, drag] = useDrag({
    type: ItemTypes.NOTE,
    item: { id, index }
  });

  const [, drop] = useDrop({
    accept: ItemTypes.NOTE,
    hover: (draggedItem: { id: number; index: number }) => {
      if (draggedItem.index !== index) {
        moveNote(draggedItem.index, index);
        draggedItem.index = index;
      }
    }
  });

  const sizeClasses = {
    fit: 'w-full h-full',
    'xs-small': 'w-1/2 h-20', // 1x2 aspect ratio
    small: 'w-1/2 h-32', // 1x1 aspect ratio
    medium: 'w-1/2 h-64', // 1x2 aspect ratio
    large: 'w-full h-64' // 4x2 aspect ratio
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (widgetContainerRef.current && !widgetContainerRef.current.contains(event.target as Node)) {
      // onClickOutside?.();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside); // Add event listener

    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Cleanup event listener
    };
  }, []);

  return (
    <div
      ref={node => {
        widgetContainerRef.current = node;
        drag(drop(node));
      }}
      className={`relative flex shrink-0 cursor-move items-center justify-center transition-all duration-300 ${sizeClasses[size]} p-2 `}
      onClick={onClick}
    >
      <div
        className={`absolute -top-3 z-1 flex w-full justify-between ${isSelected ? '' : 'pointer-events-none opacity-0'}`}
      >
        <div className="rounded-lg bg-white p-2">
          <EditIcon className="cursor-pointer text-black" />
        </div>
        <div className="rounded-lg bg-white p-2">
          <Trash2Icon className="cursor-pointer text-black" onClick={onDelete} />
        </div>
      </div>
      <BoderImage
        imageBoder={size === 'small' ? WidgetFrame.src : WidgetFrame2.src}
        className="relative flex h-full w-full flex-col [border-image-slice:15_fill] [border-image-width:12px]"
      >
        <div className="grow p-2">{children}</div>
        <div className="flex shrink-0 justify-end">
          <Image
            src={WidgetNoteDecor.src}
            alt="Note Decor"
            width={WidgetNoteDecor.width}
            height={WidgetNoteDecor.height}
          />
        </div>
      </BoderImage>
      <div
        className={`absolute -bottom-10 z-1 flex w-full justify-center gap-3 rounded-lg bg-white p-2 text-black ${isSelected ? '' : 'pointer-events-none opacity-0'}`}
      >
        <div
          className="cursor-pointer"
          onClick={() => {
            onChangeSize?.(WIDGET_SIZE.SMALL);
          }}
        >
          {WIDGET_SIZE.SMALL}
        </div>
        <div
          className="cursor-pointer"
          onClick={() => {
            onChangeSize?.(WIDGET_SIZE.XS_SMALL);
          }}
        >
          {WIDGET_SIZE.XS_SMALL}
        </div>
        <div
          className="cursor-pointer"
          onClick={() => {
            onChangeSize?.(WIDGET_SIZE.MEDIUM);
          }}
        >
          {WIDGET_SIZE.MEDIUM}
        </div>
        <div
          className="cursor-pointer"
          onClick={() => {
            onChangeSize?.(WIDGET_SIZE.LARGE);
          }}
        >
          {WIDGET_SIZE.LARGE}
        </div>
      </div>
    </div>
  );
};

export default Note;
