import { Suspense } from "react";

import { ProductsPageClient } from "@/app/products/products-page-client";

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageClient />
    </Suspense>
  );
}
