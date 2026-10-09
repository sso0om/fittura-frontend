import type { CategoryResDto } from "@/api/model";
import { useGetActiveCategories } from "@/api/generated/category-v1/category-v1";

export interface CategoryTree {
  /** 뎁스1(최상위) 카테고리 목록 */
  topLevel: CategoryResDto[];
  /** id로 카테고리 하나를 바로 찾기 위한 맵 */
  byId: Map<number, CategoryResDto>;
  /** 부모 ID -> 바로 아래 자식 목록 */
  childrenByParentId: Map<number, CategoryResDto[]>;
}

function sortBySortOrder<T extends { sortOrder?: number }>(nodes: T[]): T[] {
  return [...nodes].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/**
 * 모듈 레벨 함수로 둬서 select 참조를 고정 - 인라인이면 렌더마다 재실행되어 Map을 다시 만듦
 */
function buildCategoryTree(res: { data?: CategoryResDto[] }): CategoryTree {
  const all = res.data ?? [];

  const byId = new Map<number, CategoryResDto>();
  const childrenByParentId = new Map<number, CategoryResDto[]>();
  const topLevel: CategoryResDto[] = [];

  for (const category of all) {
    if (category.id != null) byId.set(category.id, category);

    if (category.parentId == null) {
      topLevel.push(category);
    } else {
      const siblings = childrenByParentId.get(category.parentId) ?? [];
      siblings.push(category);
      childrenByParentId.set(category.parentId, siblings);
    }
  }

  for (const [parentId, children] of childrenByParentId) {
    childrenByParentId.set(parentId, sortBySortOrder(children));
  }

  return {
    topLevel: sortBySortOrder(topLevel),
    byId,
    childrenByParentId,
  };
}

/**
 * 백엔드 응답(`GET /api/v1/categories`): 활성 카테고리 전체를 flat 배열로 반환
 * useCategoryTree(): `parentId` 기준으로 topLevel / byId / childrenByParentId 를 만듦
 */
export function useCategoryTree() {
  return useGetActiveCategories({
    query: {
      select: buildCategoryTree,
      staleTime: 5 * 60 * 1000,
    },
  });
}
