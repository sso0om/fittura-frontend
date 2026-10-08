import Image from "next/image";
import Link from "next/link";
import { Armchair } from "lucide-react";

import type {
  DeliveryGroupResDto,
  OrderPreviewItemResDto,
} from "@/api/model";
import { deliveryTypeLabel } from "@/lib/enum-labels";
import { formatPrice } from "@/lib/format";
import { getSkuVariantLabel } from "@/lib/sku-label";

export interface OrderItemsSectionProps {
  deliveryGroups: DeliveryGroupResDto[];
}

/** 주문상품 - 배송 타입별 그룹, 읽기 전용 */
export function OrderItemsSection({ deliveryGroups }: OrderItemsSectionProps) {
  const itemCount = deliveryGroups.reduce(
    (sum, group) => sum + (group.items?.length ?? 0),
    0,
  );

  return (
    <section className="border-foreground border-t-2 py-6">
      <h2 className="mb-5 text-xl font-extrabold">주문상품 : {itemCount}개</h2>

      <div className="flex flex-col gap-6">
        {deliveryGroups.map((group) => (
          <div
            key={group.deliveryType}
            className="border-border overflow-hidden rounded-xl border"
          >
            <div className="bg-muted/40 border-border flex items-center justify-between border-b px-5 py-3.5">
              <span className="text-[15px] font-bold">
                {group.deliveryType ? deliveryTypeLabel[group.deliveryType] : ""}
              </span>
              <span className="text-muted-foreground text-sm">
                배송비 {formatPrice(group.deliveryFee ?? 0)}
              </span>
            </div>

            {group.items?.map((item) => (
              <OrderItemRow key={item.skuId} item={item} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function OrderItemRow({ item }: { item: OrderPreviewItemResDto }) {
  const {
    productId,
    productName,
    mainImageUrl,
    originalPrice,
    salePrice,
    discountRate,
    quantity,
    itemTotalAmount,
  } = item;

  const hasDiscount =
    originalPrice != null && salePrice != null && originalPrice !== salePrice;
  const variantLabel = getSkuVariantLabel(item);
  const productNameText = productName ?? "상품명 없음";

  return (
    <div className="border-border flex gap-4 border-b px-5 py-5 last:border-b-0">
      <div className="bg-muted relative size-[80px] shrink-0 overflow-hidden rounded-lg">
        {mainImageUrl ? (
          <Image
            src={mainImageUrl}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Armchair
              className="text-muted-foreground/40 size-8"
              strokeWidth={1.5}
            />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {productId != null ? (
          <Link
            href={`/products/${productId}`}
            className="text-[15px] font-semibold hover:underline"
          >
            {productNameText}
          </Link>
        ) : (
          <span className="text-[15px] font-semibold">{productNameText}</span>
        )}
        {variantLabel && (
          <p className="text-muted-foreground mt-1 text-[13px]">
            {variantLabel}
          </p>
        )}
      </div>

      <div className="border-border flex w-[160px] shrink-0 flex-col gap-1 border-l pl-6">
        <span className="text-lg font-extrabold">
          {formatPrice(itemTotalAmount ?? 0)}
        </span>
        {hasDiscount && (
          <div className="flex items-baseline gap-1.5">
            <span className="text-muted-foreground text-xs line-through">
              {formatPrice(originalPrice)}
            </span>
            {discountRate != null && (
              <span className="text-destructive text-xs font-bold">
                {discountRate}%
              </span>
            )}
          </div>
        )}
        <span className="text-muted-foreground text-xs">수량 {quantity}개</span>
      </div>
    </div>
  );
}
