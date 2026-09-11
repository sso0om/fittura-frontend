import { ProductStatus, type ProductResDto } from "@/api/model";
import { ProductCard } from "@/components/product/product-card";

export interface ProductGridProps {
  products: ProductResDto[];
  isPending: boolean;
  isError: boolean;
}

/**
 * 상품 카드 그리드
 * 데이터 상태(로딩/에러/빈 목록)만 처리
 * discountRate · rating · reviewCount · liked는 추가 예정
 */
export function ProductGrid({
  products,
  isPending,
  isError,
}: ProductGridProps) {
  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-x-5 gap-y-6 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <div className="bg-muted aspect-square w-full animate-pulse rounded-2xl" />
            <div className="bg-muted h-4 w-4/5 animate-pulse rounded" />
            <div className="bg-muted h-4 w-2/5 animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-muted-foreground py-16 text-center text-sm">
        상품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-muted-foreground py-16 text-center text-sm">
        조건에 맞는 상품이 없습니다.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-6 md:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          href={`/products/${product.id}`}
          title={product.name ?? ""}
          price={product.basePrice ?? 0}
          soldOut={product.isSoldOut ?? false}
          discontinued={product.status === ProductStatus.DISCONTINUED}
          mainImageUrl={product.mainImageUrl}
        />
      ))}
    </div>
  );
}
