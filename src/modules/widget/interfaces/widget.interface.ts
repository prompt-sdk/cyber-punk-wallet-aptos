import { ResponseFormat } from '@/common/interfaces/api-response.interface';

import { WIDGET_SIZE, WIDGET_TYPES } from '../constants/widget.constant';

export type Widget = {
  _id: string;
  index?: number;
  type: WIDGET_TYPES;
  name?: string;
  icon?: string;
  content?: string;
  size?: WIDGET_SIZE;
  user_id?: string;
  tool?: {
    code: string;
    description?: string;
    type?: string;
  };
};

export type Tool = {
  name: string;
  description: string;
  params: Record<string, { type: string; description: string }>;
  functions: string;
  address: string;
};

export type ToolsResponse = ResponseFormat<Widget[]>;
