import { useRouter, useSearchParams } from "next/navigation";

import {
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
  type ProductSort,
} from "@/components/product/product-toolbar";
import { parsePositiveInt, parsePositiveIntList } from "@/lib/validation";

type ListParamKey =
  "colors" | "materials" | "sort" | "size" | "inStockOnly" | "page";

const DEFAULT_SORT: ProductSort = "createdDate,desc";
const DEFAULT_PAGE_SIZE = 20;

/**
 * 상품 목록 조회 조건의 단일 소스 - URL 쿼리스트링
 * - 읽기: 형식이 잘못된 값은 무시하고 기본값 사용 (categoryId가 잘못되면 전체 목록)
 * - 쓰기: URL만 갱신 (router.replace) -> 별도 state 동기화 불필요
 * - 기본값은 URL에 쓰지 않음 (기본 화면은 /products)
 * - page는 URL에서 1부터, 내부(서버 API·Pagination)는 0부터
 */
export function useProductListParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId =
    parsePositiveInt(searchParams.get("categoryId") ?? "") ?? undefined;

  // 헤더 검색창(search-form)에서 /products?keyword= 로 이동
  const keyword = searchParams.get("keyword")?.trim() || undefined;

  const selectedColors = parsePositiveIntList(searchParams.getAll("colors"));
  const selectedMaterials = parsePositiveIntList(
    searchParams.getAll("materials"),
  );

  const sortParam = searchParams.get("sort");
  const sort =
    SORT_OPTIONS.find((option) => option.value === sortParam)?.value ??
    DEFAULT_SORT;

  const sizeParam = parsePositiveInt(searchParams.get("size") ?? "");
  const size =
    PAGE_SIZE_OPTIONS.find((option) => option.value === sizeParam)?.value ??
    DEFAULT_PAGE_SIZE;

  const inStockOnly = searchParams.get("inStockOnly") === "true";

  const pageParam = parsePositiveInt(searchParams.get("page") ?? "");
  const page = pageParam != null ? pageParam - 1 : 0;

  /** 넘긴 키만 교체 - 값이 비어 있으면 해당 키를 URL에서 제거, 나머지 파라미터는 유지 */
  function updateParams(patch: Partial<Record<ListParamKey, string[]>>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, values] of Object.entries(patch)) {
      params.delete(key);
      values.forEach((value) => params.append(key, value));
    }
    const query = params.toString();
    router.replace(query ? `/products?${query}` : "/products", {
      scroll: false,
    });
  }

  /** 조회 조건이 바뀌면 항상 1페이지부터 (page 제거) - 이 규칙은 여기서만 관리 */
  function updateFilter(patch: Partial<Record<ListParamKey, string[]>>) {
    updateParams({ ...patch, page: [] });
  }

  return {
    categoryId,
    keyword,
    selectedColors,
    selectedMaterials,
    sort,
    size,
    inStockOnly,
    page,
    setColors: (ids: number[]) => updateFilter({ colors: ids.map(String) }),
    setMaterials: (ids: number[]) =>
      updateFilter({ materials: ids.map(String) }),
    setSort: (next: ProductSort) =>
      updateFilter({ sort: next === DEFAULT_SORT ? [] : [next] }),
    setSize: (next: number) =>
      updateFilter({ size: next === DEFAULT_PAGE_SIZE ? [] : [String(next)] }),
    setInStockOnly: (next: boolean) =>
      updateFilter({ inStockOnly: next ? ["true"] : [] }),
    setPage: (next: number) =>
      updateParams({ page: next === 0 ? [] : [String(next + 1)] }),
  };
}
