"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface CartAddedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoToCart: () => void;
}

/** 장바구니 담기 완료 안내 - 계속 쇼핑 / 장바구니 이동 선택 */
export function CartAddedDialog({
  open,
  onOpenChange,
  onGoToCart,
}: CartAddedDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>장바구니에 담았습니다.</AlertDialogTitle>
          <AlertDialogDescription>
            장바구니로 이동하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>계속 쇼핑하기</AlertDialogCancel>
          <AlertDialogAction onClick={onGoToCart}>장바구니로 이동</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
