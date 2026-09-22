import { ProductStatus, SkuStatus } from "@/api/model";
import { skuStatusLabel } from "@/lib/enum-labels";

/**
 * 일시품절 - 백엔드 SKU 단위 isSoldOut(가용 재고 없음)
 * SkuStatus enum 값이 아니라 재고로 계산되는 값이라 별도 상수로 둠
 */
export const SOLD_OUT = "SOLD_OUT";

/** 판매 불가 상태 */
export type UnavailableSaleStatus =
  | typeof SkuStatus.PAUSED
  | typeof SkuStatus.DISCONTINUED
  | typeof SOLD_OUT;

export const unavailableSaleStatusLabel = {
  [SkuStatus.PAUSED]: skuStatusLabel[SkuStatus.PAUSED],
  [SkuStatus.DISCONTINUED]: skuStatusLabel[SkuStatus.DISCONTINUED],
  [SOLD_OUT]: "일시품절",
} satisfies Record<UnavailableSaleStatus, string>;

export interface SaleStatusSource {
  productStatus?: ProductStatus;
  skuStatus?: SkuStatus;
  /** SKU 단위 일시품절 여부 */
  isSoldOut?: boolean;
}

/**
 * 상품/SKU 상태로 판매 불가 상태 판단 (null = 판매 가능)
 * 우선순위: 판매 중지 > 품절 > 일시품절
 * - 판매 중지는 상품 페이지 이동까지 막으므로 가장 먼저 판단
 * - 품절(단종)은 영구 상태라 일시적인 재고 소진보다 먼저 판단
 */
export function getUnavailableSaleStatus({
  productStatus,
  skuStatus,
  isSoldOut,
}: SaleStatusSource): UnavailableSaleStatus | null {
  if (
    productStatus === ProductStatus.DISABLED ||
    skuStatus === SkuStatus.PAUSED
  ) {
    return SkuStatus.PAUSED;
  }

  if (
    productStatus === ProductStatus.DISCONTINUED ||
    skuStatus === SkuStatus.DISCONTINUED
  ) {
    return SkuStatus.DISCONTINUED;
  }

  if (isSoldOut) {
    return SOLD_OUT;
  }

  return null;
}

/** 장바구니 담기 가능 여부 - 일시품절은 담기 허용 (구매만 불가) */
export function canAddToCart(status: UnavailableSaleStatus | null): boolean {
  return status === null || status === SOLD_OUT;
}
