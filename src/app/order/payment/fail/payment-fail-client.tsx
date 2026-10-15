"use client";

import { useSearchParams } from "next/navigation";

import { PaymentResultMessage } from "@/components/order/payment-result-message";

const PAY_PROCESS_CANCELED = "PAY_PROCESS_CANCELED";

export function PaymentFailClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  if (code === PAY_PROCESS_CANCELED) {
    return (
      <PaymentResultMessage
        title="결제를 취소했습니다."
        description="장바구니에서 다시 주문해 주세요."
      />
    );
  }

  return (
    <PaymentResultMessage
      title="결제에 실패했습니다."
      description={
        message
          ? `${message.slice(0, 200)} 장바구니에서 다시 주문해 주세요.`
          : "장바구니에서 다시 주문해 주세요."
      }
    />
  );
}
