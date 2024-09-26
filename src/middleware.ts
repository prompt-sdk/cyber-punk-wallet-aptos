import type { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { defaultLocale, localeDetection, localePrefix, locales, pathnames } from './navigation';

const intlMiddleware = createIntlMiddleware({
  locales,
  pathnames,
  defaultLocale,
  localePrefix,
  localeDetection
});

export default async function middleware(request: NextRequest) {
  const locale = request.headers.get('x-default-locale') || defaultLocale;

  const response: NextResponse = intlMiddleware(request);

  response.headers.set('x-default-locale', locale);

  return response;
}

export const config = {
  // Skip all paths that should not be internationalized. This example skips
  // certain folders and all pathnames with a dot (e.g. favicon.ico)
  matcher: ['/((?!api|_next|_vercel|sitemap.xml|sitemap-[\\d].xml|.*\\..*).*)']
};
