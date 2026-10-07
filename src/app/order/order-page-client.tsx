"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { deliveryTypeLabel } from "@/lib/enum-labels";
import { formatPrice } from "@/lib/format";
import { useSelectedAddress } from "@/components/address/use-selected-address";
import { parseOrderSource } from "@/components/order/order-source";
import { useOrderPreview } from "@/components/order/use-order-preview";

export function OrderPageClient() {
  const searchParams = useSearchParams();
  const source = parseOrderSource(searchParams);

  // 배송지: 선택한 배송지 우선, 없으면 기본 배송지 (로딩이 끝난 뒤 미리보기 호출)
  const { address, isPending: isAddressPending } = useSelectedAddress();

  const {
    data: preview,
    isPending,
    isError,
  } = useOrderPreview(source, address?.addressId, !isAddressPending);

  if (source === null) {
    return (
      <div className="mx-auto w-full max-w-[1160px] px-6 py-16 text-center">
        <p className="text-muted-foreground mb-4 text-sm">
          잘못된 접근입니다. 장바구니에서 다시 주문해 주세요.
        </p>
        <Link href="/cart" className="text-sm underline underline-offset-2">
          장바구니로 이동
        </Link>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-[1160px] px-6 py-10">
        <div className="bg-muted h-8 w-32 animate-pulse rounded" />
      </div>
    );
  }

  if (isError || !preview) {
    return (
      <div className="mx-auto w-full max-w-[1160px] px-6 py-16 text-center">
        <p className="text-muted-foreground mb-4 text-sm">
          주문 정보를 불러오지 못했습니다.
        </p>
        <Link href="/cart" className="text-sm underline underline-offset-2">
          장바구니로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1160px] px-6 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">결제하기</h1>

      <p className="text-muted-foreground mb-4 text-sm">
        배송지: {address ? `${address.addressName} ${address.address}` : "없음"}
      </p>

      {preview.deliveryGroups?.map((group) => (
        <section key={group.deliveryType} className="mb-4 text-sm">
          <h2 className="font-bold">
            {group.deliveryType ? deliveryTypeLabel[group.deliveryType] : ""} (
            배송비 {formatPrice(group.deliveryFee ?? 0)})
          </h2>
          <ul>
            {group.items?.map((item) => (
              <li key={item.skuId}>
                {item.productName} × {item.quantity} ={" "}
                {formatPrice(item.itemTotalAmount ?? 0)}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="text-sm">
        주문 금액 {formatPrice(preview.totalOriginalAmount ?? 0)} / 배송비{" "}
        {formatPrice(preview.deliveryFee ?? 0)} / 결제 예정{" "}
        <strong>{formatPrice(preview.finalAmount ?? 0)}</strong>
      </p>
    </div>
  );
}
