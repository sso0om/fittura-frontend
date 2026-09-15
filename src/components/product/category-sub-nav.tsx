"use client";

import Link from "next/link";

import { cn } from "cn";
import { useCategoryTree } from "@/components/layout/use-category-tree";

interface CategorySubNavProps {
  /** 현재 선택된 카테고리 id (상품목록 페이지의 categoryId) */
  categoryId: number | undefined;
}

/**
 * 상품 목록 페이지 상단의 하위 카테고리 칩 내비게이션
 *
 * 표시 규칙(그룹 = 칩으로 나열할 자식들의 부모):
 * - 선택 카테고리에 자식이 있으면         → 그룹 = 자기 자신 (자식들 노출)
 * - 자식이 없고, 부모가 하위 카테고리면   → 그룹 = 부모 (형제들 노출, 3뎁스 이동 시 형제 유지)
 * - 자식이 없고, 부모가 최상위(1뎁스)면   → 그룹 = 자기 자신 ("전체"만)
 *
 * 캐시된 useCategoryTree를 재사용하므로 추가 요청 없음
 */
export function CategorySubNav({ categoryId }: CategorySubNavProps) {
  const { data: categoryTree } = useCategoryTree();

  if (categoryId == null || !categoryTree) return null;

  const { byId, childrenByParentId } = categoryTree;

  const selected = byId.get(categoryId);
  if (!selected) return null;

  const ownChildren = childrenByParentId.get(categoryId) ?? [];
  const parent =
    selected.parentId != null ? byId.get(selected.parentId) : undefined;

  const group =
    ownChildren.length > 0 ? selected : parent?.parentId != null ? parent : selected;

  const chips =
    group.id != null ? (childrenByParentId.get(group.id) ?? []) : [];

  const chipClass = (active: boolean) =>
    cn(
      "shrink-0 rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors",
      active
        ? "bg-foreground text-background border-foreground font-medium"
        : "border-border text-foreground/80 hover:bg-muted",
    );

  return (
    <nav
      aria-label="하위 카테고리"
      className="mb-5 flex gap-2 overflow-x-auto pb-1"
    >
      <Link
        href={`/products?categoryId=${group.id}`}
        className={chipClass(categoryId === group.id)}
      >
        전체
      </Link>
      {chips.map((category) => (
        <Link
          key={category.id}
          href={`/products?categoryId=${category.id}`}
          className={chipClass(categoryId === category.id)}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
