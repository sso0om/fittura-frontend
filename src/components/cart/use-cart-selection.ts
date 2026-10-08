import { useEffect, useState } from "react";

import type { CartItemResDto } from "@/api/model";
import {
  isCartItemChecked,
  isCartItemSelectable,
} from "@/components/cart/cart-utils";

/**
 * 장바구니 선택 해제 상태 보관 (sessionStorage)
 * - 새로고침/페이지 이동 후 돌아와도 유지, 탭(브라우저 세션)을 닫으면 초기화
 * - 저장소 접근이 막힌 환경(시크릿 모드 등)에서는 저장 없이 기본값(전체 선택)으로 동작
 */
const CART_UNCHECKED_IDS_KEY = "cart:uncheckedIds";

function loadCartUncheckedIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(CART_UNCHECKED_IDS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((id): id is number => typeof id === "number")
        : [],
    );
  } catch {
    return new Set();
  }
}

function saveCartUncheckedIds(ids: Set<number>): void {
  try {
    window.sessionStorage.setItem(
      CART_UNCHECKED_IDS_KEY,
      JSON.stringify([...ids]),
    );
  } catch {
    // 저장 실패 시 무시 - 선택 상태만 유지되지 않을 뿐 기능에는 영향 없음
  }
}

/**
 * 선택 해제한 아이템 id만 보관 -> 기본은 선택 가능한 아이템 전체 선택
 * 재조회로 아이템이 추가/삭제돼도 별도 동기화 없이 선택 상태가 유지됨
 */
export function useCartSelection() {
  const [uncheckedIds, setUncheckedIds] =
    useState<Set<number>>(loadCartUncheckedIds);

  useEffect(() => {
    saveCartUncheckedIds(uncheckedIds);
  }, [uncheckedIds]);

  function isItemChecked(item: CartItemResDto): boolean {
    return isCartItemChecked(item, uncheckedIds);
  }

  function setItemsChecked(targetItems: CartItemResDto[], checked: boolean) {
    setUncheckedIds((prev) => {
      const next = new Set(prev);
      for (const item of targetItems) {
        if (!isCartItemSelectable(item)) continue;
        if (checked) next.delete(item.cartItemId);
        else next.add(item.cartItemId);
      }
      return next;
    });
  }

  return { uncheckedIds, isItemChecked, setItemsChecked };
}
