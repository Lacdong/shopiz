import React, { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import s from "./SellerPagination.module.css";

export default function SellerPagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange?.(totalPages);
    }
  }, [currentPage, totalPages, onPageChange]);

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) {
        pages.push("...");
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 3) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={s.paginationWrapper} aria-label="Phân trang">
      <div className={s.info}>
        <span>
          Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trên{" "}
          <strong>{totalItems}</strong> mục
        </span>
      </div>

      <div className={s.controls}>
        {pageSizeOptions && pageSizeOptions.length > 0 && (
          <div className={s.pageSizeWrap}>
            <select
              className={s.pageSizeSelect}
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange?.(Number(e.target.value));
                onPageChange?.(1);
              }}
              aria-label="Số mục trên mỗi trang"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={s.pageNav}>
          <button
            type="button"
            className={s.arrowBtn}
            disabled={currentPage <= 1}
            onClick={() => onPageChange?.(currentPage - 1)}
            aria-label="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>

          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`dots-${idx}`} className={s.dots}>
                  ...
                </span>
              );
            }
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                className={`${s.pageBtn} ${isActive ? s.pageActive : ""}`}
                onClick={() => onPageChange?.(p)}
                aria-current={isActive ? "page" : undefined}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            className={s.arrowBtn}
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange?.(currentPage + 1)}
            aria-label="Trang sau"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
