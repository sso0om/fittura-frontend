import {
  DeliveryType,
  type CartItemResDto,
  type DeliveryPolicyResDto,
} from "@/api/model";
import { formatPrice } from "@/lib/format";
import { getUnavailableSaleStatus } from "@/lib/sale-status";

/** 선택·삭제·주문에 쓸 수 있는 아이템 - cartItemId가 있음이 보장됨 */
export type SelectableCartItem = CartItemResDto & { cartItemId: number };

export function isCartItemSelectable(
  item: CartItemResDto,
): item is SelectableCartItem {
  return (
    item.cartItemId != null &&
    getUnavailableSaleStatus({
      productStatus: item.productStatus,
      skuStatus: item.skuStatus,
      isSoldOut: item.isSoldOut,
    }) === null
  );
}

/** 선택 가능하고 선택 해제 목록에 없는 아이템인지 */
export function isCartItemChecked(
  item: CartItemResDto,
  uncheckedIds: ReadonlySet<number>,
): boolean {
  return isCartItemSelectable(item) && !uncheckedIds.has(item.cartItemId);
}

export interface CartItemsAmount {
  /** 할인 전 금액 합 (originalPrice × quantity) */
  originalAmount: number;
  /** 상품(판매자) 할인 합 - 쿠폰·프로모션 할인(discountAmount)과 별개 */
  productDiscountAmount: number;
  /** 할인 후 상품 금액 합 (itemTotalAmount) - 배송비 제외 */
  itemTotalAmount: number;
}

export function sumCartItems(items: CartItemResDto[]): CartItemsAmount {
  let originalAmount = 0;
  let itemTotalAmount = 0;

  for (const item of items) {
    originalAmount += (item.originalPrice ?? 0) * (item.quantity ?? 0);
    itemTotalAmount += item.itemTotalAmount ?? 0;
  }

  return {
    originalAmount,
    productDiscountAmount: originalAmount - itemTotalAmount,
    itemTotalAmount,
  };
}

/**
 * 배송 타입별 배송비 (선택된 아이템 기준)
 * - PARCEL: 선택 상품 금액(배송비 제외)이 무료배송 기준 미만이면 baseFee, 이상이면 0
 * - INSTALLATION: 아이템별 deliveryFee의 합
 * 정책이 아직 없으면 null (금액 미확정)
 */
function calcDeliveryFee(
  deliveryType: DeliveryType,
  selectedItems: CartItemResDto[],
  itemTotalAmount: number,
  policy: DeliveryPolicyResDto | undefined,
): number | null {
  if (selectedItems.length === 0) return 0;

  switch (deliveryType) {
    case DeliveryType.PARCEL: {
      if (policy?.baseFee == null || policy.freeShippingThreshold == null) {
        return null;
      }
      return itemTotalAmount >= policy.freeShippingThreshold
        ? 0
        : policy.baseFee;
    }
    case DeliveryType.INSTALLATION:
      return selectedItems.reduce(
        (sum, item) => sum + (item.deliveryFee ?? 0),
        0,
      );
  }
}

/** 섹션 헤더 우측 배송 안내 문구 */
function getDeliveryNotice(
  deliveryType: DeliveryType,
  itemTotalAmount: number,
  policy: DeliveryPolicyResDto | undefined,
): string | null {
  switch (deliveryType) {
    case DeliveryType.PARCEL: {
      const threshold = policy?.freeShippingThreshold;
      if (threshold == null) return null;
      if (itemTotalAmount === 0) {
        return `${formatPrice(threshold)} 이상 구매 시 무료배송`;
      }
      if (itemTotalAmount < threshold) {
        return `${formatPrice(threshold - itemTotalAmount)} 추가하면 무료배송`;
      }
      return "무료배송";
    }
    case DeliveryType.INSTALLATION: {
      const baseFee = policy?.baseFee;
      if (baseFee == null) return null;
      return `개당 배송비 ${formatPrice(baseFee)}`;
    }
  }
}

export interface CartSection {
  deliveryType: DeliveryType;
  /** 섹션의 전체 아이템 (품절 등 선택 불가 포함) */
  items: CartItemResDto[];
  selectableItems: SelectableCartItem[];
  allChecked: boolean;
  /** 선택된 아이템 기준 금액 */
  amount: CartItemsAmount;
  /** 선택된 아이템 기준 배송비 - 정책이 없으면 null (미확정) */
  deliveryFee: number | null;
  /** 섹션 헤더 우측 배송 안내 문구 */
  notice: string | null;
}

export interface CartSummary {
  sections: CartSection[];
  /** 전체 선택 가능 아이템 */
  selectableItems: SelectableCartItem[];
  /** 선택된 아이템 */
  checkedItems: SelectableCartItem[];
  isAllChecked: boolean;
  originalAmount: number;
  productDiscountAmount: number;
  /** 섹션 중 하나라도 배송비가 미확정이면 true */
  isDeliveryFeeUnknown: boolean;
  /** 미확정 섹션은 0으로 합산 */
  deliveryFee: number;
  /** 결제 예정금액 = 정가 합 - 상품 할인 + 배송비 */
  expectedFinalAmount: number;
}

/** 장바구니 화면 표시용 집계 - 배송 타입별 섹션, 선택 아이템 기준 금액·배송비 */
export function summarizeCart(
  items: CartItemResDto[],
  uncheckedIds: ReadonlySet<number>,
  policies: DeliveryPolicyResDto[],
): CartSummary {
  const sections: CartSection[] = Object.values(DeliveryType).map(
    (deliveryType) => {
      const sectionItems = items.filter(
        (item) => item.deliveryType === deliveryType,
      );
      const selectableItems = sectionItems.filter(isCartItemSelectable);
      const checkedItems = selectableItems.filter((item) =>
        isCartItemChecked(item, uncheckedIds),
      );
      const policy = policies.find((p) => p.deliveryType === deliveryType);
      const amount = sumCartItems(checkedItems);

      return {
        deliveryType,
        items: sectionItems,
        selectableItems,
        allChecked:
          selectableItems.length > 0 &&
          checkedItems.length === selectableItems.length,
        amount,
        deliveryFee: calcDeliveryFee(
          deliveryType,
          checkedItems,
          amount.itemTotalAmount,
          policy,
        ),
        notice: getDeliveryNotice(
          deliveryType,
          amount.itemTotalAmount,
          policy,
        ),
      };
    },
  );

  const selectableItems = items.filter(isCartItemSelectable);
  const checkedItems = selectableItems.filter((item) =>
    isCartItemChecked(item, uncheckedIds),
  );
  const { originalAmount, productDiscountAmount } = sumCartItems(checkedItems);
  const deliveryFee = sections.reduce(
    (sum, section) => sum + (section.deliveryFee ?? 0),
    0,
  );

  return {
    sections,
    selectableItems,
    checkedItems,
    isAllChecked:
      selectableItems.length > 0 &&
      checkedItems.length === selectableItems.length,
    originalAmount,
    productDiscountAmount,
    isDeliveryFeeUnknown: sections.some(
      (section) => section.deliveryFee == null,
    ),
    deliveryFee,
    expectedFinalAmount: originalAmount - productDiscountAmount + deliveryFee,
  };
}
