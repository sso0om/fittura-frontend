import { ProductStatus, SkuStatus } from "@/api/model";

/** 판매 불가 상태 */
export type UnavailableSaleStatus =
  | typeof SkuStatus.PAUSED
  | typeof SkuStatus.DISCONTINUED;

/** 상품/SKU 상태로 판매 불가 상태 판단 (null = 판매 가능) */
export function getUnavailableSaleStatus(
  productStatus?: ProductStatus,
  skuStatus?: SkuStatus,
): UnavailableSaleStatus | null {
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

  return null;
}
