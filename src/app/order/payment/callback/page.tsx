import { Suspense } from "react";

import { PaymentCallbackClient } from "@/app/order/payment/callback/payment-callback-client";

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={null}>
      <PaymentCallbackClient />
    </Suspense>
  );
}
