export type Tool = {
  _id: string;
  name: string;
  tool: {
    name: string;
    description: string;
    params: Record<string, { type: string; description: string }>;
    functions: string;
    address: string;
  };
  user_id: string;
  type: string;
};
