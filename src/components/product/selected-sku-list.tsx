"use client";

import { Minus, Plus, X } from "lucide-react";

import { formatPrice } from "@/lib/format";
import type { SkuResDto } from "@/api/model";
import { getSkuVariantLabel } from "@/components/product/sku-select";

export interface SelectedSkuItem {
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
        const skuId = item.sku.id;
        if (skuId == null) return null;

        return (
          <div
            key={skuId}
            className="border-border bg-muted/40 flex flex-col gap-2 rounded-lg border px-3.5 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium">
                {getSkuVariantLabel(item.sku)}
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onQuantityChange(skuId, item.quantity - 1)}
                  aria-label="수량 감소"
                  className="border-border hover:bg-muted flex size-7 items-center justify-center rounded-md border"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-5 text-center text-sm">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onQuantityChange(skuId, item.quantity + 1)}
                  aria-label="수량 증가"
                  className="border-border hover:bg-muted flex size-7 items-center justify-center rounded-md border"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              <span className="text-foreground text-sm font-semibold">
                {formatPrice((item.sku.price ?? 0) * item.quantity)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
