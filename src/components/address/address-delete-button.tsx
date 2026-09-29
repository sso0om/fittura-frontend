"use client";

import { useState } from "react";

import { useDeleteAddress } from "@/api/generated/auth-v1/auth-v1";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useInvalidateAddresses } from "@/components/address/use-invalidate-addresses";

export interface AddressDeleteButtonProps {
  addressId: number;
  disabled?: boolean;
  /** 삭제 성공 - 재조회보다 먼저 호출 (선택 배송지 해제 등) */
  onDeleted: (addressId: number) => void;
  /** 재조회까지 끝난 뒤 */
  onDone: () => void;
}

/** 배송지 삭제 버튼 - 확인 팝업 후 삭제 */
export function AddressDeleteButton({
  addressId,
  disabled = false,
  onDeleted,
  onDone,
}: AddressDeleteButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const invalidateAddresses = useInvalidateAddresses();
  const { mutate: deleteAddress, isPending } = useDeleteAddress({
    mutation: {
      onSuccess: async () => {
        setIsConfirmOpen(false);
        // 삭제된 배송지를 선택 상태에서 먼저 빼야 재조회 시 404 조회가 나가지 않음
        onDeleted(addressId);
        await invalidateAddresses();
        onDone();
      },
    },
  });

  return (
    <>
      <button
        type="button"
        disabled={disabled || isPending}
        onClick={() => setIsConfirmOpen(true)}
        className="border-input text-muted-foreground disabled:bg-muted h-12 rounded-md border text-base font-bold"
      >
        삭제
      </button>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>배송지를 삭제할까요?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => deleteAddress({ addressId })}
            >
              삭제
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
