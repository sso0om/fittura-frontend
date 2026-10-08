import { Suspense } from "react";

import { OrderPageClient } from "@/app/order/order-page-client";

export default function OrderPage() {
  return (
    <Suspense fallback={null}>
      <OrderPageClient />
    </Suspense>
  );
}
