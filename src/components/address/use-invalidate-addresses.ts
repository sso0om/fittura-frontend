import { useQueryClient } from "@tanstack/react-query";

import { getGetMemberAddressesQueryKey } from "@/api/generated/auth-v1/auth-v1";

/** 배송지 API 쿼리 키 공통 접두사 (/api/v1/memberAddress) */
const ADDRESS_KEY_PREFIX = getGetMemberAddressesQueryKey()[0];

/**
 * 배송지 등록/수정/기본 변경 후 배송지 관련 쿼리 전체 재조회
 * - 목록, 기본 배송지, 단건 조회 모두 포함
 *   (기본 변경 시 이전 기본 배송지 단건 캐시의 defaultAddress도 바뀌기 때문)
 * - 장바구니 등 배송지를 보여주는 화면도 같은 캐시를 쓰므로 함께 갱신됨
 */
export function useInvalidateAddresses() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0];
        return typeof key === "string" && key.startsWith(ADDRESS_KEY_PREFIX);
      },
    });
}
