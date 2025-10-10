import React from 'react';
import { Button } from './Button';
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from './Icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-700 dark:text-gray-300 mb-4 sm:mb-0">
        Mostrando <span className="font-semibold">{startItem}</span> a <span className="font-semibold">{endItem}</span> de <span className="font-semibold">{totalItems}</span> resultados
      </div>
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
          <ChevronsLeftIcon className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>
        {pages.map((page, index) =>
          typeof page === 'number' ? (
            <Button
              key={index}
              variant={currentPage === page ? 'primary' : 'ghost'}
              size="icon"
              onClick={() => onPageChange(page)}
              className="w-10 h-10"
            >
              {page}
            </Button>
          ) : (
            <span key={index} className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
          )
        )}
        <Button variant="ghost" size="icon" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
          <ChevronsRightIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
