"use client";

import { Heart, Share2, Star, Ticket } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useGetProduct1 } from "@/api/generated/product-v1/product-v1";
import { DeliveryType } from "@/api/model";
import { CategoryTrail } from "@/components/product/category-trail";
import { ProductGallery } from "@/components/product/product-gallery";
import { SkuSelect } from "@/components/product/sku-select";

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

          {/* 할인율 · 할인 전/후 가격 */}
          <div className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-sm line-through">
              {formatPrice(189000)}
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-destructive text-2xl font-extrabold">
              </span>
              <span className="text-foreground text-[28px] font-extrabold">
                {formatPrice(117000)}
              </span>
            </div>
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
          <SkuSelect skus={product?.skus ?? []} />

          {/* 주문 금액 */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              주문금액
            </span>
            <span className="text-foreground text-xl font-extrabold">
              {formatPrice(0)}
            </span>
          </div>

          {/* 장바구니 · 바로구매 */}
          <div className="mt-1 flex gap-2.5">
            <button
              type="button"
              className="border-border hover:bg-muted h-[52px] flex-1 rounded-lg border text-[15px] font-semibold"
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
