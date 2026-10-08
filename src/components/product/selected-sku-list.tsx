"use client";

import { X } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { NumberFieldStepper } from "@/components/ui/number-field";
import type { SkuResDto } from "@/api/model";
import { getSkuVariantLabel } from "@/lib/sku-label";
import { SOLD_OUT, unavailableSaleStatusLabel } from "@/lib/sale-status";
import { MIN_QUANTITY } from "@/lib/validation";

export interface SelectedSkuItem {
  /** sku.id를 선택 시점에 확정해 둔 값 - 이후 null 검사 없이 사용 */
  skuId: number;
  sku: SkuResDto;
  quantity: number;
}

export interface SelectedSkuListProps {
  items: SelectedSkuItem[];
  onQuantityChange: (skuId: number, nextQuantity: number) => void;
  onRemove: (skuId: number) => void;
}

export function SelectedSkuList({
  items,
  onQuantityChange,
  onRemove,
}: SelectedSkuListProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const { skuId } = item;
        const { originalPrice, salePrice, discountRate } = item.sku;
        const hasDiscount = (discountRate ?? 0) > 0;

        return (
          <div
            key={skuId}
            className="border-border bg-muted/40 flex flex-col gap-2 rounded-lg border px-3.5 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium">
                {getSkuVariantLabel(item.sku)}
                {item.sku.isSoldOut && (
                  <span className="text-destructive ml-1.5 text-xs font-semibold">
                    {unavailableSaleStatusLabel[SOLD_OUT]}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => onRemove(skuId)}
                aria-label="옵션 제거"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <NumberFieldStepper
                aria-label="수량"
                value={item.quantity}
                min={MIN_QUANTITY}
                onValueCommit={(next) => onQuantityChange(skuId, next)}
              />

              <div className="flex items-baseline gap-1.5">
                {hasDiscount && (
                  <>
                    <span className="text-muted-foreground text-xs line-through">
                      {formatPrice((originalPrice ?? 0) * item.quantity)}
                    </span>
                    <span className="text-destructive text-xs font-bold">
                      {discountRate}%
                    </span>
                  </>
                )}
                <span className="text-foreground text-sm font-semibold">
                  {formatPrice((salePrice ?? 0) * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
