import {
  DeliveryType,
  type CartItemResDto,
  type DeliveryPolicyResDto,
} from "@/api/model";
import { formatPrice } from "@/lib/format";
import { getUnavailableSaleStatus } from "@/lib/sale-status";

export function isCartItemSelectable(item: CartItemResDto): boolean {
  return (
    item.cartItemId != null &&
    getUnavailableSaleStatus({
      productStatus: item.productStatus,
      skuStatus: item.skuStatus,
      isSoldOut: item.isSoldOut,
    }) === null
  );
}

export interface CartItemsAmount {
  /** 할인 전 금액 합 (originalPrice × quantity) */
  originalTotal: number;
  /** 상품 할인 합 */
  discountTotal: number;
  /** 할인 후 상품 금액 합 (itemTotalAmount) - 배송비 제외 */
  itemTotal: number;
}

export function sumCartItems(items: CartItemResDto[]): CartItemsAmount {
  let originalTotal = 0;
  let itemTotal = 0;

  for (const item of items) {
    originalTotal += (item.originalPrice ?? 0) * (item.quantity ?? 0);
    itemTotal += item.itemTotalAmount ?? 0;
  }

  return {
    originalTotal,
    discountTotal: originalTotal - itemTotal,
    itemTotal,
  };
}

/**
 * 배송 타입별 배송비 (선택된 아이템 기준)
 * - PARCEL: 선택 상품 금액(배송비 제외)이 무료배송 기준 미만이면 baseFee, 이상이면 0
 * - INSTALLATION: 아이템별 deliveryFee의 합
 * 정책이 아직 없으면 null (금액 미확정)
 */
export function calcDeliveryFee(
  deliveryType: DeliveryType,
  selectedItems: CartItemResDto[],
  itemTotal: number,
  policy: DeliveryPolicyResDto | undefined,
): number | null {
  if (selectedItems.length === 0) return 0;

  switch (deliveryType) {
    case DeliveryType.PARCEL: {
      if (policy?.baseFee == null || policy.freeShippingThreshold == null) {
        return null;
      }
      return itemTotal >= policy.freeShippingThreshold ? 0 : policy.baseFee;
    }
    case DeliveryType.INSTALLATION:
      return selectedItems.reduce(
        (sum, item) => sum + (item.deliveryFee ?? 0),
        0,
      );
  }
}

/** 섹션 헤더 우측 배송 안내 문구 */
export function getDeliveryNotice(
  deliveryType: DeliveryType,
  itemTotal: number,
  policy: DeliveryPolicyResDto | undefined,
): string | null {
  switch (deliveryType) {
    case DeliveryType.PARCEL: {
      const threshold = policy?.freeShippingThreshold;
      if (threshold == null) return null;
      if (itemTotal === 0) return `${formatPrice(threshold)} 이상 구매 시 무료배송`;
      if (itemTotal < threshold) {
        return `${formatPrice(threshold - itemTotal)} 추가하면 무료배송`;
      }
      return "무료배송";
    }
    case DeliveryType.INSTALLATION: {
      const baseFee = policy?.baseFee;
      if (baseFee == null) return null;
      return `개당 배송비 ${formatPrice(baseFee)}`;
    }
  }
}

/**
 * 장바구니 선택 해제 상태 보관 (sessionStorage)
 * - 새로고침/페이지 이동 후 돌아와도 유지, 탭(브라우저 세션)을 닫으면 초기화
 * - 저장소 접근이 막힌 환경(시크릿 모드 등)에서는 저장 없이 기본값(전체 선택)으로 동작
 */
const CART_UNCHECKED_IDS_KEY = "cart:uncheckedIds";

export function loadCartUncheckedIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(CART_UNCHECKED_IDS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((id): id is number => typeof id === "number")
        : [],
    );
  } catch {
    return new Set();
  }
}

export function saveCartUncheckedIds(ids: Set<number>): void {
  try {
    window.sessionStorage.setItem(
      CART_UNCHECKED_IDS_KEY,
      JSON.stringify([...ids]),
    );
  } catch {
    // 저장 실패 시 무시 - 선택 상태만 유지되지 않을 뿐 기능에는 영향 없음
  }
}
