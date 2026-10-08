"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { cn } from "cn";

import {
  useChangeDefaultMemberAddress,
  useGetMemberAddresses,
} from "@/api/generated/memberaddress-v1/memberaddress-v1";
import type { MemberAddressResDto } from "@/api/model";
import { useInvalidateAddresses } from "@/components/address/use-invalidate-addresses";
import { formatPhoneNumber } from "@/lib/format";

export interface AddressListProps {
  /** 지금 화면에 표시 중인 배송지 - 처음 선택 상태로 사용 */
  currentAddressId: number | null;
  /** isFirstAddress: 목록이 비어 있는 상태에서의 추가 */
  onAdd: (isFirstAddress: boolean) => void;
  /** isOnlyAddress: 수정 대상이 유일한 배송지 (삭제 가능 여부 판단용) */
  onEdit: (address: MemberAddressResDto, isOnlyAddress: boolean) => void;
  /** 이번만 배송지 변경 */
  onSelectOnce: (addressId: number) => void;
}

/** 배송지 목록 - 선택 후 이번만 변경 / 기본 배송지 변경 */
export function AddressList({
  currentAddressId,
  onAdd,
  onEdit,
  onSelectOnce,
}: AddressListProps) {
  const { data, isPending } = useGetMemberAddresses();
  const addresses = data?.data ?? [];

  // 사용자가 고른 값이 없으면 현재 배송지, 그것도 없으면 첫 번째(기본 배송지가 맨 위)
  const [checkedId, setCheckedId] = useState<number | null>(null);
  const selectedId =
    checkedId ?? currentAddressId ?? addresses[0]?.addressId ?? null;
  const selected = addresses.find((a) => a.addressId === selectedId);
  const selectedAddressId = selected?.addressId;

  const invalidateAddresses = useInvalidateAddresses();
  const { mutate: changeDefault, isPending: isChangingDefault } =
    useChangeDefaultMemberAddress({
      mutation: { onSuccess: () => invalidateAddresses() },
    });

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => onAdd(addresses.length === 0)}
        disabled={isPending}
        className="border-input hover:bg-muted flex h-14 items-center justify-center gap-1.5 rounded-md border text-base font-semibold"
      >
        <PlusIcon className="size-5" />새 배송지 추가
      </button>

      {isPending ? (
        <div className="bg-muted h-24 animate-pulse rounded-md" />
      ) : (
        <ul className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
          {addresses.map((address) => {
            const isChecked = address.addressId === selectedId;
            return (
              <li
                key={address.addressId}
                className={cn(
                  "flex flex-col gap-1.5 rounded-md border p-4 text-sm",
                  isChecked ? "border-point" : "border-input",
                )}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="address"
                      checked={isChecked}
                      onChange={() => setCheckedId(address.addressId ?? null)}
                      className="accent-point size-4"
                    />
                    <span className="text-[15px] font-bold">
                      {address.addressName}
                    </span>
                    {address.defaultAddress && (
                      <span className="bg-point text-point-foreground rounded-full px-2 py-0.5 text-xs">
                        기본배송지
                      </span>
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={() => onEdit(address, addresses.length === 1)}
                    className="text-muted-foreground text-sm"
                  >
                    수정
                  </button>
                </div>
                <p>
                  {address.receiverName}{" "}
                  <span className="text-muted-foreground">
                    {formatPhoneNumber(address.phoneNumber)}
                  </span>
                </p>
                <p>
                  [{address.zipCode}] {address.address}
                  {address.addressDetail ? ` ${address.addressDetail}` : ""}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <div className="grid grid-cols-2">
        <button
          type="button"
          disabled={selectedAddressId == null}
          onClick={() => {
            if (selectedAddressId != null) onSelectOnce(selectedAddressId);
          }}
          className="bg-foreground text-background h-14 text-base font-bold disabled:opacity-50"
        >
          이번만 배송지 변경
        </button>
        <button
          type="button"
          disabled={
            selectedAddressId == null ||
            selected?.defaultAddress === true ||
            isChangingDefault
          }
          onClick={() => {
            if (selectedAddressId != null)
              changeDefault({ addressId: selectedAddressId });
          }}
          className="bg-point text-point-foreground h-14 text-base font-bold disabled:opacity-50"
        >
          기본배송지 변경
        </button>
      </div>
    </div>
  );
}
