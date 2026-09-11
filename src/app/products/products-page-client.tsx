"use client";

import { useSearchParams } from "next/navigation";
import { Fragment, useState } from "react";

import { useCategoryTree } from "@/components/layout/use-category-tree";
import { useGetProducts1 } from "@/api/generated/product-v1/product-v1";
import type { CategoryResDto } from "@/api/model";
import {
  ProductToolbar,
  type ProductSort,
} from "@/components/product/product-toolbar";
import { ProductGrid } from "@/components/product/product-grid";
import { CategorySubNav } from "@/components/product/category-sub-nav";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 20;

export function ProductsPageClient() {
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("categoryId");
  const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;

  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<ProductSort>("createdDate,desc");
  const [activeOnly, setActiveOnly] = useState(false);

  // 카테고리 변경 시 필터/페이지 초기화
  const [trackedCategoryId, setTrackedCategoryId] = useState(categoryId);
  if (categoryId !== trackedCategoryId) {
    setTrackedCategoryId(categoryId);
    setActiveOnly(false);
    setPage(0);
  }

  const { data: categoryTree } = useCategoryTree();

  const categoryTrail: CategoryResDto[] = [];
  if (categoryTree && categoryId != null) {
    let node: CategoryResDto | undefined = categoryTree.byId.get(categoryId);
    while (node) {
      categoryTrail.unshift(node);
      node =
        node.parentId != null ? categoryTree.byId.get(node.parentId) : undefined;
    }
  }

  const { data, isPending, isError } = useGetProducts1({
    categoryId,
    inStockOnly: activeOnly,
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

  function handleActiveOnlyChange(next: boolean) {
    setActiveOnly(next);
    setPage(0);
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-8 lg:px-12">
      {categoryTrail.length > 0 && (
        <nav
          aria-label="현재 위치"
          className="text-muted-foreground mb-5 flex items-center gap-1.5 text-[13px]"
        >
          {categoryTrail.map((category, index) => (
            <Fragment key={category.id}>
              {index > 0 && <span aria-hidden>&gt;</span>}
              <span
                className={
                  index === categoryTrail.length - 1
                    ? "text-foreground font-semibold"
                    : undefined
                }
              >
                {category.name}
              </span>
            </Fragment>
          ))}
        </nav>
      )}

      <CategorySubNav categoryId={categoryId} />

      <div className="flex gap-8">
        {/* TODO: 필터 UI는 다음 작업에서 구현 예정 — 지금은 위치(왼쪽 15%)만 고정 */}
        <aside className="border-border text-muted-foreground w-[15%] shrink-0 rounded-lg border border-dashed p-4 text-xs">
          필터 영역 (준비 중)
        </aside>

        <div className="min-w-0 flex-1">
          <ProductToolbar
            totalCount={totalCount}
            sort={sort}
            onSortChange={handleSortChange}
            activeOnly={activeOnly}
            onActiveOnlyChange={handleActiveOnlyChange}
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
