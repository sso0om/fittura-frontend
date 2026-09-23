"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Share2, Star, Ticket } from "lucide-react";

import { deliveryTypeLabel } from "@/lib/enum-labels";
import { formatPrice } from "@/lib/format";
import {
  getUnavailableSaleStatus,
  unavailableSaleStatusLabel,
} from "@/lib/sale-status";
import { Button } from "@/components/ui/button";
import { useGetProduct1 } from "@/api/generated/product-v1/product-v1";
import { useCreateCartItems } from "@/api/generated/cart-v1/cart-v1";
import type { SkuResDto } from "@/api/model";
import { CategoryTrail } from "@/components/product/category-trail";
import { ProductGallery } from "@/components/product/product-gallery";
import { SkuSelect } from "@/components/product/sku-select";
import {
  SelectedSkuList,
  type SelectedSkuItem,
} from "@/components/product/selected-sku-list";
import { getSkuVariantLabel } from "@/components/product/sku-select";
import { NoticeDialog } from "@/components/ui/notice-dialog";
import { CartAddedDialog } from "@/components/product/cart-added-dialog";
import {
  UnavailableOptionsDialog,
  type UnavailableOption,
} from "@/components/product/unavailable-options-dialog";

export interface ProductPageClientProps {
  productId: number;
}

export function ProductPageClient({ productId }: ProductPageClientProps) {
  const { data: productRes } = useGetProduct1(productId);
  const product = productRes?.data;

  const deliveryLabel = product?.deliveryType
    ? deliveryTypeLabel[product.deliveryType]
    : undefined;

  const hasDiscount = (product?.discountRate ?? 0) > 0;

  const [items, setItems] = useState<SelectedSkuItem[]>([]);
  const router = useRouter();
  const [isCartAddedDialogOpen, setIsCartAddedDialogOpen] = useState(false);
  /** 사용자 안내 문구 (null이면 닫힘) */
  const [notice, setNotice] = useState<string | null>(null);
  /** 바로구매 시 구매 불가 옵션 안내 목록 (비어 있으면 팝업 닫힘) */
  const [unavailableOptions, setUnavailableOptions] = useState<
    UnavailableOption[]
  >([]);
  const { mutate: createCartItems, isPending: isAddingToCart } =
    useCreateCartItems();

  function handleSelectSku(sku: SkuResDto) {
    if (sku.id == null) return;

    const alreadySelected = items.some((item) => item.sku.id === sku.id);
    if (alreadySelected) {
      setNotice("이미 선택된 옵션입니다.");
      return;
    }

    setItems((prev) => [...prev, { sku, quantity: 1 }]);
  }

  function handleAddToCart() {
    if (items.length === 0) return;

    createCartItems(
      {
        data: items.map((item) => ({
          skuId: item.sku.id!,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: () => setIsCartAddedDialogOpen(true),
      },
    );
  }

  function handleQuantityChange(skuId: number, nextQuantity: number) {
    setItems((prev) => {
      if (nextQuantity <= 0) {
        return prev.filter((item) => item.sku.id !== skuId);
      }
      return prev.map((item) =>
        item.sku.id === skuId ? { ...item, quantity: nextQuantity } : item,
      );
    });
  }

  function handleRemove(skuId: number) {
    setItems((prev) => prev.filter((item) => item.sku.id !== skuId));
  }

  /**
   * 바로구매 - 선택한 SKU 중 구매 불가(일시품절 등)가 있으면 팝업으로 안내
   * 일시품절은 장바구니 담기만 가능하고 바로구매는 불가
   */
  function handleBuyNow() {
    if (items.length === 0) return;

    const blocked = items.flatMap((item) => {
      const status = getUnavailableSaleStatus({
        productStatus: product?.status,
        skuStatus: item.sku.status,
        isSoldOut: item.sku.isSoldOut,
      });
      if (status === null || item.sku.id == null) return [];
      return [
        {
          skuId: item.sku.id,
          label: `${getSkuVariantLabel(item.sku) || "옵션"} - ${unavailableSaleStatusLabel[status]}`,
        },
      ];
    });

    if (blocked.length > 0) {
      setUnavailableOptions(blocked);
      return;
    }

    // TODO: 주문 기능 연동
  }

  const orderTotal = items.reduce(
    (sum, item) => sum + (item.sku.salePrice ?? 0) * item.quantity,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-8 lg:px-12">
      <CategoryTrail categoryId={product?.categoryId} />

      <div className="flex gap-12">
        <ProductGallery />

        {/* 상품 정보 */}
        <div className="flex w-full max-w-[560px] flex-col gap-5">
          {/* 상품명 · 좋아요 · 공유 */}
          <div className="flex items-start gap-2">
            <h1 className="flex-1 text-xl leading-snug font-bold">
              오크 프레임 좌식 접이식 거실테이블
            </h1>
            {/* 좋아요 · 공유: 추후 기능 추가 예정 */}
            <Button type="button" variant="ghost" size="icon" aria-label="좋아요">
              <Heart className="size-5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" aria-label="공유">
              <Share2 className="size-5" />
            </Button>
          </div>

          {/* 별점 · 리뷰 개수 */}
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <Star className="fill-foreground text-foreground size-[15px]" />
            <span className="text-foreground font-semibold">4.8</span>
            <span>(1,204)</span>
          </div>

          <hr className="border-border" />

          {/* 가격 */}
          <div className="flex flex-col gap-1">
            {hasDiscount && (
              <span className="text-muted-foreground text-sm line-through">
                {formatPrice(product?.basePrice ?? 0)}
              </span>
            )}
            <div className="flex items-baseline gap-2.5">
              {hasDiscount && (
                <span className="text-destructive text-[28px] font-extrabold">
                  {product?.discountRate}%
                </span>
              )}
              <span className="text-foreground text-[28px] font-extrabold">
                {formatPrice(product?.baseSalePrice ?? product?.basePrice ?? 0)}
              </span>
            </div>
          </div>

          {/* 쿠폰 받기: 추후 기능 추가 예정*/}
          <Button type="button" variant="outline" size="sm" className="w-fit">
            <Ticket className="size-3.5" />
            쿠폰 받기
          </Button>

          <hr className="border-border" />

          {/* 배송 정보 */}
          <div className="flex gap-4 text-[13px]">
            <span className="text-muted-foreground w-10 shrink-0">배송</span>
            <div className="flex items-center gap-1.5">
              <span>{deliveryLabel}</span>
              {product?.deliveryFee != null && (
                <span className="text-foreground font-semibold">
                  {formatPrice(product.deliveryFee)}
                </span>
              )}
            </div>
          </div>

          <hr className="border-border" />

          {/* SKU 셀렉트 박스 */}
          <div className="flex flex-col gap-1.5">
            <SkuSelect
              skus={product?.skus ?? []}
              productStatus={product?.status}
              onSelect={handleSelectSku}
            />
          </div>

          {/* 선택한 SKU 목록 */}
          <SelectedSkuList
            items={items}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
          />

          {/* 주문 금액 */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              주문금액
            </span>
            <span className="text-foreground text-xl font-extrabold">
              {formatPrice(orderTotal)}
            </span>
          </div>

          {/* 장바구니 · 바로구매 */}
          <div className="mt-1 flex gap-2.5">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={items.length === 0 || isAddingToCart}
              className="border-border hover:bg-muted disabled:pointer-events-none disabled:opacity-50 h-[52px] flex-1 rounded-lg border text-[15px] font-semibold"
            >
              장바구니
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={items.length === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 h-[52px] flex-1 rounded-lg text-[15px] font-bold"
            >
              바로구매
            </button>
          </div>
        </div>
      </div>

      <NoticeDialog message={notice} onClose={() => setNotice(null)} />

      <CartAddedDialog
        open={isCartAddedDialogOpen}
        onOpenChange={setIsCartAddedDialogOpen}
        onGoToCart={() => router.push("/cart")}
      />

      <UnavailableOptionsDialog
        options={unavailableOptions}
        onClose={() => setUnavailableOptions([])}
      />
    </div>
  );
}
