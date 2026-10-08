import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getOrderPreviewCart,
  getOrderPreviewDirect,
} from "@/api/generated/order-v1/order-v1";
import type { OrderPreviewResDto } from "@/api/model";
import type { OrderSource } from "@/components/order/order-source";

/**
 * 주문 전 미리보기 (금액·배송비 계산은 서버 단일 로직)
 * - 미리보기는 POST라 orval이 mutation 훅으로 생성 -> 일반 함수를 useQuery에 연결
 * - queryKey에 배송지를 포함해 배송지 변경 시 자동 재조회
 * - 주문서는 진입할 때마다 새로 계산: 캐시 보관 안 함, 실패 재시도 안 함(에러는 axios 인터셉터가 노출)
 * - 배송지 변경 재조회 중에는 이전 결과를 유지해 화면이 비지 않게 함 (isPlaceholderData로 갱신 중 판별)
 */
export function useOrderPreview(
  source: OrderSource | null,
  addressId: number | undefined,
  enabled: boolean,
) {
  return useQuery<OrderPreviewResDto | undefined>({
    queryKey: ["order-preview", source, addressId ?? null],
    queryFn: async () => {
      if (source === null) return undefined;

      const res =
        source.type === "cart"
          ? await getOrderPreviewCart({
              cartItemIds: source.cartItemIds,
              addressId,
            })
          : await getOrderPreviewDirect({
              orderSkus: source.orderSkus,
              addressId,
            });
      return res.data;
    },
    enabled: enabled && source !== null,
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}
