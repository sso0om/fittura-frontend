"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  deleteCartItem,
  getGetCartQueryKey,
  useGetCart,
} from "@/api/generated/cart-v1/cart-v1";
import { useGetDeliveryPolicy } from "@/api/generated/delivery-v1/delivery-v1";
import { DeliveryType, type CartItemResDto } from "@/api/model";
import { deliveryTypeLabel } from "@/lib/enum-labels";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { AddressDialog } from "@/components/address/address-dialog";
import { useSelectedAddress } from "@/components/address/use-selected-address";
import { CartDeliverySection } from "@/components/cart/cart-delivery-section";
import { buildOrderUrl } from "@/components/order/order-source";
import {
  calcDeliveryFee,
  getDeliveryNotice,
  isCartItemSelectable,
  loadCartUncheckedIds,
  saveCartUncheckedIds,
  sumCartItems,
} from "@/components/cart/cart-utils";

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

  // 배송지 팝업 - 배송지가 없으면 등록 화면, 있으면 목록 화면부터 시작
  const [addressDialog, setAddressDialog] = useState<{
    view: "list" | "create";
    open: boolean;
  }>({ view: "list", open: false });

  function openAddressDialog(view: "list" | "create") {
    setAddressDialog({ view, open: true });
  }

  const items = data?.data?.items ?? [];
  const policies = policyRes?.data ?? [];

  /**
   * 선택 해제한 아이템 id만 보관 -> 기본은 선택 가능한 아이템 전체 선택
   * 재조회로 아이템이 추가/삭제돼도 별도 동기화 없이 선택 상태가 유지됨
   * 새로고침/페이지 이동 후에도 유지되도록 sessionStorage에 저장
   */
  const [uncheckedIds, setUncheckedIds] =
    useState<Set<number>>(loadCartUncheckedIds);

  useEffect(() => {
    saveCartUncheckedIds(uncheckedIds);
  }, [uncheckedIds]);

  const queryClient = useQueryClient();
  const router = useRouter();
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  function isItemChecked(item: CartItemResDto): boolean {
    return (
      isCartItemSelectable(item) && !uncheckedIds.has(item.cartItemId as number)
    );
  }

  function setItemsChecked(targetItems: CartItemResDto[], checked: boolean) {
    setUncheckedIds((prev) => {
      const next = new Set(prev);
      for (const item of targetItems) {
        if (!isCartItemSelectable(item)) continue;
        const id = item.cartItemId as number;
        if (checked) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }

  const sections = Object.values(DeliveryType).map((deliveryType) => {
    const sectionItems = items.filter(
      (item) => item.deliveryType === deliveryType,
    );
    const selectableItems = sectionItems.filter(isCartItemSelectable);
    const selectedItems = selectableItems.filter(isItemChecked);
    const policy = policies.find((p) => p.deliveryType === deliveryType);
    const amount = sumCartItems(selectedItems);

    return {
      deliveryType,
      items: sectionItems,
      selectableItems,
      allChecked:
        selectableItems.length > 0 &&
        selectedItems.length === selectableItems.length,
      amount,
      deliveryFee: calcDeliveryFee(
        deliveryType,
        selectedItems,
        amount.itemTotal,
        policy,
      ),
      notice: getDeliveryNotice(deliveryType, amount.itemTotal, policy),
    };
  });

  // 결제 예정금액
  const orderAmount = sections.reduce(
    (sum, section) => sum + section.amount.originalTotal,
    0,
  );
  const discountAmount = sections.reduce(
    (sum, section) => sum + section.amount.discountTotal,
    0,
  );
  const isDeliveryFeeUnknown = sections.some(
    (section) => section.deliveryFee == null,
  );
  const deliveryFee = sections.reduce(
    (sum, section) => sum + (section.deliveryFee ?? 0),
    0,
  );
  const totalPaymentAmount = orderAmount - discountAmount + deliveryFee;

  const allSelectableItems = items.filter(isCartItemSelectable);
  const checkedItems = allSelectableItems.filter(isItemChecked);

  /** 선택 삭제
   * 일부 실패해도 나머지는 삭제되도록 allSettled 사용 (실패 메시지는 axios 인터셉터가 토스트로 노출)
   * 완료 후 장바구니 1회 재조회
   */
  async function handleDeleteSelected() {
    if (checkedItems.length === 0 || isDeletingSelected) return;

    setIsDeletingSelected(true);
    try {
      await Promise.allSettled(
        checkedItems.map((item) => deleteCartItem(item.cartItemId as number)),
      );
    } finally {
      await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      setIsDeletingSelected(false);
    }
  }
  const isAllChecked =
    allSelectableItems.length > 0 && allSelectableItems.every(isItemChecked);

  function handleOrder() {
    if (checkedItems.length === 0) return;

    router.push(
      buildOrderUrl({
        type: "cart",
        cartItemIds: checkedItems.map((item) => item.cartItemId as number),
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

      {/* 주소 정보 */}
      <div className="border-border mb-5 flex flex-col gap-1.5 rounded-xl border p-5">
        {isAddressPending ? (
          <div className="bg-muted h-5 w-48 animate-pulse rounded" />
        ) : address ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold">
                {address.addressName}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openAddressDialog("list")}
              >
                변경
              </Button>
            </div>
            <span className="text-muted-foreground text-sm">
              [{address.zipCode}] {address.address}
              {address.addressDetail ? ` ${address.addressDetail}` : ""}
            </span>
          </>
        ) : (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openAddressDialog("create")}
            >
              배송지 추가하기
            </Button>
          </div>
        )}
      </div>

      <AddressDialog
        open={addressDialog.open}
        onOpenChange={(open) => setAddressDialog((prev) => ({ ...prev, open }))}
        initialView={addressDialog.view}
        currentAddressId={address?.addressId ?? null}
        onSelectOnce={selectAddress}
        onAddressDeleted={unselectIfSelected}
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
                  disabled={allSelectableItems.length === 0}
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
                title={deliveryTypeLabel[section.deliveryType]}
                notice={section.notice}
                items={section.items}
                isItemChecked={isItemChecked}
                onItemCheckedChange={(item, checked) =>
                  setItemsChecked([item], checked)
                }
                allChecked={section.allChecked}
                hasSelectableItem={section.selectableItems.length > 0}
                onAllCheckedChange={(checked) =>
                  setItemsChecked(section.items, checked)
                }
                deliveryFee={section.deliveryFee}
                itemTotal={section.amount.itemTotal}
              />
            ))}
          </div>

          {/* 우측: 결제 예정금액 */}
          <aside className="border-border sticky top-6 flex h-fit w-[320px] shrink-0 flex-col gap-4 rounded-xl border p-6">
            <h2 className="text-[17px] font-bold">결제 예정금액</h2>

            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">주문 금액</span>
                <span>{formatPrice(orderAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">상품 할인</span>
                <span>
                  {discountAmount > 0
                    ? `-${formatPrice(discountAmount)}`
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
                {formatPrice(totalPaymentAmount)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleOrder}
              disabled={checkedItems.length === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-[52px] w-full rounded-lg text-[15px] font-bold disabled:pointer-events-none disabled:opacity-50"
            >
              주문하기
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
