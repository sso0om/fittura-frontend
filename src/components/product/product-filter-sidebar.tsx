import { useGetProductFilter } from "@/api/generated/product-v1/product-v1";

interface FilterOption {
  id?: number;
  name?: string;
}

interface ProductFilterSidebarProps {
  selectedColors: number[];
  selectedMaterials: number[];
  onColorsChange: (colorIds: number[]) => void;
  onMaterialsChange: (materialIds: number[]) => void;
}

function toggleId(ids: number[], id: number): number[] {
  return ids.includes(id)
    ? ids.filter((existing) => existing !== id)
    : [...ids, id];
}

/**
 * 상품 목록 좌측 필터 영역 - 색상(위) / 재질(아래) 체크박스
 * 필터 옵션(색상/재질 목록) 자체는 자주 바뀌지 않는 참조성 데이터라 카테고리 트리와 동일하게 staleTime을 둠
 */
export function ProductFilterSidebar({
  selectedColors,
  selectedMaterials,
  onColorsChange,
  onMaterialsChange,
}: ProductFilterSidebarProps) {
  const { data } = useGetProductFilter({
    query: { staleTime: 5 * 60 * 1000 },
  });

  const colors = data?.data?.colors ?? [];
  const materials = data?.data?.materials ?? [];

  return (
    <aside className="mt-5 w-[15%] shrink-0">
      {colors.length > 0 && (
        <FilterGroup
          title="색상"
          options={colors}
          selectedIds={selectedColors}
          onToggle={(id) => onColorsChange(toggleId(selectedColors, id))}
        />
      )}

      {materials.length > 0 && (
        <FilterGroup
          title="재질"
          options={materials}
          selectedIds={selectedMaterials}
          onToggle={(id) => onMaterialsChange(toggleId(selectedMaterials, id))}
          className="mt-6"
        />
      )}
    </aside>
  );
}

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  className?: string;
}

function FilterGroup({
  title,
  options,
  selectedIds,
  onToggle,
  className,
}: FilterGroupProps) {
  return (
    <div className={className}>
      <h3 className="text-foreground mb-3 text-sm font-semibold">{title}</h3>
      <ul className="flex flex-col gap-2">
        {options.map((option) => {
          if (option.id == null) return null;
          const id = option.id;

          return (
            <li key={id}>
              <label className="text-foreground/80 flex cursor-pointer items-center gap-1.5 text-[13px] select-none">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(id)}
                  onChange={() => onToggle(id)}
                  className="accent-foreground size-4"
                />
                {option.name}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
