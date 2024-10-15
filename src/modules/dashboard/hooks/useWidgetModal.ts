import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Widget {
  _id: string;
  type: string;
  name: string;
  icon: string;
  tool?: {
    code: string;
  };
  size?: string;
}

interface WidgetModalStore {
  isOpen: boolean;
  widgets: Widget[];
  openWidgetModal: () => void;
  closeWidgetModal: () => void;
  addWidget: (widget: Widget) => void;
  removeWidget: (widgetId: string) => void;
}

export const useWidgetModal = create(
  persist<WidgetModalStore>(
    set => ({
      isOpen: false,
      widgets: [],
      openWidgetModal: () => set({ isOpen: true }),
      closeWidgetModal: () => set({ isOpen: false }),
      addWidget: (widget: Widget) => set(state => ({ widgets: [...state.widgets, widget] })),
      removeWidget: (widgetId: string) =>
        set(state => ({
          widgets: state.widgets.filter(widget => widget._id !== widgetId)
        }))
    }),
    {
      name: 'widget-storage',
      getStorage: () => localStorage
    }
  )
);
