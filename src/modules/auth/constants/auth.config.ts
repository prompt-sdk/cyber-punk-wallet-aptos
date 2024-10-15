import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import { authOptions } from '@/modules/auth/constants/auth.constant';

export const { auth, signIn, signOut, handlers } = NextAuth(authOptions);
