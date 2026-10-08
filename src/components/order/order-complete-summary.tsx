import Link from "next/link";

import type { OrderWithAllResDto } from "@/api/model";
import { ProductThumbnail } from "@/components/product/product-thumbnail";
import { formatPhoneNumber, formatPrice } from "@/lib/format";

export interface OrderCompleteSummaryProps {
  order: OrderWithAllResDto;
}

/** 주문 완료 요약 - 주문상품 · 배송지 · 결제금액 (서버 응답 그대로 표시) */
export function OrderCompleteSummary({ order }: OrderCompleteSummaryProps) {
  const { address, items = [] } = order;
  const discountAmount = order.discountAmount ?? 0;

  return (
    <div className="flex flex-col">
      <section className="border-foreground border-t-2 py-6">
        <h2 className="mb-4 text-lg font-extrabold">
          주문상품 : {items.length}개
        </h2>
        <ul className="flex flex-col">
          {items.map((item) => (
            <li
              key={item.id}
              className="border-border flex items-start gap-4 border-b py-4 text-sm last:border-b-0"
            >
              <ProductThumbnail
                src={item.mainImageUrl}
                sizes="64px"
                className="size-[64px] shrink-0 rounded-lg"
                iconClassName="size-7"
              />

              <div className="min-w-0 flex-1">
                {item.productId != null ? (
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-semibold hover:underline"
                  >
                    {item.productName}
                  </Link>
                ) : (
                  <span className="font-semibold">{item.productName}</span>
                )}
                {item.skuIdentifier && (
                  <p className="text-muted-foreground mt-1 text-[13px]">
                    {item.skuIdentifier}
                  </p>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  수량 {item.quantity}개
                </p>
              </div>

              <span className="shrink-0 font-bold">
                {formatPrice(item.itemTotalAmount ?? 0)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {address && (
        <section className="border-foreground border-t-2 py-6">
          <h2 className="mb-4 text-lg font-extrabold">배송지 정보</h2>
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="font-semibold">
              {address.receiverName}
              {address.phoneNumber
                ? ` | ${formatPhoneNumber(address.phoneNumber)}`
                : ""}
            </span>
            <span className="text-muted-foreground">
              [{address.zipCode}] {address.address}
              {address.addressDetail ? ` ${address.addressDetail}` : ""}
            </span>
            {address.deliveryMemo && (
              <span className="text-muted-foreground">
                요청사항: {address.deliveryMemo}
              </span>
            )}
          </div>
        </section>
      )}

      <section className="border-foreground border-t-2 py-6">
        <h2 className="mb-4 text-lg font-extrabold">결제 금액</h2>
        <div className="flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">상품금액</span>
            <span>{formatPrice(order.totalAmount ?? 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">배송비</span>
            <span>+ {formatPrice(order.deliveryFee ?? 0)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">쿠폰·프로모션 할인</span>
              <span>- {formatPrice(discountAmount)}</span>
            </div>
          )}
        </div>
        <hr className="border-border my-4" />
        <div className="flex items-center justify-between">
          <span className="text-price text-[15px] font-bold">총 결제금액</span>
          <span className="text-price text-2xl font-extrabold">
            {formatPrice(order.finalAmount ?? 0)}
          </span>
        </div>
      </section>
    </div>
  );
}
