import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ProductPageClient } from "@/app/products/[id]/product-page-client";
import { parsePositiveInt } from "@/lib/validation";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const productId = parsePositiveInt(id);
  if (productId === null) notFound();

  return (
    <Suspense fallback={null}>
      <ProductPageClient productId={productId} />
    </Suspense>
  );
}
