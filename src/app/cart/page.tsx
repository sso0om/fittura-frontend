import { Suspense } from "react";

import { CartPageClient } from "@/app/cart/cart-page-client";

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <CartPageClient />
    </Suspense>
  );
}
