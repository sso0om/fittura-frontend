"use client";

import Image from "next/image";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Armchair, X } from "lucide-react";

import {
  getGetCartQueryKey,
  useDeleteCartItem,
  useUpdateCartItem,
} from "@/api/generated/cart-v1/cart-v1";
import { SkuStatus, type CartItemResDto } from "@/api/model";
import { formatPrice } from "@/lib/format";
import {
  getUnavailableSaleStatus,
  unavailableSaleStatusLabel,
} from "@/lib/sale-status";
import { Button } from "@/components/ui/button";
import { NumberFieldStepper } from "@/components/ui/number-field";
import { getSkuVariantLabel } from "@/components/product/sku-select";

const MIN_QUANTITY = 1;

export interface CartItemCardProps {
  item: CartItemResDto;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/** 장바구니 상품 카드 */
export function CartItemCard({
  item,
  checked,
  onCheckedChange,
}: CartItemCardProps) {
  const {
    cartItemId,
    productId,
    productName,
    mainImageUrl,
    originalPrice,
    discountRate,
    salePrice,
    quantity = MIN_QUANTITY,
    itemTotalPrice,
  } = item;

  const queryClient = useQueryClient();
  const invalidateCart = () =>
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });

  const { mutate: updateCartItem, isPending: isUpdating } = useUpdateCartItem({
    mutation: { onSuccess: invalidateCart },
  });
  const { mutate: deleteCartItem, isPending: isDeleting } = useDeleteCartItem({
    mutation: { onSuccess: invalidateCart },
  });

  const unavailableStatus = getUnavailableSaleStatus({
    productStatus: item.productStatus,
    skuStatus: item.skuStatus,
    isSoldOut: item.isSoldOut,
  });
  const isAvailable = unavailableStatus === null;
  const canLinkToProduct =
    productId != null &&
    unavailableStatus !== SkuStatus.PAUSED;
  const hasDiscount =
    originalPrice != null && salePrice != null && originalPrice !== salePrice;
  const variantLabel = getSkuVariantLabel(item);

  function handleQuantityChange(nextQuantity: number) {
    if (cartItemId == null || nextQuantity < MIN_QUANTITY) return;
    updateCartItem({ itemId: cartItemId, data: { quantity: nextQuantity } });
  }

  function handleDelete() {
    if (cartItemId == null) return;
    deleteCartItem({ itemId: cartItemId });
  }

  const productNameText = productName ?? "상품명 없음";

  const thumbnail = mainImageUrl ? (
    <Image src={mainImageUrl} alt="" fill sizes="92px" className="object-cover" />
  ) : (
    <div className="flex size-full items-center justify-center">
      <Armchair className="text-muted-foreground/40 size-9" strokeWidth={1.5} />
    </div>
  );

  return (
    <div className="border-border relative flex gap-3.5 border-b px-5 py-5 last:border-b-0">
      {!isAvailable && (
        <div
          aria-hidden="true"
          className="bg-background/60 pointer-events-none absolute inset-0 z-[1]"
        />
      )}

      <input
        type="checkbox"
        aria-label="상품 선택"
        className="mt-1.5 shrink-0"
        checked={isAvailable && checked}
        disabled={!isAvailable}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />

      {/* 이미지 - 상품명과 같은 조건으로 상품 페이지 이동 */}
      {canLinkToProduct ? (
        <Link
          href={`/products/${productId}`}
          aria-label={`${productNameText} 상세 보기`}
          className="bg-muted relative size-[92px] shrink-0 overflow-hidden rounded-lg"
        >
          {thumbnail}
        </Link>
      ) : (
        <div className="bg-muted relative size-[92px] shrink-0 overflow-hidden rounded-lg">
          {thumbnail}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* 상품명 + 상태 / 삭제 */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {canLinkToProduct ? (
                <Link
                  href={`/products/${productId}`}
                  className="relative z-[2] truncate text-[15px] font-semibold hover:underline"
                >
                  {productNameText}
                </Link>
              ) : (
                <span className="truncate text-[15px] font-semibold">
                  {productNameText}
                </span>
              )}
              {unavailableStatus && (
                <span className="text-destructive relative z-[2] shrink-0 text-xs font-semibold">
                  {unavailableSaleStatusLabel[unavailableStatus]}
                </span>
              )}
            </div>
            {variantLabel && (
              <p className="text-muted-foreground mt-1 text-[13px]">
                {variantLabel}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="상품 삭제"
            className="text-muted-foreground hover:text-foreground relative z-[2] shrink-0 disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* 가격 / 수량 */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col gap-[3px]">
            {hasDiscount && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-muted-foreground text-xs line-through">
                  {formatPrice(originalPrice)}
                </span>
                {discountRate != null && (
                  <span className="text-destructive text-sm font-bold">
                    {discountRate}%
                  </span>
                )}
              </div>
            )}
            <span className="text-foreground text-base font-bold">
              {formatPrice(salePrice ?? 0)}
            </span>
          </div>

          <NumberFieldStepper
            aria-label="수량"
            value={quantity}
            min={MIN_QUANTITY}
            disabled={!isAvailable || isUpdating}
            onValueCommit={handleQuantityChange}
          />
        </div>

        {/* 옵션 선택 / 최종 금액 */}
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            disabled={!isAvailable}
          >
            옵션 선택
          </Button>
          <span className="text-base font-extrabold">
            {formatPrice(itemTotalPrice ?? 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
