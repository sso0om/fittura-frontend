"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface UnavailableOption {
  skuId: number;
  /** 예: "오크 / 원목 - 일시품절" */
  label: string;
}

export interface UnavailableOptionsDialogProps {
  /** 비어 있으면 닫힘 */
  options: UnavailableOption[];
  onClose: () => void;
}

/** 바로구매 시 구매 불가 옵션 안내 - 판정은 부모에서 하고 여기선 표시만 */
export function UnavailableOptionsDialog({
  options,
  onClose,
}: UnavailableOptionsDialogProps) {
  return (
    <AlertDialog
      open={options.length > 0}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>구매할 수 없는 옵션이 있습니다.</AlertDialogTitle>
          <AlertDialogDescription>
            아래 옵션을 제외한 뒤 다시 시도해 주세요.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="flex flex-col gap-1 text-sm">
          {options.map((option) => (
            <li key={option.skuId}>· {option.label}</li>
          ))}
        </ul>
        <AlertDialogFooter>
          <AlertDialogCancel>확인</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
