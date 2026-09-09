export type ProductSort =
  "createdDate,desc" | "basePrice,asc" | "basePrice,desc";

export interface ProductToolbarProps {
  totalCount: number;
  sort: ProductSort;
  onSortChange: (sort: ProductSort) => void;
}

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "createdDate,desc", label: "신상품순" },
  { value: "basePrice,asc", label: "낮은 가격순" },
  { value: "basePrice,desc", label: "높은 가격순" },
];

/**
 * 상품 개수 + 정렬 드롭다운
 */
export function ProductToolbar({
  totalCount,
  sort,
  onSortChange,
}: ProductToolbarProps) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <p className="text-foreground text-sm">
        전체 <b className="font-bold">{totalCount}개</b>
      </p>
      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as ProductSort)}
        className="border-border bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border px-3 text-[13px] outline-none focus-visible:ring-3"
        aria-label="정렬 기준"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
