"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ApiErrorInfo } from "@/lib/api-error";

export interface ApiErrorDialogProps {
  /** null이면 닫힘 */
  error: ApiErrorInfo | null;
  onClose: () => void;
}

/**
 * API 에러 팝업 - 화면 정중앙, 확인을 눌러야 닫힘
 * 자동으로 닫히는 안내는 NoticeDialog
 */
export function ApiErrorDialog({ error, onClose }: ApiErrorDialogProps) {
  return (
    <AlertDialog
      open={error !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="sr-only">오류 안내</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground text-[15px]">
            {error?.message}
          </AlertDialogDescription>
          {error?.detail && (
            <p className="text-muted-foreground text-xs break-all">
              {error.detail}
            </p>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
