'use client';

import { ComponentProps } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';

import { Link, pathnames } from '@/navigation';

import { cn } from '../utils';

export default function NavigationLink<Pathname extends keyof typeof pathnames>({
  href,
  className,
  children,
  ...rest
}: ComponentProps<typeof Link<Pathname>>) {
  const selectedLayoutSegment = useSelectedLayoutSegment();
  const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';
  const isActive = pathname === href;

  return (
    <Link
      className={cn(className)}
      aria-current={isActive ? 'page' : undefined}
      href={href}
      style={{ fontWeight: isActive ? 'bold' : 'normal' }}
      {...rest}
    >
      {children}
    </Link>
  );
}
