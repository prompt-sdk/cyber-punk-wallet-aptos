import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Widget = {
    id: string;
    index?: number;
    type: WIDGET_TYPES;
    name?: string;
    icon?: string;
    content?: string;
    size?: WIDGET_SIZE;
    user_id?: string;
    code?: string;
    description?: string;
  };

export enum WIDGET_TYPES {
    TEXT = 'text',
    IMAGE = 'image',
    INPUT = 'input',
    CONTACT_TOOL = 'contactTool'
  }
  
  export enum WIDGET_SIZE {
    XS_SMALL = 'xs-small',
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large'
  }
  
export const DUMMY_WIDGET_LIST: Widget[] = [
    {
      id: '1',
      index: 0,
      type: WIDGET_TYPES.TEXT,
      content: 'Welcome',
      size: WIDGET_SIZE.XS_SMALL,
      user_id: ''
    },
    {
      id: '2',
      index: 1,
      type: WIDGET_TYPES.TEXT,
      content: 'To',
      size: WIDGET_SIZE.XS_SMALL,
      user_id: ''
    },
    {
      id: '3',
      index: 2,
      type: WIDGET_TYPES.IMAGE,
      code: '/assets/background.jpg', 
      description: 'Prompt Wallet',
      size: WIDGET_SIZE.LARGE,
      user_id: ''
    }
];

interface IWidgetModalStore {
  isOpen: boolean;
  widgets: Widget[];
  openWidgetModal: () => void;
  closeWidgetModal: () => void;
  addWidget: (widget: Widget) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, widget: Partial<Widget>) => void;
  moveWidget: (widgetId: number, newIndex: number) => void;
  addImageWidget: (imageData: string) => void;
}

export const useWidgetModal = create(
  persist<IWidgetModalStore>(
    set => ({
      isOpen: false,
      widgets: [],
      openWidgetModal: () => set({ isOpen: true }),
      closeWidgetModal: () => set({ isOpen: false }),
      updateWidget: (widgetId, widget) =>
        set(state => {
          const updatedWidgets = state.widgets.map(w => {
            if (w.id === widgetId) {
              return { ...w, ...widget };
            }

            return w;
          });

          return { widgets: updatedWidgets };
        }),
      addWidget: (widget: Widget) =>
        set((state: any) => {
          if (!state.widgets.some((w: any) => w.id === widget.id)) {
            return { widgets: [...state.widgets, widget] };
          }

          return state;
        }),
      removeWidget: (widgetId: string) =>
        set(state => ({
          widgets: state.widgets.filter(widget => widget.id !== widgetId)
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
            id: Date.now().toString(),
            type: WIDGET_TYPES.IMAGE,
            name: 'Image Widget',
            icon: 'ico-image',
            code: imageData,
            size: WIDGET_SIZE.LARGE
          };

          return { widgets: [...state.widgets, newWidget] };
        })
    }),
    {
      name: 'widget-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
