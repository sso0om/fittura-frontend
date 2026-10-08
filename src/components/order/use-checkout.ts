import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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
 * 결제하기: 주문 생성 -> 결제 준비 -> paymentKey 획득(콜백 라우트 이동)
 * - 승인은 콜백 라우트에서 수행 (Toss successUrl 구조와 동일)
 * - 성공하면 화면이 이동하므로 호출부는 isPending || isSuccess로 버튼을 잠근다 (이동 중 연타 방지)
 * - 실패 시 재시도하면 새 주문을 만든다 (남은 PENDING 주문은 만료 처리 몫)
 * - 에러 안내는 axios 인터셉터가 처리
 */
export function useCheckout() {
  const router = useRouter();

  return useMutation({
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

      await requestPaymentKey(prepareRes.data, (url) => router.replace(url));
    },
  });
}
