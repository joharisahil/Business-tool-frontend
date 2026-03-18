import { useState, useCallback } from "react";

export function useServerPagination(initialPage = 1, initialLimit = 10) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialLimit);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // reset
  }, []);

  return {
    currentPage,
    pageSize,
    setCurrentPage: goToPage,
    setPageSize: changePageSize,
  };
}