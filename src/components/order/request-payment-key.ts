import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";

import type { PaymentPrepareResDto } from "@/api/model";
import {
  buildPaymentSuccessPath,
  PAYMENT_FAIL_PATH,
} from "@/components/order/checkout-routes";

const ORDER_NAME_MAX_LENGTH = 100;

/** Toss 결제창 호출 */
export async function requestPaymentKey(
  prepared: PaymentPrepareResDto,
  onCancel: () => void,
): Promise<void> {
  const { paymentId, paymentNumber, totalAmount, orderName } = prepared;
  if (
    paymentId == null ||
    paymentNumber == null ||
    totalAmount == null ||
    orderName == null
  ) {
    throw new Error("결제 준비 응답에 필수 값이 없습니다.");
  }

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (!clientKey) {
    throw new Error("NEXT_PUBLIC_TOSS_CLIENT_KEY가 설정되지 않았습니다.");
  }

  const safeOrderName = orderName.slice(0, ORDER_NAME_MAX_LENGTH);
  const tossPayments = await loadTossPayments(clientKey);
  const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
  await widgets.setAmount({ currency: "KRW", value: totalAmount });

  const paymentWindow = await widgets.renderPaymentWindow({
    orderName: safeOrderName,
  });

  paymentWindow.on("paymentRequest", async () => {
    await widgets.requestPayment({
      orderId: paymentNumber,
      orderName: safeOrderName,
      successUrl: `${window.location.origin}${buildPaymentSuccessPath(paymentId)}`,
      failUrl: `${window.location.origin}${PAYMENT_FAIL_PATH}`,
    });
  });

  paymentWindow.on("cancel", async () => onCancel());
}
