export type Tool = {
    id: string;
    name: string;
    description: string;
    params: Record<string, { type: string; description: string }>;
    functions: string;
    userId: string;
};
