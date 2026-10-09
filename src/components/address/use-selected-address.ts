import { useEffect, useState } from "react";

import {
  useGetAddress,
  useGetDefaultAddress,
} from "@/api/generated/memberaddress-v1/memberaddress-v1";
import type { MemberAddressResDto } from "@/api/model";
import {
  readSession,
  removeSession,
  writeSession,
} from "@/lib/session-storage";

/**
 * 이번 주문에 사용할 배송지 id 보관 (sessionStorage)
 * - 장바구니/주문 화면이 공유, 새로고침/페이지 이동 후에도 유지
 * - 탭(브라우저 세션)을 닫으면 초기화 -> 다음 방문은 기본 배송지부터 시작
 * - 주소 전체가 아닌 id만 저장하고 화면 진입 시 서버에서 재조회 (수정/삭제 반영)
 */
const SELECTED_ADDRESS_ID_KEY = "address:selectedId";

function loadSelectedAddressId(): number | null {
  const raw = readSession(SELECTED_ADDRESS_ID_KEY);
  const id = raw == null ? NaN : Number(raw);
  return Number.isInteger(id) ? id : null;
}

export interface AddressSelection {
  address: MemberAddressResDto | null;
  isPending: boolean;
  /** 이번 주문에만 사용할 배송지로 지정 (기본 배송지는 바꾸지 않음) */
  selectAddress: (addressId: number) => void;
  /** 배송지 삭제 시 - 선택한 배송지였다면 선택 해제 (기본 배송지로 전환) */
  unselectIfSelected: (addressId: number) => void;
}

/**
 * 화면에 보여줄 배송지
 * - 이번에 선택한 배송지(sessionStorage)가 있으면 그 배송지를 id로 조회
 * - 없으면 기본 배송지 조회 (등록된 배송지가 없으면 null)
 * - 선택한 배송지 조회 실패(삭제됨 등) 시 선택값을 지우고 기본 배송지로 전환
 */
export function useSelectedAddress(): AddressSelection {
  const [selectedId, setSelectedId] = useState<number | null>(
    loadSelectedAddressId,
  );

  function selectAddress(addressId: number) {
    // 저장 실패 시 선택 배송지만 유지되지 않고 기본 배송지로 동작
    writeSession(SELECTED_ADDRESS_ID_KEY, String(addressId));
    setSelectedId(addressId);
  }

  function unselectIfSelected(addressId: number) {
    if (selectedId !== addressId) return;
    removeSession(SELECTED_ADDRESS_ID_KEY);
    setSelectedId(null);
  }

  const selectedQuery = useGetAddress(selectedId ?? 0, {
    query: { enabled: selectedId != null, retry: false },
  });
  const hasValidSelection = selectedId != null && !selectedQuery.isError;

  const defaultQuery = useGetDefaultAddress({
    query: { enabled: !hasValidSelection },
  });

  // 조회 실패한 선택값은 저장소에서도 제거 -> 다음 진입부터 기본 배송지로 시작
  useEffect(() => {
    if (selectedQuery.isError) removeSession(SELECTED_ADDRESS_ID_KEY);
  }, [selectedQuery.isError]);

  const query = hasValidSelection ? selectedQuery : defaultQuery;

  return {
    address: query.data?.data ?? null,
    isPending: query.isPending,
    selectAddress,
    unselectIfSelected,
  };
}
