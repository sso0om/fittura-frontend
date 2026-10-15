"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { getGetCartQueryKey } from "@/api/generated/cart-v1/cart-v1";
import { approvePayment } from "@/api/generated/payment-v1/payment-v1";
import {
  buildOrderCompleteUrl,
  parsePaymentCallback,
} from "@/components/order/checkout-routes";
import { PaymentResultMessage } from "@/components/order/payment-result-message";
import { parseApiError } from "@/lib/api-error";

// 서버 결제 승인 에러 코드
const PG_REJECTED = "PM400-04";       // PG가 거절 - 주문은 EXPIRED라 같은 주문으로 재결제 불가
const PG_RESULT_UNKNOWN = "PM502-01"; // 결과 불명 - 재시도 금지 (이중청구 위험)

/**
 * 결제 승인 콜백 - PG가 paymentKey를 붙여 보내는 successUrl 역할
 * 승인 마운트 후 1회만 실행 (새로고침·StrictMode 재실행으로 인한 재승인 방지)
 * - 성공: 완료 페이지로 교체 (뒤로가기 후 재조회 방지)
 * - 실패: 화면에서 사유 보여줌 -> 전역 에러 팝업 X
 */
export function PaymentCallbackClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const params = parsePaymentCallback(searchParams);

  const approveStartedRef = useRef(false);

  const { mutate: approve, error } = useMutation({
    meta: { skipGlobalError: true },
    mutationFn: async ({
      paymentId,
      paymentKey,
    }: {
      paymentId: number;
      paymentKey: string;
    }) => {
      const res = await approvePayment(paymentId, { paymentKey });
      if (res.data == null) {
        throw new Error("결제 승인 응답에 orderId가 없습니다.");
      }
      return res.data;
    },
    onSuccess: (orderId) => {
      void queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      router.replace(buildOrderCompleteUrl(orderId));
    },
  });

  const paymentId = params?.paymentId;
  const paymentKey = params?.paymentKey;

  useEffect(() => {
    if (paymentId == null || paymentKey == null) return;
    if (approveStartedRef.current) return;
    approveStartedRef.current = true;

    approve({ paymentId, paymentKey });
  }, [paymentId, paymentKey, approve]);

  if (params === null) {
    return (
      <PaymentResultMessage
        title="잘못된 접근입니다."
        description="결제 정보를 확인할 수 없습니다."
      />
    );
  }

  if (error) {
    return <ApproveFailure error={error} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-col items-center gap-4 px-6 py-24">
      <Loader2 className="text-primary size-8 animate-spin" />
      <p className="text-sm font-semibold">결제를 확인하고 있습니다.</p>
      <p className="text-muted-foreground text-sm">
        잠시만 기다려 주세요. 창을 닫거나 새로고침하지 마세요.
      </p>
    </div>
  );
}

function ApproveFailure({ error }: { error: unknown }) {
  const apiError = parseApiError(error);

  // 응답을 못 받은 경우(네트워크·타임아웃)도 불명으로 취급
  if (apiError?.noResponse || apiError?.code === PG_RESULT_UNKNOWN) {
    return (
      <PaymentResultMessage
        title="결제 결과를 확인하고 있습니다."
        description="결제 결과를 아직 확인하지 못했습니다. 결제가 완료되었을 수 있으니 같은 주문을 다시 결제하지 마세요."
        allowReorder={false}
      />
    );
  }

  if (apiError?.code === PG_REJECTED) {
    const reason =
      typeof apiError.data === "string" ? apiError.data : apiError.message;
    return (
      <PaymentResultMessage
        title="결제가 승인되지 않았습니다."
        description={`${reason ?? "카드사에서 결제를 거절했습니다."} 다시 결제하려면 장바구니에서 주문해 주세요.`}
      />
    );
  }

  return (
    <PaymentResultMessage
      title="결제를 완료하지 못했습니다."
      description={
        apiError?.message ??
        "결제가 승인되지 않았습니다. 장바구니에서 다시 주문해 주세요."
      }
    />
  );
}
