"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  deleteCartItem,
  getGetCartQueryKey,
  useGetCart,
} from "@/api/generated/cart-v1/cart-v1";
import { useGetDeliveryPolicy } from "@/api/generated/delivery-v1/delivery-v1";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { AddressSummary } from "@/components/address/address-summary";
import { useSelectedAddress } from "@/components/address/use-selected-address";
import { CartDeliverySection } from "@/components/cart/cart-delivery-section";
import { buildOrderUrl } from "@/components/order/order-source";
import { summarizeCart } from "@/components/cart/cart-utils";
import { useCartSelection } from "@/components/cart/use-cart-selection";

export function CartPageClient() {
  // 장바구니: 화면 진입 시마다 조회 (전역 staleTime 무시), 수정/삭제 시 invalidate로 재조회
  const { data, isPending, isError } = useGetCart({ query: { staleTime: 0 } });
  // 배송 정책: 앱 세션 동안 최초 1회만 조회
  const { data: policyRes } = useGetDeliveryPolicy({
    query: { staleTime: Infinity, gcTime: Infinity },
  });

  // 배송지: 선택한 배송지 우선, 없으면 기본 배송지
  const {
    address,
    isPending: isAddressPending,
    selectAddress,
    unselectIfSelected,
  } = useSelectedAddress();

  const items = data?.data?.items ?? [];
  const policies = policyRes?.data ?? [];

  const { uncheckedIds, isItemChecked, setItemsChecked } = useCartSelection();
  const {
    sections,
    selectableItems,
    checkedItems,
    isAllChecked,
    originalAmount,
    productDiscountAmount,
    isDeliveryFeeUnknown,
    deliveryFee,
    expectedFinalAmount,
  } = summarizeCart(items, uncheckedIds, policies);

  const queryClient = useQueryClient();
  const router = useRouter();
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  /** 선택 삭제
   * 일부 실패해도 나머지는 삭제되도록 allSettled 사용 (실패 메시지는 axios 인터셉터가 노출)
   * 완료 후 장바구니 1회 재조회
   */
  async function handleDeleteSelected() {
    if (checkedItems.length === 0 || isDeletingSelected) return;

    setIsDeletingSelected(true);
    try {
      await Promise.allSettled(
        checkedItems.map((item) => deleteCartItem(item.cartItemId)),
      );
    } finally {
      await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      setIsDeletingSelected(false);
    }
  }

  function handleOrder() {
    if (checkedItems.length === 0) return;

    router.push(
      buildOrderUrl({
        type: "cart",
        cartItemIds: checkedItems.map((item) => item.cartItemId),
      }),
    );
  }

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-[1160px] px-6 py-10">
        <div className="bg-muted h-8 w-32 animate-pulse rounded" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-[1160px] px-6 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          장바구니를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1160px] px-6 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">장바구니</h1>

      <AddressSummary
        address={address}
        isAddressPending={isAddressPending}
        onSelectAddress={selectAddress}
        onAddressDeleted={unselectIfSelected}
        className="border-border mb-5 rounded-xl border p-5"
      />

      {items.length === 0 ? (
        <div className="border-border rounded-xl border py-20 text-center">
          <p className="text-muted-foreground text-sm">
            장바구니가 비어 있습니다.
          </p>
        </div>
      ) : (
        <div className="flex gap-5">
          {/* 좌측: 장바구니 아이템 섹션 */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="border-border flex items-center justify-between rounded-xl border p-4">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={isAllChecked}
                  disabled={selectableItems.length === 0}
                  onChange={(e) => setItemsChecked(items, e.target.checked)}
                />
                전체 선택
              </label>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={checkedItems.length === 0 || isDeletingSelected}
                className="text-muted-foreground text-sm underline underline-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                선택 삭제
              </button>
            </div>

            {sections.map((section) => (
              <CartDeliverySection
                key={section.deliveryType}
                section={section}
                isItemChecked={isItemChecked}
                onItemsCheckedChange={setItemsChecked}
              />
            ))}
          </div>

          {/* 우측: 결제 예정금액 */}
          <aside className="border-border sticky top-6 flex h-fit w-[320px] shrink-0 flex-col gap-4 rounded-xl border p-6">
            <h2 className="text-[17px] font-bold">결제 예정금액</h2>

            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">주문 금액</span>
                <span>{formatPrice(originalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">상품 할인</span>
                <span>
                  {productDiscountAmount > 0
                    ? `-${formatPrice(productDiscountAmount)}`
                    : formatPrice(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">배송비</span>
                <span>
                  {isDeliveryFeeUnknown ? "-" : formatPrice(deliveryFee)}
                </span>
              </div>
            </div>

            <hr className="border-border" />

            <div className="flex items-center justify-between">
              <span className="text-price text-[15px] font-bold">
                총 결제예정금액
              </span>
              <span className="text-price text-xl font-extrabold">
                {formatPrice(expectedFinalAmount)}
              </span>
            </div>

            <Button
              type="button"
              size="xl"
              className="w-full"
              onClick={handleOrder}
              disabled={checkedItems.length === 0}
            >
              주문하기
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
