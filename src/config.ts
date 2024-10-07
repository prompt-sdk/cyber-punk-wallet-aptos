import { LocalePrefix, Pathnames } from 'next-intl/routing';

export const localeDetection = false;
export const defaultLocale = 'en-us';
export const publicPages = [
  '/',
  '/login',
  '/chat',
  '/callback',
  '/chat/(.*)',
  '/create-agent',
  '/create-widget',
  '/create-tool'
];
export const locales = ['en-us', 'vi-vn'] as const;
export const localePrefix = { mode: 'as-needed' } satisfies LocalePrefix<typeof locales>;
export const pathnames = {
  '/': '/',
  '/login': '/login',
  '/dashboard': '/dashboard',
  '/chat': '/chat',
  '/chat/[id]': '/chat/[id]',
  '/callback': '/callback',
  '/create-agent': '/create-agent',
  '/create-widget': '/create-widget',
  '/create-tool': '/create-tool'
} satisfies Pathnames<typeof locales>;
