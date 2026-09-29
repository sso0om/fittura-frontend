"use client";

import type { CartItemResDto } from "@/api/model";
import { formatPrice } from "@/lib/format";
import { CartItemCard } from "@/components/cart/cart-item-card";

export interface CartDeliverySectionProps {
  title: string;
  /** 헤더 우측 배송 안내 문구 */
  notice: string | null;
  items: CartItemResDto[];
  isItemChecked: (item: CartItemResDto) => boolean;
  onItemCheckedChange: (item: CartItemResDto, checked: boolean) => void;
  /** 섹션 전체 선택 체크 상태 */
  allChecked: boolean;
  /** 선택 가능한 아이템이 없으면 섹션 전체 선택 비활성 */
  hasSelectableItem: boolean;
  onAllCheckedChange: (checked: boolean) => void;
  /** 선택 아이템 기준 배송비 */
  deliveryFee: number | null;
  /** 선택 아이템 기준 상품 금액 합 (배송비 제외) */
  itemTotal: number;
}

/**
 * 배송 타입별 장바구니 섹션 (일반 배송 / 기사 배송 공통)
 * 배송비·문구 계산은 부모(cart-utils)에서 하고, 이 컴포넌트는 표시만 담당
 */
export function CartDeliverySection({
  title,
  notice,
  items,
  isItemChecked,
  onItemCheckedChange,
  allChecked,
  hasSelectableItem,
  onAllCheckedChange,
  deliveryFee,
  itemTotal,
}: CartDeliverySectionProps) {
  return (
    <section className="border-border overflow-hidden rounded-xl border">
      <div className="bg-muted/40 border-border flex items-center justify-between border-b px-5 py-3.5">
        <label className="flex items-center gap-2 text-[15px] font-bold">
          <input
            type="checkbox"
            checked={allChecked}
            disabled={!hasSelectableItem}
            onChange={(e) => onAllCheckedChange(e.target.checked)}
          />
          {title}
        </label>
        {notice && (
          <span className="text-muted-foreground text-xs">{notice}</span>
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
            onCheckedChange={(checked) => onItemCheckedChange(item, checked)}
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
            {formatPrice(itemTotal + (deliveryFee ?? 0))}
          </span>
        </div>
      </div>
    </section>
  );
}
