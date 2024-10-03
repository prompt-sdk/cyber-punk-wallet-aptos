import React, { FC, memo, useMemo } from 'react';
import classNames from 'classnames';

import { Button } from './button';
import { ChevronLeft, ChevronRight, ChevronsLeftIcon, ChevronsRightIcon, Icon } from 'lucide-react';

interface IPagination {
  className?: string;
  type?: 'minimal' | 'compact';
  totalItems?: number;
  currentPage?: number;
  itemPerPage?: number;
  pageVisible?: number;
  visible?: boolean;
  onChange?: (page: number) => void;
}

const Pagination: FC<IPagination> = memo(
  ({
    className,
    type,
    totalItems = 0,
    currentPage = 1,
    itemPerPage = 5,
    pageVisible = 5,
    visible = true,
    onChange,
    ...rest
  }) => {
    const pager = useMemo(
      () =>
        generatePagination({
          totalItems,
          currentPage,
          itemPerPage,
          pageVisible
        }),
      [totalItems, currentPage, itemPerPage, pageVisible]
    );

    const setPage = (page: number) => {
      if (page === currentPage) return;
      onChange?.(page);
    };

    const renderPageNumber = () => {
      if (type === 'minimal') return null;

      return pager.pages.map((page: number, index: number) => (
        <li key={index}>
          <Button
            variant={pager.currentPage === page ? 'default' : 'outline'}
            className={classNames('min-w-9 p-0')}
            onClick={e => {
              setPage(page);
              e.preventDefault();
            }}
          >
            {page}
          </Button>
        </li>
      ));
    };

    const renderFirstButton = () => {
      if (type === 'minimal' || type === 'compact') return null;

      return (
        <li className={classNames(pager.currentPage === 1 ? 'nap-pagination__item--disabled' : '')}>
          <Button
            variant="outline"
            className="min-w-9 p-0"
            disabled={pager.currentPage === 1}
            data-testid="nap-pagination-prev"
            onClick={() => setPage(1)}
          >
            <ChevronsLeftIcon size={18} />
          </Button>
        </li>
      );
    };

    const renderLastButton = () => {
      if (type === 'minimal' || type === 'compact') return null;

      return (
        <li>
          <Button
            variant="outline"
            className="min-w-9 p-0"
            disabled={pager.currentPage === pager.totalPages}
            data-testid="nap-pagination-last"
            onClick={() => setPage(pager.totalPages)}
          >
            <ChevronsRightIcon size={18} />
          </Button>
        </li>
      );
    };

    const renderPreviousButton = () => {
      return (
        <li>
          <Button
            variant="outline"
            className="min-w-9 p-0"
            disabled={pager.currentPage === 1}
            data-testid="nap-pagination-prev"
            onClick={() => setPage(pager.currentPage - 1)}
          >
            <ChevronLeft size={18} />
          </Button>
        </li>
      );
    };

    const renderNextButton = () => {
      return (
        <li>
          <Button
            variant="outline"
            className="min-w-9 p-0"
            disabled={pager.currentPage === pager.totalPages}
            data-testid="nap-pagination-next"
            onClick={() => setPage(pager.currentPage + 1)}
          >
            <ChevronRight size={18} />
          </Button>
        </li>
      );
    };

    if (!visible) return null;
    if (!totalItems) return null;
    if (!currentPage) return null;
    if (pager && !pager.pages) return null;

    return (
      <div className={classNames('nap-pagination', className)} data-testid="nap-pagination" {...rest}>
        <ul className="nap-pagination__list flex w-full items-center gap-x-1.5">
          {renderFirstButton()}
          {renderPreviousButton()}
          {renderPageNumber()}
          {renderNextButton()}
          {renderLastButton()}
        </ul>
      </div>
    );
  }
);

Pagination.displayName = 'Pagination';

export default Pagination;

interface IPager {
  totalItems: number;
  currentPage: number;
  itemPerPage: number;
  totalPages: number;
  startPage: number;
  endPage: number;
  startIndex: number;
  endIndex: number;
  pages: number[];
}
export interface IPageParams {
  totalItems: number;
  currentPage: number;
  itemPerPage: number;
  pageVisible: number;
}
export const generatePagination = ({ totalItems, currentPage, itemPerPage, pageVisible }: IPageParams): IPager => {
  const totalPages = Math.ceil(totalItems / itemPerPage);
  const middle = Math.floor(pageVisible / 2);
  const preMiddle = middle - 1;
  const nextMiddle = middle + 1;
  const isOdd = pageVisible % 2 === 0;
  let startPage: number, endPage: number;
  if (totalPages <= pageVisible) {
    startPage = 1;
    endPage = totalPages;
  } else {
    if (currentPage <= nextMiddle) {
      startPage = 1;
      endPage = pageVisible;
    } else if (currentPage + preMiddle >= totalPages) {
      startPage = totalPages - (pageVisible - 1);
      endPage = totalPages;
    } else {
      startPage = currentPage - middle;
      endPage = currentPage + (isOdd ? preMiddle : middle);
    }
  }
  const startIndex = (currentPage - 1) * itemPerPage;
  const endIndex = Math.min(startIndex + itemPerPage - 1, totalItems - 1);
  // eslint-disable-next-line prefer-spread
  const pages = Array.apply(null, {
    length: endPage + 1 - startPage
  } as unknown[]).map((_, i) => startPage + i);
  return {
    totalItems: totalItems,
    currentPage: currentPage,
    itemPerPage: itemPerPage,
    totalPages: totalPages,
    startPage: startPage,
    endPage: endPage,
    startIndex: startIndex,
    endIndex: endIndex,
    pages: pages
  } as IPager;
};
