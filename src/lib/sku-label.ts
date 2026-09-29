import type { ProductStatus, SkuResDto } from "@/api/model";
import { formatPrice } from "@/lib/format";
import {
  getSkuSaleStatus,
  unavailableSaleStatusLabel,
} from "@/lib/sale-status";

/** color/material 라벨 */
export function getSkuVariantLabel(
  sku: Pick<SkuResDto, "color" | "material">,
): string {
  return [sku.color, sku.material].filter(Boolean).join(" / ");
}

/** 색상 / 마감 (가격) [판매 불가 상태] 라벨 */
export function getSkuLabel(
  sku: SkuResDto,
  productStatus?: ProductStatus,
): string {
  const variant = getSkuVariantLabel(sku);
  // 드롭다운은 비교용이라 할인 후 가격만 표시 (정가·할인율은 선택 목록에서)
  const price = sku.salePrice != null ? formatPrice(sku.salePrice) : "";
  const label = variant && price ? `${variant} (${price})` : variant || price;

  const status = getSkuSaleStatus(sku, productStatus);
  return status ? `${label} - ${unavailableSaleStatusLabel[status]}` : label;
}
