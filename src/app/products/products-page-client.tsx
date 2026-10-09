"use client";

import { useGetProducts1 } from "@/api/generated/product-v1/product-v1";
import { ProductToolbar } from "@/components/product/product-toolbar";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFilterSidebar } from "@/components/product/product-filter-sidebar";
import { CategorySubNav } from "@/components/product/category-sub-nav";
import { CategoryTrail } from "@/components/product/category-trail";
import { useProductListParams } from "@/components/product/use-product-list-params";
import { Pagination } from "@/components/ui/pagination";

export function ProductsPageClient() {
  const {
    categoryId,
    keyword,
    selectedColors,
    selectedMaterials,
    sort,
    size,
    inStockOnly,
    page,
    setColors,
    setMaterials,
    setSort,
    setSize,
    setInStockOnly,
    setPage,
  } = useProductListParams();

  const { data, isPending, isError } = useGetProducts1({
    categoryId,
    keyword,
    inStockOnly,
    colors: selectedColors.length > 0 ? selectedColors : undefined,
    materials: selectedMaterials.length > 0 ? selectedMaterials : undefined,
    page,
    size,
    sort: [sort],
  });

  const productPage = data?.data;
  const products = productPage?.content ?? [];
  const totalCount = productPage?.totalElements ?? 0;
  const totalPages = productPage?.totalPages ?? 0;

  return (
    <div className="mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-8 lg:px-12">
      <CategoryTrail categoryId={categoryId} />

      <div className="flex gap-8">
        <ProductFilterSidebar
          selectedColors={selectedColors}
          selectedMaterials={selectedMaterials}
          onColorsChange={setColors}
          onMaterialsChange={setMaterials}
        />

        <div className="min-w-0 flex-1">
          <CategorySubNav categoryId={categoryId} />

          <ProductToolbar
            totalCount={totalCount}
            sort={sort}
            onSortChange={setSort}
            inStockOnly={inStockOnly}
            onInStockOnlyChange={setInStockOnly}
            pageSize={size}
            onPageSizeChange={setSize}
          />

          <ProductGrid
            products={products}
            isPending={isPending}
            isError={isError}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
