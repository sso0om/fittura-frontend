"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

import { cn } from "cn";
import { Input } from "@/components/ui/input";

interface SearchFormProps {
  className?: string;
  onNavigate?: () => void;
  autoFocus?: boolean;
}

export function SearchForm({
  className,
  onNavigate,
  autoFocus,
}: SearchFormProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = keyword.trim();
    router.push(
      trimmed
        ? `/products?keyword=${encodeURIComponent(trimmed)}`
        : "/products",
    );
    onNavigate?.();
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("relative", className)}
    >
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="상품을 검색해 보세요"
        aria-label="상품 검색"
        className="pl-8"
        autoFocus={autoFocus}
      />
    </form>
  );
}
