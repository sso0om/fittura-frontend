"use client";

import { AddressSummary } from "@/components/address/address-summary";
import type { AddressSelection } from "@/components/address/use-selected-address";
import { Input } from "@/components/ui/input";

/** 서버 deliveryMemo 최대 길이 */
const DELIVERY_MEMO_MAX_LENGTH = 255;

export interface OrderAddressSectionProps {
  addressSelection: AddressSelection;
  deliveryMemo: string;
  onDeliveryMemoChange: (value: string) => void;
}

/** 받는 분 정보 - 배송지(기존 배송지 팝업 재사용) + 배송 요청사항 */
export function OrderAddressSection({
  addressSelection,
  deliveryMemo,
  onDeliveryMemoChange,
}: OrderAddressSectionProps) {
  return (
    <section className="border-foreground border-t-2 py-6">
      <h2 className="mb-5 text-xl font-extrabold">받는 분 정보</h2>

      <div className="flex flex-col gap-5">
        <div className="flex gap-6">
          <span className="w-28 shrink-0 text-sm font-bold">배송지 정보</span>
          <AddressSummary
            addressSelection={addressSelection}
            showReceiver
            className="min-w-0 flex-1"
          />
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

    </section>
  );
}
