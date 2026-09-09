import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "cn";
import { Button } from "@/components/ui/button";

export interface PaginationProps {
  /** 0-base 페이지 번호 (백엔드 Pageable 기준) */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MAX_VISIBLE_PAGES = 5;

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const windowStart = Math.max(
    0,
    Math.min(
      page - Math.floor(MAX_VISIBLE_PAGES / 2),
      totalPages - MAX_VISIBLE_PAGES,
    ),
  );
  const visiblePages = Array.from(
    { length: Math.min(MAX_VISIBLE_PAGES, totalPages) },
    (_, index) => windowStart + index,
  );

  return (
    <nav
      aria-label="페이지 이동"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="이전 페이지"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-4" />
      </Button>

      {visiblePages.map((pageIndex) => (
        <button
          key={pageIndex}
          type="button"
          aria-current={pageIndex === page ? "page" : undefined}
          onClick={() => onPageChange(pageIndex)}
          className={cn(
            "flex size-8 items-center justify-center rounded-lg text-sm",
            pageIndex === page
              ? "bg-foreground text-background font-medium"
              : "text-foreground/80 hover:bg-muted",
          )}
        >
          {pageIndex + 1}
        </button>
      ))}

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="다음 페이지"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
