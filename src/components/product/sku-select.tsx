"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/format";
import {
  canAddToCart,
  getUnavailableSaleStatus,
  unavailableSaleStatusLabel,
} from "@/lib/sale-status";
import type { ProductStatus, SkuResDto } from "@/api/model";

export interface SkuSelectProps {
  skus: SkuResDto[];
  /** 상품 단위 상태 - 상품이 판매 불가면 모든 SKU 선택 불가 */
  productStatus?: ProductStatus;
  onSelect: (sku: SkuResDto) => void;
}

/** color/material 라벨 */
export function getSkuVariantLabel(
  sku: Pick<SkuResDto, "color" | "material">,
): string {
  return [sku.color, sku.material].filter(Boolean).join(" / ");
}

/** 색상 / 마감 (가격) [판매 불가 상태] 라벨 */
function getSkuLabel(sku: SkuResDto, productStatus?: ProductStatus): string {
  const variant = getSkuVariantLabel(sku);
  // 드롭다운은 비교용이라 할인 후 가격만 표시 (정가·할인율은 선택 목록에서)
  const price = sku.salePrice != null ? formatPrice(sku.salePrice) : "";
  const label = variant && price ? `${variant} (${price})` : variant || price;

  const status = getSkuSaleStatus(sku, productStatus);
  return status ? `${label} - ${unavailableSaleStatusLabel[status]}` : label;
}

function getSkuSaleStatus(sku: SkuResDto, productStatus?: ProductStatus) {
  return getUnavailableSaleStatus({
    productStatus,
    skuStatus: sku.status,
    isSoldOut: sku.isSoldOut,
  });
}

/**
 * 선택하면 onSelect로 부모에 알리고 곧바로 placeholder로 리셋함 
 * 선택 결과가 SelectedSkuList에 쌓이는 구조
 * 셀렉트는 "추가용 입력"으로만 사용
 */
export function SkuSelect({ skus, productStatus, onSelect }: SkuSelectProps) {
  const [value, setValue] = useState<number | null>(null);

  function handleValueChange(nextValue: number | null) {
    if (nextValue == null) return;
    const sku = skus.find((item) => item.id === nextValue);
    if (sku) onSelect(sku);
    setValue(null);
  }

  return (
    <Select
      items={skus.map((sku) => ({
        value: sku.id,
        label: getSkuLabel(sku, productStatus),
      }))}
      value={value}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="옵션 선택" />
      </SelectTrigger>
      <SelectContent>
        {skus.map((sku) => (
          <SelectItem
            key={sku.id}
            value={sku.id}
            // 일시품절은 장바구니 담기가 가능하므로 선택 허용
            disabled={!canAddToCart(getSkuSaleStatus(sku, productStatus))}
            className="data-disabled:bg-muted"
          >
            {getSkuLabel(sku, productStatus)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
