import { createLocalizedPathnamesNavigation, Pathnames } from 'next-intl/navigation';

export const locales = ['en-us', 'vi-vn'] as const;

export const defaultLocale = 'en-us';
export const localePrefix = 'as-needed';
export const localeDetection = false;

export const pathnames = {
  '/': '/'
} satisfies Pathnames<typeof locales>;

export const { Link, redirect, usePathname, useRouter, getPathname } = createLocalizedPathnamesNavigation({
  locales,
  pathnames: pathnames as typeof pathnames & Record<string & NonNullable<unknown>, string>
});
