"use client";

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
}

/**
 * "색상 / 마감 (가격)" 형태로 라벨 구성
 * color·material 중 하나가 없으면 슬래시 없이 단일 값만 표시
 */
function getSkuLabel(sku: SkuResDto): string {
  const variant = [sku.color, sku.material].filter(Boolean).join(" / ");
  const price = sku.price != null ? formatPrice(sku.price) : "";

  if (variant && price) return `${variant} (${price})`;
  return variant || price;
}

export function SkuSelect({ skus }: SkuSelectProps) {
  return (
    <Select
      items={skus.map((sku) => ({ value: sku.id, label: getSkuLabel(sku) }))}
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
