import { Suspense } from "react";

import { OrderCompleteClient } from "@/app/order/complete/order-complete-client";

export default function OrderCompletePage() {
  return (
    <Suspense fallback={null}>
      <OrderCompleteClient />
    </Suspense>
  );
}
