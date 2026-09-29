"use client";

import { useEffect } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DEFAULT_DURATION_MS = 600;

export interface NoticeDialogProps {
  /** null이면 닫힘 */
  message: string | null;
  onClose: () => void;
  /** 자동으로 닫히는 시간(ms) */
  durationMs?: number;
}

/**
 * 사용자 안내 팝업 - 화면 정중앙에 떴다가 스스로 닫힘
 * 사용자가 결정할 게 없는 단순 안내라 버튼을 두지 않음
 */
export function NoticeDialog({
  message,
  onClose,
  durationMs = DEFAULT_DURATION_MS,
}: NoticeDialogProps) {
  useEffect(() => {
    if (message === null) return;

    const timerId = window.setTimeout(onClose, durationMs);
    // 메시지가 바뀌면 타이머를 새로 시작
    return () => window.clearTimeout(timerId);
  }, [message, durationMs, onClose]);

  return (
    <AlertDialog
      open={message !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent className="gap-0">
        <AlertDialogHeader>
          <AlertDialogTitle className="sr-only">안내</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground text-[15px]">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
