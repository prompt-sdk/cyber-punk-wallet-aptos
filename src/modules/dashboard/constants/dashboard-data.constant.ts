import { WidgetItem } from '../interfaces/dashboard.interface';

import AvatarImage from '@/assets/images/avatar/avatar-1.jpeg';

export const DASH_BOARD_AGENT_LIST = [
  { name: 'Agent 1', avatar: AvatarImage.src },
  { name: 'Agent 2', avatar: AvatarImage.src },
  { name: 'Agent 3', avatar: AvatarImage.src },
  { name: 'Agent 4', avatar: AvatarImage.src },
  { name: 'Agent 5', avatar: AvatarImage.src },
  { name: 'Agent 6', avatar: AvatarImage.src },
  { name: 'Agent 7', avatar: AvatarImage.src },
  { name: 'Agent 8', avatar: AvatarImage.src }
];

export const DASH_BOARD_NOTE_LIST: WidgetItem[] = [
  { id: 1, content: 'add note', size: 'small' },
  { id: 2, content: 'add note', size: 'medium' },
  { id: 3, content: 'add note', size: 'large' }
];
