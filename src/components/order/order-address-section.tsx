"use client";

import { useState } from "react";

import type { MemberAddressResDto } from "@/api/model";
import { AddressDialog } from "@/components/address/address-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** 서버 deliveryMemo 최대 길이 */
const DELIVERY_MEMO_MAX_LENGTH = 255;

export interface OrderAddressSectionProps {
  address: MemberAddressResDto | null;
  isAddressPending: boolean;
  onSelectAddress: (addressId: number) => void;
  onAddressDeleted: (addressId: number) => void;
  deliveryMemo: string;
  onDeliveryMemoChange: (value: string) => void;
}

/** 받는 분 정보 - 배송지(기존 배송지 팝업 재사용) + 배송 요청사항 */
export function OrderAddressSection({
  address,
  isAddressPending,
  onSelectAddress,
  onAddressDeleted,
  deliveryMemo,
  onDeliveryMemoChange,
}: OrderAddressSectionProps) {
  // 배송지가 없으면 등록 화면, 있으면 목록 화면부터 시작
  const [dialog, setDialog] = useState<{
    view: "list" | "create";
    open: boolean;
  }>({ view: "list", open: false });

  return (
    <section className="border-foreground border-t-2 py-6">
      <h2 className="mb-5 text-xl font-extrabold">받는 분 정보</h2>

      <div className="flex flex-col gap-5">
        <div className="flex gap-6">
          <span className="w-28 shrink-0 text-sm font-bold">배송지 정보</span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
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
                    onClick={() => setDialog({ view: "list", open: true })}
                  >
                    변경
                  </Button>
                </div>
                <span className="text-sm">
                  {address.receiverName}
                  {address.phoneNumber ? ` | ${address.phoneNumber}` : ""}
                </span>
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
                  onClick={() => setDialog({ view: "create", open: true })}
                >
                  배송지 추가하기
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          <label
            htmlFor="delivery-memo"
            className="w-28 shrink-0 pt-1.5 text-sm font-bold"
          >
            배송 시 요청사항
          </label>
          <div className="relative max-w-[600px] flex-1">
            <Input
              id="delivery-memo"
              value={deliveryMemo}
              maxLength={DELIVERY_MEMO_MAX_LENGTH}
              placeholder="배송 시 요청사항을 입력해 주세요."
              className="h-10 pr-16"
              onChange={(e) => onDeliveryMemoChange(e.target.value)}
            />
            <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
              {deliveryMemo.length}/{DELIVERY_MEMO_MAX_LENGTH}
            </span>
          </div>
        </div>
      </div>

      <AddressDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
        initialView={dialog.view}
        currentAddressId={address?.addressId ?? null}
        onSelectOnce={onSelectAddress}
        onAddressDeleted={onAddressDeleted}
      />
    </section>
  );
}
