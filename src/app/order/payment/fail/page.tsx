import { Suspense } from "react";

import { PaymentFailClient } from "@/app/order/payment/fail/payment-fail-client";

export default function PaymentFailPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailClient />
    </Suspense>
  );
}
