import type { NextRequest as typeNextRequest, NextResponse as typeNextResponse } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authOptions } from '@/modules/auth/constants/auth.constant';
import createIntlMiddleware from 'next-intl/middleware';
import { defaultLocale, localeDetection, localePrefix, locales, pathnames, publicPages } from './config';
import { WEBSITE_URL } from '@/common/constants/site.constant';

const intlMiddleware = createIntlMiddleware({ locales, pathnames, defaultLocale, localePrefix, localeDetection });
const auth = NextAuth(authOptions).auth;

const authMiddleware = auth((req: any) => {
  if (req.auth) return intlMiddleware(req);
  const reqUrl = new URL(req.url);
  if (!req.auth && reqUrl?.pathname !== '/') {
    return NextResponse.redirect(
      new URL(`${WEBSITE_URL}/signin?callbackUrl=${encodeURIComponent(reqUrl?.pathname)}`, req.url)
    );
  }
});

export default async function middleware(req: typeNextRequest) {
  const publicPathnameRegex = RegExp(
    `^(/(${locales.join('|')}))?(${publicPages.flatMap(p => (p === '/' ? ['', '/'] : p)).join('|')})/?$`,
    'i'
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  let response: typeNextResponse;

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
