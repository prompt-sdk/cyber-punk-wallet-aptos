import { LocalePrefix, Pathnames } from 'next-intl/routing';

export const localeDetection = false;
export const defaultLocale = 'en-us';
export const publicPages = ['/', '/login'];
export const locales = ['en-us', 'vi-vn'] as const;
export const localePrefix = { mode: 'as-needed' } satisfies LocalePrefix<typeof locales>;
export const pathnames = {
  '/': '/',
  '/login': '/login',
  '/dashboard': '/dashboard'
} satisfies Pathnames<typeof locales>;
