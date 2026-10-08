"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  getGetCartQueryKey,
  useGetCart,
  useUpdateCartItem,
  useUpdateCartItemSku,
} from "@/api/generated/cart-v1/cart-v1";
import { useGetProductSkus } from "@/api/generated/product-v1/product-v1";
import type { CartItemResDto, SkuResDto } from "@/api/model";
import { formatPrice } from "@/lib/format";
import { canAddToCart, getSkuSaleStatus } from "@/lib/sale-status";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NoticeDialog } from "@/components/ui/notice-dialog";
import { NumberFieldStepper } from "@/components/ui/number-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSkuLabel } from "@/lib/sku-label";

const MIN_QUANTITY = 1;
const DUPLICATED_MESSAGE = "이미 장바구니에 담긴 옵션입니다.";

export interface OptionChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: CartItemResDto;
}

/**
 * 장바구니 아이템의 옵션(SKU) 변경 팝업
 * 상품 상세의 옵션 드롭다운과 같은 규칙, 하나만 선택할 수 있다는 점만 다름
 */
export function OptionChangeDialog({
  open,
  onOpenChange,
  item,
}: OptionChangeDialogProps) {
  const { cartItemId, productId, productStatus, skuId } = item;

  const { data } = useGetProductSkus(productId ?? 0, {
    query: { enabled: open && productId != null },
  });
  const skus = data?.data ?? [];

  // 장바구니 화면에서 이미 조회한 캐시를 같이 씀 - 중복 선택 방지용 skuId 목록
  const { data: cartSkuIds = [] } = useGetCart({
    query: {
      select: (res) =>
        (res.data?.items ?? [])
          .map((cartItem) => cartItem.skuId)
          .filter((id): id is number => id != null),
    },
  });

  const [selectedSkuId, setSelectedSkuId] = useState<number | null>(
    skuId ?? null,
  );
  const [quantity, setQuantity] = useState(item.quantity ?? MIN_QUANTITY);
  const [notice, setNotice] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const mutationOptions = {
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        onOpenChange(false);
      },
    },
  };
  const { mutate: updateCartItemSku, isPending: isSkuUpdating } =
    useUpdateCartItemSku(mutationOptions);
  const { mutate: updateCartItem, isPending: isQuantityUpdating } =
    useUpdateCartItem(mutationOptions);
  const isPending = isSkuUpdating || isQuantityUpdating;

  /** 이미 장바구니에 있는 SKU (지금 변경하려는 아이템 자신은 제외) */
  function isInCart(sku: SkuResDto): boolean {
    return sku.id != null && sku.id !== skuId && cartSkuIds.includes(sku.id);
  }

  /** 판매 상태 기준 선택 가능 여부 - 장바구니 중복은 선택 시 안내 팝업으로 알림 */
  function isSelectable(sku: SkuResDto): boolean {
    return canAddToCart(getSkuSaleStatus(sku, productStatus));
  }

  function handleValueChange(value: number | null) {
    if (value == null) return;
    const sku = skus.find((item) => item.id === value);
    if (sku && isInCart(sku)) {
      setNotice(DUPLICATED_MESSAGE);
      return;
    }
    setSelectedSkuId(value);
  }

  const selectedSku = skus.find((sku) => sku.id === selectedSkuId);
  const totalPrice = (selectedSku?.salePrice ?? 0) * quantity;

  const isSkuChanged = selectedSkuId !== skuId;
  const isChanged = isSkuChanged || quantity !== item.quantity;
  const canSubmit =
    selectedSku != null && isSelectable(selectedSku) && isChanged && !isPending;

  function handleSubmit() {
    if (cartItemId == null || selectedSkuId == null || !canSubmit) return;

    // 같은 SKU면 수량 API로 보냄 - SKU 변경 API에는 자기 자신을 보내지 않음
    if (!isSkuChanged) {
      updateCartItem({ itemId: cartItemId, data: { quantity } });
      return;
    }

    updateCartItemSku({
      itemId: cartItemId,
      data: { skuId: selectedSkuId, quantity },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>옵션 변경</AlertDialogTitle>
        </AlertDialogHeader>

        <Select
          items={skus.map((sku) => ({
            value: sku.id,
            label: getSkuLabel(sku, productStatus),
          }))}
          value={selectedSkuId}
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
                disabled={!isSelectable(sku)}
                className="data-disabled:bg-muted"
              >
                {getSkuLabel(sku, productStatus)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="bg-muted/40 flex items-center justify-between rounded-lg px-3.5 py-3">
          <NumberFieldStepper
            aria-label="수량"
            value={quantity}
            min={MIN_QUANTITY}
            onValueCommit={setQuantity}
          />
          <span className="text-base font-extrabold">
            {formatPrice(totalPrice)}
          </span>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            변경하기
          </Button>
        </AlertDialogFooter>

        {/* 옵션 변경 팝업 안에 두어 중첩 다이얼로그로 위에 뜨게 함 */}
        <NoticeDialog message={notice} onClose={() => setNotice(null)} />
      </AlertDialogContent>
    </AlertDialog>
  );
}
