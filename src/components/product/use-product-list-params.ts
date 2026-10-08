import { useRouter, useSearchParams } from "next/navigation";

import { parsePositiveInt, parsePositiveIntList } from "@/lib/validation";

type ListParamKey = "colors" | "materials";

/**
 * 상품 목록 조회 조건의 단일 소스 - URL 쿼리스트링
 * - 읽기: 형식이 잘못된 값은 무시 (categoryId가 잘못되면 전체 목록)
 * - 쓰기: updateParams로 URL만 갱신 (router.replace) -> 별도 state 동기화 불필요
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

  return {
    categoryId,
    keyword,
    selectedColors,
    selectedMaterials,
    updateParams,
  };
}
