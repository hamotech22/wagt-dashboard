export default function DashboardPagination({
  rowsPerPage,
  rowCount,
  currentPage,
  onChangePage,
  onChangeRowsPerPage,
  paginationRowsPerPageOptions = [5, 10, 25],
  paginationComponentOptions,
}) {
  const firstRow = rowCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const lastRow = Math.min(currentPage * rowsPerPage, rowCount);
  const firstPage = currentPage === 1;
  const lastPage = currentPage * rowsPerPage >= rowCount;

  const changePage = (page) => onChangePage(page, rowCount);

  return (
    <div className="flex min-h-[52px] w-full flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
      <div className="flex flex-wrap items-center gap-2">
        <label className="whitespace-nowrap">
          {paginationComponentOptions?.rowsPerPageText ?? "Rows per page:"}
        </label>
        <select
          aria-label={paginationComponentOptions?.rowsPerPageText ?? "Rows per page"}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          value={rowsPerPage}
          onChange={(event) => onChangeRowsPerPage(Number(event.target.value), currentPage)}
        >
          {paginationRowsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="whitespace-nowrap" aria-live="polite">
          {firstRow}–{lastRow} من {rowCount}
        </span>
      </div>

      <div className="flex items-center gap-1" dir="ltr">
        <button
          type="button"
          aria-label="First Page"
          disabled={firstPage}
          onClick={() => changePage(1)}
          className="rounded p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-700"
        >
          «
        </button>
        <button
          type="button"
          aria-label="Previous Page"
          disabled={firstPage}
          onClick={() => changePage(currentPage - 1)}
          className="rounded p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-700"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next Page"
          disabled={lastPage}
          onClick={() => changePage(currentPage + 1)}
          className="rounded p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-700"
        >
          ›
        </button>
        <button
          type="button"
          aria-label="Last Page"
          disabled={lastPage}
          onClick={() => changePage(Math.max(1, Math.ceil(rowCount / rowsPerPage)))}
          className="rounded p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-700"
        >
          »
        </button>
      </div>
    </div>
  );
}
