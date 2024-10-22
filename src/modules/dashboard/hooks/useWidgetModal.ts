import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { WIDGET_SIZE, WIDGET_TYPES } from '@/modules/widget/constants/widget.constant';
import { Widget } from '@/modules/widget/interfaces/widget.interface';

interface IWidgetModalStore {
  isOpen: boolean;
  widgets: Widget[];
  openWidgetModal: () => void;
  closeWidgetModal: () => void;
  addWidget: (widget: Widget) => void;
  removeWidget: (widgetId: string) => void;
  moveWidget: (widgetId: number, newIndex: number) => void;
  addImageWidget: (imageData: string) => void;
}

export const useWidgetModal = create(
  persist<IWidgetModalStore>(
    (set, get) => ({
      isOpen: false,
      widgets: [],
      openWidgetModal: () => set({ isOpen: true }),
      closeWidgetModal: () => set({ isOpen: false }),
      addWidget: (widget: Widget) =>
        set((state: any) => {
          if (!state.widgets.some((w: any) => w._id === widget._id)) {
            return { widgets: [...state.widgets, widget] };
          }

          return state;
        }),
      removeWidget: (widgetId: string) =>
        set(state => ({
          widgets: state.widgets.filter(widget => widget._id !== widgetId)
        })),
      moveWidget: (widgetId: number, newIndex: number) =>
        set(state => {
          const widgets = [...state.widgets];
          const currentIndex = widgets.findIndex(widget => widget.index === widgetId);

          if (currentIndex !== -1) {
            const [movedWidget] = widgets.splice(currentIndex, 1);

            widgets.splice(newIndex, 0, movedWidget);
          }

          return { widgets };
        }),
      addImageWidget: (imageData: string) =>
        set(state => {
          const newWidget: Widget = {
            _id: Date.now().toString(),
            type: WIDGET_TYPES.IMAGE,
            name: 'Image Widget',
            icon: 'ico-image',
            tool: {
              code: imageData
            },
            size: WIDGET_SIZE.LARGE
          };

          return { widgets: [...state.widgets, newWidget] };
        })
    }),
    {
      name: 'widget-storage',
      getStorage: () => localStorage
    }
  )
);
