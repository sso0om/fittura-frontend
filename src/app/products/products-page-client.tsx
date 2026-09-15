"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useState } from "react";

import { useCategoryTree } from "@/components/layout/use-category-tree";
import { useGetProducts1 } from "@/api/generated/product-v1/product-v1";
import type { CategoryResDto } from "@/api/model";
import {
  ProductToolbar,
  type ProductSort,
} from "@/components/product/product-toolbar";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFilterSidebar } from "@/components/product/product-filter-sidebar";
import { CategorySubNav } from "@/components/product/category-sub-nav";
import { Pagination } from "@/components/ui/pagination";

const DEFAULT_SORT: ProductSort = "createdDate,desc";

export function ProductsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("categoryId");
  const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;

  const selectedColors = searchParams.getAll("colors").map(Number);
  const selectedMaterials = searchParams.getAll("materials").map(Number);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState<ProductSort>(DEFAULT_SORT);
  const [activeOnly, setActiveOnly] = useState(false);

  // 카테고리 변경 시 필터/정렬/페이지 초기화
  const [trackedCategoryId, setTrackedCategoryId] = useState(categoryId);
  if (categoryId !== trackedCategoryId) {
    setTrackedCategoryId(categoryId);
    setActiveOnly(false);
    setSort(DEFAULT_SORT);
    setPage(0);
  }

  function updateFilterParam(key: "colors" | "materials", ids: number[]) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    ids.forEach((id) => params.append(key, String(id)));
    router.replace(`/products?${params.toString()}`, { scroll: false });
    setPage(0);
  }

  function handleColorsChange(colorIds: number[]) {
    updateFilterParam("colors", colorIds);
  }

  function handleMaterialsChange(materialIds: number[]) {
    updateFilterParam("materials", materialIds);
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

  function handleSortChange(nextSort: ProductSort) {
    setSort(nextSort);
    setPage(0);
  }

  function handleActiveOnlyChange(next: boolean) {
    setActiveOnly(next);
    setPage(0);
  }

  function handlePageSizeChange(nextSize: number) {
    setSize(nextSize);
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

      <div className="flex gap-8">
        <ProductFilterSidebar
          selectedColors={selectedColors}
          selectedMaterials={selectedMaterials}
          onColorsChange={handleColorsChange}
          onMaterialsChange={handleMaterialsChange}
        />

        <div className="min-w-0 flex-1">
          <CategorySubNav categoryId={categoryId} />

          <ProductToolbar
            totalCount={totalCount}
            sort={sort}
            onSortChange={handleSortChange}
            activeOnly={activeOnly}
            onActiveOnlyChange={handleActiveOnlyChange}
            pageSize={size}
            onPageSizeChange={handlePageSizeChange}
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
