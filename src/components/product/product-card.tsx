import Image from "next/image";
import Link from "next/link";
import { Armchair, Heart, Star } from "lucide-react";

import { cn } from "cn";
import { formatPrice } from "@/lib/format";

export interface ProductCardProps {
  href: string;
  title: string;
  /** 최종 판매가 */
  price: number;
  /** 할인 전 정가 - 할인 중이 아니면 생략 */
  originalPrice?: number;
  /** 할인율(%) - 0 이하이면 할인 UI를 표시하지 않음 */
  discountRate?: number;
  rating?: number;
  reviewCount?: number;
  mainImageUrl?: string;
  liked?: boolean;
  onToggleLike?: () => void;
  soldOut?: boolean;
  discontinued?: boolean;
  className?: string;
}

export function ProductCard({
  href,
  title,
  price,
  originalPrice,
  discountRate = 0,
  rating,
  reviewCount,
  mainImageUrl,
  liked = false,
  onToggleLike,
  soldOut = false,
  discontinued = false,
  className,
}: ProductCardProps) {
  const hasDiscount = discountRate > 0;
  const hasRating = rating != null && reviewCount != null;
  const overlayLabel = discontinued ? "품절" : soldOut ? "임시품절" : null;

  return (
    <article className={cn("group relative flex flex-col gap-3", className)}>
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 z-0 rounded-2xl"
      />

      <div className="bg-muted relative aspect-square w-full overflow-hidden rounded-2xl">
        {mainImageUrl ? (
          <Image
            src={mainImageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Armchair
              className="text-muted-foreground/40 size-14"
              strokeWidth={1.5}
            />
          </div>
        )}

        {/* 좋아요 - 추가 예정 (disabled)*/}
        <button
          type="button"
          onClick={onToggleLike}
          disabled={!onToggleLike}
          aria-label={liked ? "찜 해제" : "찜하기"}
          aria-pressed={liked}
          className="focus-visible:ring-ring/50 absolute right-2 bottom-2 z-10 flex size-7 items-center justify-center rounded-full outline-none focus-visible:ring-2 disabled:cursor-default disabled:opacity-60"
        >
          <Heart
            className={cn(
              "size-[21px] drop-shadow-[0_1px_2px_rgb(0_0_0/0.25)]",
              liked
                ? "fill-foreground text-foreground"
                : "fill-background text-foreground",
            )}
            strokeWidth={1.7}
          />
        </button>

        {overlayLabel && (
          <div className="bg-foreground/50 absolute inset-0 z-10 flex items-center justify-center">
            <span className="text-background text-sm font-bold tracking-wide">
              {overlayLabel}
            </span>
          </div>
        )}
      </div>

      <Link
        href={href}
        className="text-foreground relative z-10 line-clamp-2 text-sm leading-[1.45] font-medium"
      >
        {title}
      </Link>

      <div className="flex flex-col gap-[3px]">
        {hasDiscount && originalPrice != null && (
          <span className="text-muted-foreground text-xs line-through">
            {formatPrice(originalPrice)}
          </span>
        )}
        <div className="flex items-baseline gap-1.5">
          {hasDiscount && (
            <span className="text-destructive text-sm font-bold">
              {discountRate}%
            </span>
          )}
          <span className="text-foreground text-base font-bold">
            {formatPrice(price)}
          </span>
        </div>
      </div>

      {hasRating && (
        <div className="text-muted-foreground flex items-center gap-1 text-xs">
          <Star className="fill-foreground text-foreground size-[13px]" />
          <span>{rating}</span>
          <span>({reviewCount})</span>
        </div>
      )}
    </article>
  );
}
