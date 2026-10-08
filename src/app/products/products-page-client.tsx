"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useGetProducts1 } from "@/api/generated/product-v1/product-v1";
import {
  ProductToolbar,
  type ProductSort,
} from "@/components/product/product-toolbar";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFilterSidebar } from "@/components/product/product-filter-sidebar";
import { CategorySubNav } from "@/components/product/category-sub-nav";
import { CategoryTrail } from "@/components/product/category-trail";
import { Pagination } from "@/components/ui/pagination";
import { parsePositiveInt, parsePositiveIntList } from "@/lib/validation";

const DEFAULT_SORT: ProductSort = "createdDate,desc";

export function ProductsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 형식이 잘못된 파라미터는 무시 (categoryId가 잘못되면 전체 목록)
  const categoryId =
    parsePositiveInt(searchParams.get("categoryId") ?? "") ?? undefined;

  // 헤더 검색창(search-form)에서 /products?keyword= 로 이동
  const keyword = searchParams.get("keyword")?.trim() || undefined;

  const selectedColors = parsePositiveIntList(searchParams.getAll("colors"));
  const selectedMaterials = parsePositiveIntList(
    searchParams.getAll("materials"),
  );

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState<ProductSort>(DEFAULT_SORT);
  const [inStockOnly, setInStockOnly] = useState(false);

  // 카테고리 변경 시 필터/정렬/페이지 초기화
  const [trackedCategoryId, setTrackedCategoryId] = useState(categoryId);
  if (categoryId !== trackedCategoryId) {
    setTrackedCategoryId(categoryId);
    setInStockOnly(false);
    setSort(DEFAULT_SORT);
    setPage(0);
  }

  // 검색어 변경 시 첫 페이지부터
  const [trackedKeyword, setTrackedKeyword] = useState(keyword);
  if (keyword !== trackedKeyword) {
    setTrackedKeyword(keyword);
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

  function handleSortChange(nextSort: ProductSort) {
    setSort(nextSort);
    setPage(0);
  }

  function handleInStockOnlyChange(next: boolean) {
    setInStockOnly(next);
    setPage(0);
  }

  function handlePageSizeChange(nextSize: number) {
    setSize(nextSize);
    setPage(0);
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-8 lg:px-12">
      <CategoryTrail categoryId={categoryId} />

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
            inStockOnly={inStockOnly}
            onInStockOnlyChange={handleInStockOnlyChange}
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
