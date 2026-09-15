"use client";

import Link from "next/link";
import { useState } from "react";

import { cn } from "cn";
import { useCategoryTree } from "@/components/layout/use-category-tree";

/**
 * "전체 카테고리" 버튼 + 2단 드롭다운 메뉴
 * 뎁스3 이하 탐색은 상품 목록 페이지 자체에서 처리
 */
export function AllCategoriesMenu() {
  const { data } = useCategoryTree();
  const topLevel = data?.topLevel ?? [];

  const [hoverOpen, setHoverOpen] = useState(false);
  const [clickOpen, setClickOpen] = useState(false);
  const open = hoverOpen || clickOpen;

  const [activeId, setActiveId] = useState<number | null>(null);

  const activeCategory =
    topLevel.find((category) => category.id === activeId) ?? topLevel[0];
  const children = activeCategory
    ? (data?.childrenByParentId.get(activeCategory.id as number) ?? [])
    : [];

  function close() {
    setHoverOpen(false);
    setClickOpen(false);
  }

  if (topLevel.length === 0) {
    return (
      <span className="text-muted-foreground hidden text-sm font-medium md:inline-block">
        전체 카테고리
      </span>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
    >
      <button
        type="button"
        onClick={() => setClickOpen((prev) => !prev)}
        className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
      >
        전체 카테고리
      </button>

      {open && (
        <>
          {/* 바깥 영역 클릭 시 닫히도록 하는 투명 오버레이 (모바일 탭 대응) */}
          <div
            className="fixed inset-0 z-40"
            onClick={close}
            aria-hidden="true"
          />
          <div className="bg-background absolute top-full left-0 z-50 flex w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-lg border shadow-lg">
            <ul className="bg-muted/40 w-[130px] shrink-0 border-r py-2">
              {topLevel.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveId(category.id ?? null)}
                    onClick={() => setActiveId(category.id ?? null)}
                    className={cn(
                      "block w-full px-4 py-2.5 text-left text-sm",
                      activeCategory?.id === category.id
                        ? "bg-foreground text-background font-medium"
                        : "text-foreground/80 hover:bg-muted",
                    )}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
            <ul className="flex-1 py-2">
              {children.length === 0 && (
                <li className="text-muted-foreground px-4 py-2.5 text-sm">
                  하위 카테고리 없음
                </li>
              )}
              {children.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/products?categoryId=${category.id}`}
                    onClick={close}
                    className="text-foreground/80 hover:bg-muted block px-4 py-2.5 text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
