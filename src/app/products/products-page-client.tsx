"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { useCategoryTree } from "@/components/layout/use-category-tree";
import { useGetProducts1 } from "@/api/generated/product-v1/product-v1";
import { ProductStatus } from "@/api/model";
import {
  ProductToolbar,
  type ProductSort,
} from "@/components/product/product-toolbar";
import { ProductGrid } from "@/components/product/product-grid";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 20;

export function ProductsPageClient() {
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("categoryId");
  const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;

  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<ProductSort>("createdDate,desc");

  const { data: categoryTree } = useCategoryTree();
  const currentCategory = categoryTree
    ? [...categoryTree.childrenByParentId.values()]
        .flat()
        .find((category) => category.id === categoryId)
    : undefined;
  const parentCategory = categoryTree?.topLevel.find(
    (category) => category.id === currentCategory?.parentId,
  );

  const { data, isPending, isError } = useGetProducts1({
    categoryId,
    statuses: [ProductStatus.ACTIVE],
    page,
    size: PAGE_SIZE,
    sort: [sort],
  });

  const productPage = data?.data;
  const products = productPage?.content ?? [];
  const totalCount = productPage?.totalElements ?? 0;
  const totalPages = productPage?.totalPages ?? 0;

  function handleSortChange(nextSort: ProductSort) {
    setSort(nextSort);
    setPage(0);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {(parentCategory ?? currentCategory) && (
        <nav
          aria-label="현재 위치"
          className="text-muted-foreground mb-5 flex items-center gap-1.5 text-[13px]"
        >
          {parentCategory && <span>{parentCategory.name}</span>}
          {parentCategory && currentCategory && <span>/</span>}
          {currentCategory && (
            <span className="text-foreground font-semibold">
              {currentCategory.name}
            </span>
          )}
        </nav>
      )}

      <ProductToolbar
        totalCount={totalCount}
        sort={sort}
        onSortChange={handleSortChange}
      />

      <ProductGrid
        products={products}
        isPending={isPending}
        isError={isError}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
