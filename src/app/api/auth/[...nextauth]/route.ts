import NextAuth from 'next-auth';

import { authOptions } from '@/modules/auth/constants/auth.constant';

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
