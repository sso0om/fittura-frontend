"use client";

import type { CartItemResDto } from "@/api/model";
import { deliveryTypeLabel } from "@/lib/enum-labels";
import { formatPrice } from "@/lib/format";
import { CartItemCard } from "@/components/cart/cart-item-card";
import type { CartSection } from "@/components/cart/cart-utils";

export interface CartDeliverySectionProps {
  section: CartSection;
  isItemChecked: (item: CartItemResDto) => boolean;
  onItemsCheckedChange: (items: CartItemResDto[], checked: boolean) => void;
}

/**
 * 배송 타입별 장바구니 섹션 (일반 배송 / 기사 배송 공통)
 * 배송비·문구 계산은 cart-utils(summarizeCart)에서 하고, 이 컴포넌트는 표시만 담당
 */
export function CartDeliverySection({
  section,
  isItemChecked,
  onItemsCheckedChange,
}: CartDeliverySectionProps) {
  const { items, selectableItems, allChecked, amount, deliveryFee, notice } =
    section;
  const title = deliveryTypeLabel[section.deliveryType];

  return (
    <section className="border-border overflow-hidden rounded-xl border">
      <div className="bg-foreground/8 border-border border-l-primary flex items-center justify-between border-b border-l-4 px-5 py-3.5">
        <label className="flex items-center gap-2 text-[15px] font-bold">
          <input
            type="checkbox"
            checked={allChecked}
            disabled={selectableItems.length === 0}
            onChange={(e) => onItemsCheckedChange(items, e.target.checked)}
          />
          {title}
        </label>
        {notice && (
          <span className="text-price text-xs font-medium">{notice}</span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground px-5 py-8 text-center text-sm">
          {title} 상품이 없습니다.
        </p>
      ) : (
        items.map((item) => (
          <CartItemCard
            key={item.cartItemId}
            item={item}
            checked={isItemChecked(item)}
            onCheckedChange={(checked) =>
              onItemsCheckedChange([item], checked)
            }
          />
        ))
      )}

      <div className="flex flex-col gap-1.5 px-5 py-4">
        <div className="flex items-center justify-end gap-2.5">
          <span className="text-muted-foreground text-sm">배송비</span>
          <span className="text-sm font-semibold">
            {deliveryFee == null ? "-" : formatPrice(deliveryFee)}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2.5">
          <span className="text-muted-foreground text-sm">
            {title} 예상 주문 금액
          </span>
          <span className="text-base font-extrabold">
            {formatPrice(amount.itemTotalAmount + (deliveryFee ?? 0))}
          </span>
        </div>
      </div>
    </section>
  );
}
