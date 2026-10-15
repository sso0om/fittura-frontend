import { useMutation } from "@tanstack/react-query";

import {
  createOrderCart,
  createOrderDirect,
} from "@/api/generated/order-v1/order-v1";
import { preparePayment } from "@/api/generated/payment-v1/payment-v1";
import { PaymentMethod, PgProvider } from "@/api/model";
import type { OrderSource } from "@/components/order/order-source";
import { requestPaymentKey } from "@/components/order/request-payment-key";

export interface CheckoutParams {
  source: OrderSource;
  addressId: number;
  deliveryMemo: string;
}

/**
 * 결제하기: 주문 생성 -> 결제 준비 -> Toss 결제창 렌더링(결제 요청 시 성공은 콜백 라우트, 실패는 fail 라우트로 이동)
 * - 승인: 콜백 라우트에서 수행 (Toss successUrl)
 * - 결제창이 떠 있거나 이동 중: 호출부 isPending || isSuccess (연타 방지), 창을 닫으면 reset
 * - 취소·실패 후 재시도: 새 주문 생성
 * - 에러: QueryClient 전역 onError
 */
export function useCheckout() {
  const mutation = useMutation({
    mutationFn: async ({ source, addressId, deliveryMemo }: CheckoutParams) => {
      // TODO: 포인트 사용 기능 추가 시 pointUsedAmount 전달
      const common = {
        addressId,
        deliveryMemo: deliveryMemo.trim() || undefined,
        pointUsedAmount: 0,
      };

      const orderRes =
        source.type === "cart"
          ? await createOrderCart({ ...common, cartItemIds: source.cartItemIds })
          : await createOrderDirect({ ...common, orderSkus: source.orderSkus });

      const orderId = orderRes.data;
      if (orderId == null) {
        throw new Error("주문 생성 응답에 orderId가 없습니다.");
      }

      const prepareRes = await preparePayment({
        orderId,
        paymentMethod: PaymentMethod.CARD,
        pgProvider: PgProvider.TOSS,
      });
      if (prepareRes.data == null) {
        throw new Error("결제 준비 응답이 비어 있습니다.");
      }

      // 결제창을 닫으면 상태를 초기화해 버튼 잠금을 푼다
      await requestPaymentKey(prepareRes.data, () => mutation.reset());
    },
  });

  return mutation;
}
