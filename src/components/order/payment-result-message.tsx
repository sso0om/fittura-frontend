import Link from "next/link";

import { Button } from "@/components/ui/button";

interface PaymentResultMessageProps {
  title: string;
  description: string;
  allowReorder?: boolean;
}

export function PaymentResultMessage({
  title,
  description,
  allowReorder = true,
}: PaymentResultMessageProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-col items-center gap-3 px-6 py-24 text-center">
      <h1 className="text-xl font-extrabold">{title}</h1>
      <p className="text-muted-foreground text-sm">{description}</p>
      <div className="mt-4 flex gap-2">
        <Button
          variant={allowReorder ? "outline" : "default"}
          className="h-10 px-5"
          nativeButton={false}
          render={<Link href="/products">쇼핑 계속하기</Link>}
        />
        {allowReorder && (
          <Button
            className="h-10 px-5"
            nativeButton={false}
            render={<Link href="/cart">장바구니로 이동</Link>}
          />
        )}
      </div>
    </div>
  );
}
