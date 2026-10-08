import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ProductSort =
  | "createdDate,desc"
  | "baseSalePrice,asc"
  | "baseSalePrice,desc";

export interface ProductToolbarProps {
  totalCount: number;
  sort: ProductSort;
  onSortChange: (sort: ProductSort) => void;
  inStockOnly: boolean;
  onInStockOnlyChange: (inStockOnly: boolean) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "createdDate,desc", label: "신상품순" },
  { value: "baseSalePrice,asc", label: "낮은 가격순" },
  { value: "baseSalePrice,desc", label: "높은 가격순" },
];

const PAGE_SIZE_OPTIONS = [20, 40, 60, 80].map((size) => ({
  value: size,
  label: `${size}개씩`,
}));

/**
 * 상품 개수 + 품절제외 체크박스 + 정렬 드롭다운 + 페이지당 개수 드롭다운
 */
export function ProductToolbar({
  totalCount,
  sort,
  onSortChange,
  inStockOnly,
  onInStockOnlyChange,
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
            checked={inStockOnly}
            onChange={(event) => onInStockOnlyChange(event.target.checked)}
            className="accent-primary size-4"
          />
          품절제외
        </label>
        <Select
          items={SORT_OPTIONS}
          value={sort}
          onValueChange={(next) => {
            if (next != null) onSortChange(next);
          }}
        >
          <SelectTrigger aria-label="정렬 기준" className="w-32 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={PAGE_SIZE_OPTIONS}
          value={pageSize}
          onValueChange={(next) => {
            if (next != null) onPageSizeChange(next);
          }}
        >
          <SelectTrigger aria-label="페이지당 개수" className="w-24 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
