import { Widget } from '../interfaces/widget.interface';

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
    _id: '1',
    index: 0,
    type: WIDGET_TYPES.TEXT,
    content: 'Welcome',
    size: WIDGET_SIZE.XS_SMALL,
    user_id: ''
  },
  {
    _id: '2',
    index: 1,
    type: WIDGET_TYPES.TEXT,
    content: 'To',
    size: WIDGET_SIZE.SMALL,
    user_id: ''
  },
  {
    _id: '3',
    index: 2,
    type: WIDGET_TYPES.IMAGE,
    tool: { code: 'background.jpg', description: 'Prompt Wallet' },
    size: WIDGET_SIZE.LARGE,
    user_id: ''
  }
];
