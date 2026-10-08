"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useSelectedAddress } from "@/components/address/use-selected-address";
import { OrderAddressSection } from "@/components/order/order-address-section";
import { OrderItemsSection } from "@/components/order/order-items-section";
import { parseOrderSource } from "@/components/order/order-source";
import { OrderSummary } from "@/components/order/order-summary";
import { useCheckout } from "@/components/order/use-checkout";
import { useOrderPreview } from "@/components/order/use-order-preview";
import { NoticeDialog } from "@/components/ui/notice-dialog";

export function OrderPageClient() {
  const searchParams = useSearchParams();
  const source = parseOrderSource(searchParams);

  // 배송지: 선택한 배송지 우선, 없으면 기본 배송지 (로딩이 끝난 뒤 미리보기 호출)
  const {
    address,
    isPending: isAddressPending,
    selectAddress,
    unselectIfSelected,
  } = useSelectedAddress();

  const [deliveryMemo, setDeliveryMemo] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  const {
    mutate: checkout,
    isPending: isCheckingOut,
    isSuccess: isCheckoutDone,
  } = useCheckout();

  const {
    data: preview,
    isPending,
    isError,
    isPlaceholderData,
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

  const handlePay = () => {
    const addressId = address?.addressId;
    if (addressId == null) {
      setNotice("배송지를 등록해 주세요.");
      return;
    }

    checkout({ source, addressId, deliveryMemo });
  };

  return (
    <div className="mx-auto w-full max-w-[1160px] px-6 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">결제하기</h1>

      <div className="flex gap-10">
        {/* 좌측: 받는 분 정보 · 주문상품 · 결제방법 */}
        <div className="min-w-0 flex-1">
          <OrderAddressSection
            address={address}
            isAddressPending={isAddressPending}
            onSelectAddress={selectAddress}
            onAddressDeleted={unselectIfSelected}
            deliveryMemo={deliveryMemo}
            onDeliveryMemoChange={setDeliveryMemo}
          />

          <OrderItemsSection deliveryGroups={preview.deliveryGroups ?? []} />

          {/* TODO: 토스 결제 연동 시 결제수단 선택 UI */}
          <section className="border-foreground border-t-2 py-6">
            <h2 className="mb-5 text-xl font-extrabold">결제방법</h2>
            <p className="text-muted-foreground text-sm">
              결제수단 선택은 결제 연동 후 제공됩니다.
            </p>
          </section>
        </div>

        {/* 우측: 결제 금액 */}
        <OrderSummary
          preview={preview}
          isRefreshing={isPlaceholderData}
          onPay={handlePay}
          isPaying={isCheckingOut || isCheckoutDone}
        />
      </div>

      <NoticeDialog message={notice} onClose={closeNotice} />
    </div>
  );
}
