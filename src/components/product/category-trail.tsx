"use client";

import { Fragment } from "react";
import Link from "next/link";

import { cn } from "cn";
import { useCategoryTree } from "@/components/layout/use-category-tree";
import type { CategoryResDto } from "@/api/model";

export interface CategoryTrailProps {
  categoryId?: number;
  className?: string;
}

/**
 * 카테고리 현재 위치(breadcrumb)
 * 1뎁스(최상위)는 텍스트 고정, 2뎁스부터는 Link로 해당 카테고리 상품 목록으로 이동 가능
 */
export function CategoryTrail({ categoryId, className }: CategoryTrailProps) {
  const { data: categoryTree } = useCategoryTree();

  const trail: CategoryResDto[] = [];
  if (categoryTree && categoryId != null) {
    let node: CategoryResDto | undefined = categoryTree.byId.get(categoryId);
    while (node) {
      trail.unshift(node);
      node =
        node.parentId != null ? categoryTree.byId.get(node.parentId) : undefined;
    }
  }

  if (trail.length === 0) return null;

  return (
    <nav
      aria-label="현재 위치"
      className={cn(
        "text-muted-foreground mb-5 flex items-center gap-1.5 text-[13px]",
        className,
      )}
    >
      {trail.map((category, index) => {
        const isLast = index === trail.length - 1;
        const labelClassName = isLast
          ? "text-foreground font-semibold"
          : undefined;

        return (
          <Fragment key={category.id}>
            {index > 0 && <span aria-hidden>&gt;</span>}
            {index === 0 ? (
              <span className={labelClassName}>{category.name}</span>
            ) : (
              <Link
                href={`/products?categoryId=${category.id}`}
                className={cn(
                  "hover:text-foreground transition-colors",
                  labelClassName,
                )}
              >
                {category.name}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
