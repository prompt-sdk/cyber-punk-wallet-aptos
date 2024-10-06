'use client';

import { ComponentProps } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import classNames from 'classnames';
import type { pathnames } from '@/config';

import { Link } from '@/navigation';

interface INavigationLinkProps<Pathname extends keyof typeof pathnames> extends ComponentProps<typeof Link<Pathname>> {
  className?: string;
  activeClassName?: string;
}

export default function NavigationLink<Pathname extends keyof typeof pathnames>({
  href,
  className,
  activeClassName,
  ...rest
}: INavigationLinkProps<Pathname>) {
  const selectedLayoutSegment = useSelectedLayoutSegment();

  const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';

  const isActive = pathname === href;

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={classNames(className, { [activeClassName ?? '']: isActive })}
      href={href}
      {...rest}
    />
  );
}
