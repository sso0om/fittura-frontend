"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

import { useGetOrder } from "@/api/generated/order-v1/order-v1";
import { parseOrderCompleteOrderId } from "@/components/order/checkout-routes";
import { OrderCompleteSummary } from "@/components/order/order-complete-summary";
import { Button } from "@/components/ui/button";

export function OrderCompleteClient() {
  const searchParams = useSearchParams();
  const orderId = parseOrderCompleteOrderId(searchParams);

  // 결제 직후 화면이라 항상 최신 주문을 조회 (캐시 재사용 안 함)
  const { data, isPending, isError } = useGetOrder(orderId ?? 0, {
    query: { enabled: orderId !== null, staleTime: 0, gcTime: 0, retry: false },
  });
  const order = data?.data;

  if (orderId === null) {
    return (
      <CompleteMessage message="잘못된 접근입니다. 주문 정보를 확인할 수 없습니다." />
    );
  }

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-6 py-10">
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <CompleteMessage message="주문 정보를 불러오지 못했습니다. 결제는 정상 처리되었으니 잠시 후 주문 내역에서 확인해 주세요." />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] px-6 py-10">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-full">
          <Check className="size-7" strokeWidth={3} />
        </span>
        <h1 className="text-2xl font-extrabold">주문이 완료되었습니다.</h1>
        <p className="text-muted-foreground text-sm">
          주문번호 <span className="text-foreground">{order.orderNumber}</span>
        </p>
      </div>

      <OrderCompleteSummary order={order} />

      <div className="mt-8 flex justify-center">
        <Button
          className="h-12 px-10 text-[15px] font-bold"
          nativeButton={false}
          render={<Link href="/">쇼핑 계속하기</Link>}
        />
      </div>
    </div>
  );
}

function CompleteMessage({ message }: { message: string }) {
  return (
    <div className="mx-auto w-full max-w-[720px] px-6 py-16 text-center">
      <p className="text-muted-foreground mb-4 text-sm">{message}</p>
      <Link href="/" className="text-sm underline underline-offset-2">
        홈으로 이동
      </Link>
    </div>
  );
}
