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
import { SkuStatus, type SkuResDto } from "@/api/model";

export interface SkuSelectProps {
  skus: SkuResDto[];
  onSelect: (sku: SkuResDto) => void;
}

/** color/material 라벨 */
export function getSkuVariantLabel(sku: SkuResDto): string {
  return [sku.color, sku.material].filter(Boolean).join(" / ");
}

/** 색상 / 마감 (가격) 라벨 */
function getSkuLabel(sku: SkuResDto): string {
  const variant = getSkuVariantLabel(sku);
  const price = sku.price != null ? formatPrice(sku.price) : "";

  if (variant && price) return `${variant} (${price})`;
  return variant || price;
}

/**
 * 선택하면 onSelect로 부모에 알리고 곧바로 placeholder로 리셋함 
 * 선택 결과가 SelectedSkuList에 쌓이는 구조
 * 셀렉트는 "추가용 입력"으로만 사용
 */
export function SkuSelect({ skus, onSelect }: SkuSelectProps) {
  const [value, setValue] = useState<number | null>(null);

  function handleValueChange(nextValue: number | null) {
    if (nextValue == null) return;
    const sku = skus.find((item) => item.id === nextValue);
    if (sku) onSelect(sku);
    setValue(null);
  }

  return (
    <Select
      items={skus.map((sku) => ({ value: sku.id, label: getSkuLabel(sku) }))}
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
            disabled={sku.status !== SkuStatus.ACTIVE}
          >
            {getSkuLabel(sku)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
