import type { CategoryTreeResDto } from "@/api/model";
import { useGetActiveCategories } from "@/api/generated/category-v1/category-v1";

export interface CategoryTree {
  /** 뎁스1(최상위) 카테고리 목록 */
  topLevel: CategoryTreeResDto[];
  /** id로 카테고리 하나를 바로 찾기 위한 맵 */
  byId: Map<number, CategoryTreeResDto>;
  /** 부모 ID -> 바로 아래 자식 목록. 뎁스에 상관없이 전 구간에 적용된다. */
  childrenByParentId: Map<number, CategoryTreeResDto[]>;
}

/**
 * 백엔드 응답(`GET /api/v1/categories`): 최상위(뎁스1) 카테고리마다 `children` 필드로 하위 카테고리가 중첩된 트리 구조
 * orval이 생성한 `CategoryTreeResDto` 타입엔 이 `children` 필드가 없음
 * (엔드가 재귀 타입이라 springdoc-openapi가 자기 자신을 참조하는 record 필드를 스펙에서 누락시키는 것으로 확인됨)
 * 여기서만 `children`을 포함한 타입을 보강해서 실제 응답 모양대로 재귀적으로 순회
 */
type CategoryNode = CategoryTreeResDto & { children?: CategoryNode[] };

function sortBySortOrder<T extends { sortOrder?: number }>(nodes: T[]): T[] {
  return [...nodes].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function useCategoryTree() {
  return useGetActiveCategories({
    query: {
      select: (res): CategoryTree => {
        const roots = (res.data ?? []) as CategoryNode[];

        const byId = new Map<number, CategoryTreeResDto>();
        const childrenByParentId = new Map<number, CategoryTreeResDto[]>();

        function walk(nodes: CategoryNode[]) {
          for (const node of nodes) {
            if (node.id != null) byId.set(node.id, node);

            const children = node.children ?? [];
            if (node.id != null && children.length > 0) {
              childrenByParentId.set(node.id, sortBySortOrder(children));
            }

            walk(children);
          }
        }

        walk(roots);

        return {
          topLevel: sortBySortOrder(roots),
          byId,
          childrenByParentId,
        };
      },
      staleTime: 5 * 60 * 1000,
    },
  });
}
