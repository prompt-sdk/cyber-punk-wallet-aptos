import NextAuth from 'next-auth';

import { authOptions } from '@/modules/auth/constants/auth.constant';

const { handlers } = NextAuth(authOptions);
export const { GET, POST } = handlers;
