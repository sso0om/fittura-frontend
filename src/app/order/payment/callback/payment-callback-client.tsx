"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { getGetCartQueryKey } from "@/api/generated/cart-v1/cart-v1";
import { approvePayment } from "@/api/generated/payment-v1/payment-v1";
import {
  buildOrderCompleteUrl,
  parsePaymentCallback,
} from "@/components/order/checkout-routes";
import { Button } from "@/components/ui/button";

/**
 * 결제 승인 콜백 - PG가 paymentKey를 붙여 보내는 successUrl 역할
 * 승인은 마운트 후 1회만 실행 (새로고침·StrictMode 재실행으로 인한 재승인 방지)
 * 성공하면 history를 남기지 않고 완료 페이지로 교체해 뒤로가기로 이 페이지에 돌아오지 않게 한다
 */
export function PaymentCallbackClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const params = parsePaymentCallback(searchParams);

  const [isFailed, setIsFailed] = useState(false);
  const approveStartedRef = useRef(false);

  const paymentId = params?.paymentId;
  const paymentKey = params?.paymentKey;

  useEffect(() => {
    if (paymentId == null || paymentKey == null) return;
    if (approveStartedRef.current) return;
    approveStartedRef.current = true;

    approvePayment(paymentId, { paymentKey })
      .then((res) => {
        const orderId = res.data;
        if (orderId == null) {
          setIsFailed(true);
          return;
        }

        // 장바구니 주문이면 서버가 항목을 지웠으므로 캐시만 무효화 (바로구매는 변화 없음)
        void queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        router.replace(buildOrderCompleteUrl(orderId));
      })
      // 에러 메시지는 axios 인터셉터가 이미 노출
      .catch(() => setIsFailed(true));
  }, [paymentId, paymentKey, queryClient, router]);

  if (params === null) {
    return (
      <CallbackMessage
        title="잘못된 접근입니다."
        description="결제 정보를 확인할 수 없습니다."
      />
    );
  }

  if (isFailed) {
    return (
      <CallbackMessage
        title="결제를 완료하지 못했습니다."
        description="결제가 승인되지 않았습니다. 장바구니에서 다시 주문해 주세요."
      />
    );
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

function CallbackMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-col items-center gap-3 px-6 py-24 text-center">
      <h1 className="text-xl font-extrabold">{title}</h1>
      <p className="text-muted-foreground text-sm">{description}</p>
      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          className="h-10 px-5"
          nativeButton={false}
          render={<Link href="/">쇼핑 계속하기</Link>}
        />
        <Button
          className="h-10 px-5"
          nativeButton={false}
          render={<Link href="/cart">장바구니로 이동</Link>}
        />
      </div>
    </div>
  );
}
