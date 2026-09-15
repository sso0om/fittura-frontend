export type ProductSort =
  "createdDate,desc" | "basePrice,asc" | "basePrice,desc";

export interface ProductToolbarProps {
  totalCount: number;
  sort: ProductSort;
  onSortChange: (sort: ProductSort) => void;
  activeOnly: boolean;
  onActiveOnlyChange: (activeOnly: boolean) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "createdDate,desc", label: "신상품순" },
  { value: "basePrice,asc", label: "낮은 가격순" },
  { value: "basePrice,desc", label: "높은 가격순" },
];

const PAGE_SIZE_OPTIONS = [20, 40, 60, 80];

const selectClass =
  "border-border bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border px-3 text-[13px] outline-none focus-visible:ring-3";

/**
 * 상품 개수 + 품절제외 체크박스 + 정렬 드롭다운 + 페이지당 개수 드롭다운
 */
export function ProductToolbar({
  totalCount,
  sort,
  onSortChange,
  activeOnly,
  onActiveOnlyChange,
  pageSize,
  onPageSizeChange,
}: ProductToolbarProps) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <p className="text-foreground text-sm">
        전체 <b className="font-bold">{totalCount}개</b>
      </p>
      <div className="flex items-center gap-3">
        <label className="text-foreground flex cursor-pointer items-center gap-1.5 text-[13px] select-none">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(event) => onActiveOnlyChange(event.target.checked)}
            className="accent-foreground size-4"
          />
          품절제외
        </label>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as ProductSort)}
          className={selectClass}
          aria-label="정렬 기준"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className={selectClass}
          aria-label="페이지당 개수"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}개씩
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
