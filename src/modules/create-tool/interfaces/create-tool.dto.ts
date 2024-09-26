import { z } from 'zod';

import { CreateToolFormSchema } from '../validations/create-tool-form';

export type CreateToolFormData = z.infer<typeof CreateToolFormSchema>;
