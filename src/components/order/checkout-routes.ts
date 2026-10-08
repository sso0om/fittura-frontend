import { parsePositiveInt } from "@/components/order/order-source";

export const PAYMENT_CALLBACK_PATH = "/order/payment/callback";
export const ORDER_COMPLETE_PATH = "/order/complete";

/** 서버 PaymentApproveReqDto.paymentKey 최대 길이 */
const PAYMENT_KEY_MAX_LENGTH = 200;

export interface PaymentCallbackParams {
  paymentId: number;
  paymentKey: string;
}

export function buildPaymentCallbackUrl({
  paymentId,
  paymentKey,
}: PaymentCallbackParams): string {
  const params = new URLSearchParams({
    paymentId: String(paymentId),
    paymentKey,
  });
  return `${PAYMENT_CALLBACK_PATH}?${params.toString()}`;
}

/** 형식이 잘못됐으면 null (값 검증은 서버가 승인 시 다시 함) */
export function parsePaymentCallback(params: {
  get(name: string): string | null;
}): PaymentCallbackParams | null {
  const rawPaymentId = params.get("paymentId");
  const paymentKey = params.get("paymentKey");
  if (!rawPaymentId || !paymentKey) return null;
  if (paymentKey.length > PAYMENT_KEY_MAX_LENGTH) return null;

  const paymentId = parsePositiveInt(rawPaymentId);
  if (paymentId === null) return null;
  return { paymentId, paymentKey };
}

export function buildOrderCompleteUrl(orderId: number): string {
  return `${ORDER_COMPLETE_PATH}?orderId=${orderId}`;
}

export function parseOrderCompleteOrderId(params: {
  get(name: string): string | null;
}): number | null {
  const raw = params.get("orderId");
  return raw ? parsePositiveInt(raw) : null;
}
