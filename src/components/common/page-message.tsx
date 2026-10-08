import Link from "next/link";

import { cn } from "cn";

export interface PageMessageProps {
  message: string;
  /** 안내 아래 이동 링크 - 없으면 문구만 표시 */
  link?: { href: string; label: string };
  /** 컨테이너 폭(max-w-*) 지정용 */
  className?: string;
}

/** 잘못된 접근·조회 실패 등 페이지 단위 안내 (문구 + 이동 링크) */
export function PageMessage({ message, link, className }: PageMessageProps) {
  return (
    <div className={cn("mx-auto w-full px-6 py-16 text-center", className)}>
      <p className={cn("text-muted-foreground text-sm", link && "mb-4")}>
        {message}
      </p>
      {link && (
        <Link href={link.href} className="text-sm underline underline-offset-2">
          {link.label}
        </Link>
      )}
    </div>
  );
}
