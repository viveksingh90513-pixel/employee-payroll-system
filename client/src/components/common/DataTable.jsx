/**
 * PayRoll Pro – DataTable Component
 * Reusable table with search, pagination, sorting, and action column.
 */

import { useState, useMemo } from 'react';
import { Pagination } from 'react-bootstrap';
import { HiOutlineSearch, HiOutlineInbox } from 'react-icons/hi';

const DataTable = ({
  columns = [],
  data = [],
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onSearch,
  searchPlaceholder = 'Search...',
  actions,
  loading = false,
  emptyMessage = 'No records found',
  headerActions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      // Debounce search
      clearTimeout(window._dtSearchTimeout);
      window._dtSearchTimeout = setTimeout(() => onSearch(value), 400);
    }
  };

  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="data-table-container">
      {/* Header: Search + Actions */}
      <div className="data-table-header">
        {onSearch && (
          <div className="data-table-search">
            <HiOutlineSearch className="data-table-search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        )}
        {headerActions && (
          <div className="data-table-actions">{headerActions}</div>
        )}
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <table className="table data-table mb-0">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width || 'auto', ...col.headerStyle }}>
                  {col.header}
                </th>
              ))}
              {actions && <th style={{ width: '120px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr key={`skeleton-${rowIdx}`}>
                  {columns.map((_, colIdx) => (
                    <td key={colIdx}>
                      <div className="skeleton" style={{ height: '16px', width: '80%', borderRadius: '4px' }} />
                    </td>
                  ))}
                  {actions && (
                    <td>
                      <div className="skeleton" style={{ height: '16px', width: '60px', borderRadius: '4px' }} />
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  <div className="table-empty">
                    <div className="table-empty-icon"><HiOutlineInbox /></div>
                    <div className="table-empty-title">{emptyMessage}</div>
                    <div className="table-empty-text">Try adjusting your search or filters</div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="animate-fade-in" style={{ animationDelay: `${rowIdx * 0.03}s` }}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} style={col.cellStyle}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {actions && (
                    <td>
                      <div className="table-actions">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: Info + Pagination */}
      {totalItems > 0 && (
        <div className="data-table-footer">
          <div className="data-table-info">
            Showing {startItem} to {endItem} of {totalItems} entries
          </div>
          {totalPages > 1 && (
            <Pagination size="sm" className="mb-0">
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
              />
              {pageNumbers[0] > 1 && (
                <>
                  <Pagination.Item onClick={() => onPageChange(1)}>1</Pagination.Item>
                  {pageNumbers[0] > 2 && <Pagination.Ellipsis disabled />}
                </>
              )}
              {pageNumbers.map((page) => (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <Pagination.Ellipsis disabled />}
                  <Pagination.Item onClick={() => onPageChange(totalPages)}>{totalPages}</Pagination.Item>
                </>
              )}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              />
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
};

export default DataTable;
