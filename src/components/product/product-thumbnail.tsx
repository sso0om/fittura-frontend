import type { ReactNode } from "react";
import Image from "next/image";
import { Armchair } from "lucide-react";

import { cn } from "cn";

export interface ProductThumbnailProps {
  /** 이미지가 없으면 아이콘으로 대체 */
  src?: string;
  /** next/image sizes - 화면에서 차지하는 실제 너비 기준 */
  sizes: string;
  /** 컨테이너 크기·모서리 (예: "size-[80px] rounded-lg") */
  className?: string;
  imageClassName?: string;
  /** 폴백 아이콘 크기 */
  iconClassName?: string;
  /** 이미지 위에 겹쳐 올릴 요소 (찜 버튼, 품절 표시 등) */
  children?: ReactNode;
}

/** 상품 썸네일 - 이미지 또는 폴백 아이콘, 크기·모서리는 호출부에서 지정 */
export function ProductThumbnail({
  src,
  sizes,
  className,
  imageClassName,
  iconClassName = "size-8",
  children,
}: ProductThumbnailProps) {
  return (
    <div className={cn("bg-muted relative overflow-hidden", className)}>
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <Armchair
            className={cn("text-muted-foreground/40", iconClassName)}
            strokeWidth={1.5}
          />
        </div>
      )}
      {children}
    </div>
  );
}
