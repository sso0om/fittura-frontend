"use client";

import { useState } from "react";
import { Armchair, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "cn";

const THUMB_VISIBLE_COUNT = 8;

// 임시 목데이터 (실제 이미지 URL 연동 전 위치·동작 확인용)
const MOCK_GALLERY_IMAGE_COUNT = 10;

/**
 * 상품 상세 이미지 갤러리 — 좌측 썸네일 레일 + 우측 메인 이미지
 * 이미지 목록 조회 API가 아직 없어 목데이터로 위치/동작만 구성
 */
export function ProductGallery() {
  const galleryImages = Array.from(
    { length: MOCK_GALLERY_IMAGE_COUNT },
    (_, index) => index,
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [thumbScrollOffset, setThumbScrollOffset] = useState(0);

  const canScrollUp = thumbScrollOffset > 0;
  const canScrollDown =
    thumbScrollOffset + THUMB_VISIBLE_COUNT < galleryImages.length;
  const hasOverflow = galleryImages.length > THUMB_VISIBLE_COUNT;

  const visibleThumbs = galleryImages.slice(
    thumbScrollOffset,
    thumbScrollOffset + THUMB_VISIBLE_COUNT,
  );

  function handleScrollUp() {
    setThumbScrollOffset((prev) => Math.max(0, prev - 1));
  }

  function handleScrollDown() {
    setThumbScrollOffset((prev) =>
      Math.min(galleryImages.length - THUMB_VISIBLE_COUNT, prev + 1),
    );
  }

  return (
    <div className="flex gap-4">
      {/* 썸네일 레일 */}
      <div className="flex w-[72px] shrink-0 flex-col items-center gap-2">
        {hasOverflow && (
          <button
            type="button"
            onClick={handleScrollUp}
            disabled={!canScrollUp}
            aria-label="이전 이미지"
            className="border-border text-muted-foreground hover:bg-muted flex h-7 w-8 shrink-0 items-center justify-center rounded-lg border disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronUp className="size-3.5" />
          </button>
        )}

        <div className="flex flex-col gap-2">
          {visibleThumbs.map((imageIndex) => (
            <button
              key={imageIndex}
              type="button"
              onMouseEnter={() => setSelectedImageIndex(imageIndex)}
              onClick={() => setSelectedImageIndex(imageIndex)}
              aria-label={`${imageIndex + 1}번 이미지 보기`}
              aria-current={selectedImageIndex === imageIndex}
              className={cn(
                "bg-muted flex size-[72px] shrink-0 items-center justify-center rounded-xl border-[1.5px] transition-opacity",
                selectedImageIndex === imageIndex
                  ? "border-foreground opacity-100"
                  : "border-transparent opacity-55 hover:opacity-80",
              )}
            >
              <Armchair
                className="text-muted-foreground/60 size-6"
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        {hasOverflow && (
          <button
            type="button"
            onClick={handleScrollDown}
            disabled={!canScrollDown}
            aria-label="다음 이미지"
            className="border-border text-muted-foreground hover:bg-muted flex h-7 w-8 shrink-0 items-center justify-center rounded-lg border disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronDown className="size-3.5" />
          </button>
        )}
      </div>

      {/* 메인 이미지 — 호버/클릭한 썸네일이 표시됨 */}
      <div className="bg-muted relative flex aspect-square w-[640px] shrink-0 items-center justify-center rounded-2xl">
        <Armchair
          className="text-muted-foreground/40 size-24"
          strokeWidth={1.2}
        />
        <span className="text-muted-foreground bg-background/90 border-border absolute right-4 bottom-4 rounded-full border px-2.5 py-1 text-xs">
          {selectedImageIndex + 1} / {galleryImages.length}
        </span>
      </div>
    </div>
  );
}
