export type WidgetItem = { id: number; content: React.ReactNode; size: 'small' | 'medium' | 'large' };

export type AgentData = {
  name: string;
  description: string;
  introMessage: string;
  tools?: string[];
  widget?: string[];
  prompt: string;
  user_id: string;
  tool_ids?: string[];
  widget_ids?: string[];
  avatar?: string;
  messenge_template?: MessageTemplate[];
};

export type MessageTemplate = {
  title: string;
  description: string;
  content: string;
};
