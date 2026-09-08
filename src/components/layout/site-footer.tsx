"use client";

import Link from "next/link";

import { useCategoryTree } from "@/components/layout/use-category-tree";

export function SiteFooter() {
  const { data } = useCategoryTree();
  const firstCategory = data?.topLevel[0];

  return (
    <footer className="bg-muted/30 border-t">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-bold tracking-tight">FITTURA</p>
          <p className="text-muted-foreground mt-2 text-sm">
            완제품부터 상판·하판·다리까지.<br/> 원하는 조합으로 완성하는 가구
            쇼핑몰
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">쇼핑</p>
          <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
            <li>
              {firstCategory ? (
                <Link
                  href={`/products?categoryId=${firstCategory.id}`}
                  className="hover:text-foreground"
                >
                  쇼핑하기
                </Link>
              ) : (
                <span>쇼핑하기</span>
              )}
            </li>
            <li>
              <Link href="/cart" className="hover:text-foreground">
                장바구니
              </Link>
            </li>
            <li>
              <Link href="/mypage" className="hover:text-foreground">
                마이페이지
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">고객센터</p>
          <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
            <li>운영시간 평일 10:00 - 18:00</li>
            <li>1:1 문의는 마이페이지에서 접수해 주세요.</li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <p className="text-muted-foreground mx-auto max-w-7xl px-4 py-4 text-xs sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} FITTURA. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
