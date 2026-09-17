"use client";

import { useState } from "react";
import { Heart, Share2, Star, Ticket } from "lucide-react";
import { toast } from "sonner";

import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useGetProduct1 } from "@/api/generated/product-v1/product-v1";
import { useCreateCartItems } from "@/api/generated/cart-v1/cart-v1";
import { DeliveryType, type SkuResDto } from "@/api/model";
import { CategoryTrail } from "@/components/product/category-trail";
import { ProductGallery } from "@/components/product/product-gallery";
import { SkuSelect } from "@/components/product/sku-select";
import {
  SelectedSkuList,
  type SelectedSkuItem,
} from "@/components/product/selected-sku-list";

const DELIVERY_TYPE_LABEL: Record<DeliveryType, string> = {
  [DeliveryType.PARCEL]: "일반 배송",
  [DeliveryType.INSTALLATION]: "기사 배송",
};

export interface ProductPageClientProps {
  productId: number;
}

export function ProductPageClient({ productId }: ProductPageClientProps) {
  const { data: productRes } = useGetProduct1(productId);
  const product = productRes?.data;

  const deliveryTypeLabel = product?.deliveryType
    ? DELIVERY_TYPE_LABEL[product.deliveryType]
    : undefined;

  const [items, setItems] = useState<SelectedSkuItem[]>([]);
  const { mutate: createCartItems, isPending: isAddingToCart } =
    useCreateCartItems();

  function handleSelectSku(sku: SkuResDto) {
    if (sku.id == null) return;

    const alreadySelected = items.some((item) => item.sku.id === sku.id);
    if (alreadySelected) {
      toast("이미 선택된 옵션입니다.");
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
        onSuccess: () => {
          toast("장바구니에 담았습니다.");
          setItems([]);
        },
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

  const orderTotal = items.reduce(
    (sum, item) => sum + (item.sku.price ?? 0) * item.quantity,
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

          {/* 판매가 - 할인가: 추후 기능 추가 예정*/}
          <div className="flex items-baseline gap-2.5">
            <span className="text-foreground text-[28px] font-extrabold">
              {formatPrice(product?.basePrice ?? 0)}
            </span>
          </div>

          {/* 쿠폰 받기: 추후 기능 추가 예정*/}
          <Button type="button" variant="outline" size="sm" className="w-fit">
            <Ticket className="size-3.5" />
            쿠폰 받기
          </Button>

          <hr className="border-border" />

          {/* 배송 정보 — deliveryType 한글 라벨 + deliveryFee */}
          <div className="flex gap-4 text-[13px]">
            <span className="text-muted-foreground w-10 shrink-0">배송</span>
            <div className="flex items-center gap-1.5">
              <span>{deliveryTypeLabel}</span>
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
            <SkuSelect skus={product?.skus ?? []} onSelect={handleSelectSku} />
          </div>

          {/* 선택한 SKU 목록 */}
          <SelectedSkuList
            items={items}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
          />

          {/* 주문 금액 — 선택 목록의 (단가 × 수량) 합계 */}
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
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-[52px] flex-1 rounded-lg text-[15px] font-bold"
            >
              바로구매
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
