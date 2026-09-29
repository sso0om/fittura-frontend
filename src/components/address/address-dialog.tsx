"use client";

import { useState } from "react";
import { ChevronLeftIcon } from "lucide-react";

import type { MemberAddressResDto } from "@/api/model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddressForm } from "@/components/address/address-form";
import { AddressList } from "@/components/address/address-list";

export type AddressDialogView =
  | { type: "list" }
  | { type: "create"; isFirstAddress: boolean }
  | { type: "edit"; address: MemberAddressResDto; isOnlyAddress: boolean };

const TITLES: Record<AddressDialogView["type"], string> = {
  list: "배송지 관리",
  create: "배송지 추가",
  edit: "배송지 수정",
};

export interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * 처음 보여줄 화면 - 배송지가 없으면 등록, 있으면 목록
   * 등록으로 시작 = 표시할 배송지(기본 배송지)가 없음 = 등록된 배송지가 없음 -> 첫 배송지
   */
  initialView: "list" | "create";
  currentAddressId: number | null;
  onSelectOnce: (addressId: number) => void;
  /** 배송지 삭제 성공 - 이번만 선택한 배송지였다면 선택 해제용 */
  onAddressDeleted: (addressId: number) => void;
}

/**
 * 배송지 팝업 - 목록 / 등록 / 수정을 한 팝업 안에서 전환
 * - 폼 입력 중 바깥 클릭으로 닫혀 입력값이 사라지지 않도록 바깥 클릭 닫기는 막음 (X, Esc로 닫기)
 * - 화면 전환 state는 팝업 내용(AddressDialogBody)에 둠
 *   -> 닫히면 내용과 함께 사라지고, 다시 열면 시작 화면/빈 입력값부터 시작
 */
export function AddressDialog({
  open,
  onOpenChange,
  ...bodyProps
}: AddressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} disablePointerDismissal>
      <DialogContent className="max-h-[90vh] [scrollbar-gutter:stable] gap-6 overflow-y-auto p-6 sm:max-w-lg">
        <AddressDialogBody {...bodyProps} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

/**
 * 팝업 내용
 * - 등록, 수정 저장 후에는 목록으로 이동
 * - 목록에서 들어간 등록/수정 화면은 뒤로가기로 목록 복귀
 */
function AddressDialogBody({
  initialView,
  currentAddressId,
  onSelectOnce,
  onAddressDeleted,
  onClose,
}: Omit<AddressDialogProps, "open" | "onOpenChange"> & {
  onClose: () => void;
}) {
  const [view, setView] = useState<AddressDialogView>(
    initialView === "create"
      ? { type: "create", isFirstAddress: true }
      : { type: "list" },
  );
  const [hasVisitedList, setHasVisitedList] = useState(initialView === "list");

  function showList() {
    setHasVisitedList(true);
    setView({ type: "list" });
  }

  const canGoBack = view.type !== "list" && hasVisitedList;

  return (
    <>
      <DialogHeader className="relative items-center border-b pb-4">
        {canGoBack && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="뒤로"
            onClick={showList}
            className="absolute top-0 left-0"
          >
            <ChevronLeftIcon />
          </Button>
        )}
        <DialogTitle className="text-lg font-bold">
          {TITLES[view.type]}
        </DialogTitle>
      </DialogHeader>

      {view.type === "list" && (
        <AddressList
          currentAddressId={currentAddressId}
          onAdd={(isFirstAddress) =>
            setView({ type: "create", isFirstAddress })
          }
          onEdit={(address, isOnlyAddress) =>
            setView({ type: "edit", address, isOnlyAddress })
          }
          onSelectOnce={(addressId) => {
            onSelectOnce(addressId);
            onClose();
          }}
        />
      )}
      {view.type === "create" && (
        <AddressForm isFirstAddress={view.isFirstAddress} onSaved={showList} />
      )}
      {view.type === "edit" && (
        <AddressForm
          address={view.address}
          isOnlyAddress={view.isOnlyAddress}
          onSaved={showList}
          onDeleted={onAddressDeleted}
        />
      )}
    </>
  );
}
