import React, { useState, useMemo } from "react";
import { Workspace } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 100;

export function DataGrid({ workspace }: { workspace: Workspace }) {
  if (!workspace.data || workspace.data.length === 0) return <div className="p-8 text-center text-gray-500 font-mono tracking-widest uppercase">No data available</div>;

  const columns = Object.keys(workspace.data[0]);
  const totalRows = workspace.data.length;
  const totalPages = Math.ceil(totalRows / PAGE_SIZE);

  const [currentPage, setCurrentPage] = useState(1);

  // Reset page if data shrinks
  const safePage = Math.min(currentPage, totalPages);

  const pageData = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return workspace.data.slice(start, start + PAGE_SIZE);
  }, [workspace.data, safePage]);

  const pageStart = (safePage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(safePage * PAGE_SIZE, totalRows);

  return (
    <div className="flex flex-col h-full w-full bg-surface2 border-t border-accent/10">
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-white/5 text-sm">
          <thead className="bg-surface sticky top-0 z-10 shadow-md">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-accent uppercase tracking-wider border-b border-accent/20">
                #
              </th>
              {columns.map(col => (
                <th key={col} className="px-4 py-3 text-left font-semibold text-accent uppercase tracking-wider border-b border-accent/20 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-transparent">
            {pageData.map((row, idx) => (
              <tr key={(safePage - 1) * PAGE_SIZE + idx} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-2 text-gray-500 font-mono whitespace-nowrap">
                  {(safePage - 1) * PAGE_SIZE + idx + 1}
                </td>
                {columns.map(col => (
                  <td key={col} className="px-4 py-2 text-gray-300 truncate max-w-xs">
                    {row[col] !== null && row[col] !== undefined && row[col] !== "" ? (
                      String(row[col])
                    ) : (
                      <span className="text-gray-600 italic">null</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-surface border-t border-white/10 flex-shrink-0">
          <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">
            Rows {pageStart.toLocaleString()} - {pageEnd.toLocaleString()} of {totalRows.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            {/* Page number buttons */}
            {totalPages <= 7 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-medium transition-all duration-200 ${
                    page === safePage
                      ? "bg-accent text-bg shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                      : "text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  {page}
                </button>
              ))
            ) : (
              <>
                <PageButton page={1} current={safePage} onClick={setCurrentPage} />
                {safePage > 3 && <span className="text-gray-600 text-xs px-1">...</span>}
                {safePage > 2 && <PageButton page={safePage - 1} current={safePage} onClick={setCurrentPage} />}
                <PageButton page={safePage} current={safePage} onClick={setCurrentPage} />
                {safePage < totalPages - 1 && <PageButton page={safePage + 1} current={safePage} onClick={setCurrentPage} />}
                {safePage < totalPages - 2 && <span className="text-gray-600 text-xs px-1">...</span>}
                <PageButton page={totalPages} current={safePage} onClick={setCurrentPage} />
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-white/5"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-white/5"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PageButton({ page, current, onClick }: { page: number; current: number; onClick: (p: number) => void }) {
  const isActive = page === current;
  return (
    <button
      onClick={() => onClick(page)}
      className={`w-8 h-8 rounded-lg text-xs font-mono font-medium transition-all duration-200 ${
        isActive
          ? "bg-accent text-bg shadow-[0_0_10px_rgba(0,229,255,0.3)]"
          : "text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
      }`}
    >
      {page}
    </button>
  );
}