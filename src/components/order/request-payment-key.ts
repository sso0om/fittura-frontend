import type { PaymentPrepareResDto } from "@/api/model";
import { buildPaymentCallbackUrl } from "@/components/order/checkout-routes";

/**
 * paymentKey 획득 단계 - 결제 준비 이후 ~ 승인 콜백 이동 전까지
 *
 * 현재는 Mock PG: 임의 paymentKey를 만들어 콜백 라우트로 바로 이동한다.
 * TODO: Toss 연동 시 이 함수만 교체 - SDK requestPayment()에
 *  successUrl = 콜백 라우트(paymentId 포함)를 넘기면 Toss가 paymentKey를 붙여 리다이렉트한다.
 */
export async function requestPaymentKey(
  prepared: PaymentPrepareResDto,
  replace: (url: string) => void,
): Promise<void> {
  const paymentId = prepared.paymentId;
  if (paymentId == null) {
    throw new Error("결제 준비 응답에 paymentId가 없습니다.");
  }

  // 서버 제한 200자 이하 (mock_ + uuid = 41자)
  const paymentKey = `mock_${crypto.randomUUID()}`;
  replace(buildPaymentCallbackUrl({ paymentId, paymentKey }));
}
