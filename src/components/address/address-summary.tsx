"use client";

import { useState } from "react";

import { cn } from "cn";
import type { MemberAddressResDto } from "@/api/model";
import { AddressDialog } from "@/components/address/address-dialog";
import { Button } from "@/components/ui/button";
import { formatPhoneNumber } from "@/lib/format";

export interface AddressSummaryProps {
  address: MemberAddressResDto | null;
  isAddressPending: boolean;
  onSelectAddress: (addressId: number) => void;
  onAddressDeleted: (addressId: number) => void;
  /** 받는 분·연락처 줄 표시 (주문서) - 장바구니는 배송지명과 주소만 */
  showReceiver?: boolean;
  className?: string;
}

/**
 * 현재 배송지 요약 + 배송지 팝업 (장바구니·주문서 공용)
 * 배송지가 없으면 등록 화면, 있으면 목록 화면부터 시작
 */
export function AddressSummary({
  address,
  isAddressPending,
  onSelectAddress,
  onAddressDeleted,
  showReceiver = false,
  className,
}: AddressSummaryProps) {
  const [dialog, setDialog] = useState<{
    view: "list" | "create";
    open: boolean;
  }>({ view: "list", open: false });

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
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
          {showReceiver && (
            <span className="text-sm">
              {address.receiverName}
              {address.phoneNumber
                ? ` | ${formatPhoneNumber(address.phoneNumber)}`
                : ""}
            </span>
          )}
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

      <AddressDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
        initialView={dialog.view}
        currentAddressId={address?.addressId ?? null}
        onSelectOnce={onSelectAddress}
        onAddressDeleted={onAddressDeleted}
      />
    </div>
  );
}
