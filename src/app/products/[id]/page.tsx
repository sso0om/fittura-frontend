import { Suspense } from "react";

import { ProductPageClient } from "@/app/products/[id]/product-page-client";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={null}>
      <ProductPageClient productId={Number(id)} />
    </Suspense>
  );
}
