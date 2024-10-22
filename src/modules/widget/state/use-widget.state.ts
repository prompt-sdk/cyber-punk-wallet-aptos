import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { Widget } from '@/modules/widget/interfaces/widget.interface';

type States = {
  selectedWidget?: Widget;
};

type Actions = {
  selectSingleWidget: (widget: Widget) => void;
};

export const useWidgetState = create<States & Actions>()(
  devtools(
    immer(set => ({
      selectedWidget: undefined,
      selectSingleWidget: (widget: Widget) => set({ selectedWidget: widget })
    })),
    {
      name: 'widgetState'
    }
  )
);
