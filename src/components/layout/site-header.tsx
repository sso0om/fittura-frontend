"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Search, ShoppingCart, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchForm } from "@/components/layout/search-form";
import { AllCategoriesMenu } from "@/components/layout/all-categories-menu";

/**
 * 1단짜리 헤더
 * 항목: 로고 · 전체 카테고리(드롭다운) · 검색 · 아이콘(마이페이지 → 좋아요 → 장바구니)
 */
export function SiteHeader() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-4 px-6 sm:px-8 lg:px-12">
        <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="검색"
              >
                <Search className="size-5" />
              </Button>
            }
          />
          <SheetContent side="top" className="p-4">
            <SheetHeader className="sr-only">
              <SheetTitle>상품 검색</SheetTitle>
            </SheetHeader>
            <SearchForm
              autoFocus
              onNavigate={() => setMobileSearchOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <Link href="/" className="text-lg font-bold tracking-tight">
          FITTURA
        </Link>

        <AllCategoriesMenu />

        <SearchForm className="hidden max-w-xl flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={
              <Link href="/mypage" aria-label="마이페이지">
                <User className="size-5" />
              </Link>
            }
          />
          {/* 좋아요: 추후 기능 추가 예정 — 현재는 UI만 존재, 클릭 동작 없음 */}
          <Button type="button" variant="ghost" size="icon" aria-label="좋아요">
            <Heart className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={
              <Link href="/cart" aria-label="장바구니">
                <ShoppingCart className="size-5" />
              </Link>
            }
          />
        </div>
      </div>
    </header>
  );
}
