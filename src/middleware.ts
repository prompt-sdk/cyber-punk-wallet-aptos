import type { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import createIntlMiddleware from 'next-intl/middleware';
import { defaultLocale, localeDetection, localePrefix, locales, pathnames, publicPages } from './config';

const intlMiddleware = createIntlMiddleware({ locales, pathnames, defaultLocale, localePrefix, localeDetection });
const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => token != null
    },
    pages: {
      signIn: '/login'
    }
  }
);

export default async function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(
    `^(/(${locales.join('|')}))?(${publicPages.flatMap(p => (p === '/' ? ['', '/'] : p)).join('|')})/?$`,
    'i'
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  let response: NextResponse;

  if (isPublicPage) {
    response = intlMiddleware(req);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response = (authMiddleware as any)(req);
  }

  return response;
}

export const config = {
  // Skip all paths that should not be internationalized. This example skips
  // certain folders and all pathnames with a dot (e.g. favicon.ico)
  matcher: ['/((?!api|_next|_vercel|sitemap.xml|sitemap-[\\d].xml|.*\\..*).*)']
};
