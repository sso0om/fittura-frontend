import type { OrderPreviewResDto } from "@/api/model";
import { formatPrice } from "@/lib/format";

export interface OrderSummaryProps {
  preview: OrderPreviewResDto;
  /** 배송지 변경 등으로 재계산 중 - 이전 값을 흐리게 표시 */
  isRefreshing: boolean;
  onPay: () => void;
  /** 주문 생성~결제 이동 중 - 중복 주문 방지를 위해 버튼 잠금 */
  isPaying: boolean;
}

/**
 * 결제 금액 요약 - 모든 값은 서버 미리보기 그대로 표시 (클라이언트 재계산 금지)
 * 상품할인은 표시용 차이값(정가 합 - 판매가 합)만 계산
 */
export function OrderSummary({
  preview,
  isRefreshing,
  onPay,
  isPaying,
}: OrderSummaryProps) {
  const originalAmount = preview.totalOriginalAmount ?? 0;
  const productDiscount = originalAmount - (preview.totalAmount ?? 0);
  const couponDiscount = preview.discountAmount ?? 0;
  const totalDiscount = productDiscount + couponDiscount;
  const finalAmount = preview.finalAmount ?? 0;

  return (
    <aside
      className={`border-border sticky top-6 flex h-fit w-[320px] shrink-0 flex-col gap-4 rounded-xl border p-6 transition-opacity ${
        isRefreshing ? "opacity-60" : ""
      }`}
    >
      <h2 className="text-[17px] font-bold">결제 금액</h2>

      <div className="flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">주문금액</span>
          <span>{formatPrice(originalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">배송비</span>
          <span>+ {formatPrice(preview.deliveryFee ?? 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">할인금액</span>
          <span>
            {totalDiscount > 0
              ? `- ${formatPrice(totalDiscount)}`
              : formatPrice(0)}
          </span>
        </div>
        {productDiscount > 0 && (
          <div className="text-muted-foreground flex justify-between pl-3 text-xs">
            <span>상품할인</span>
            <span>- {formatPrice(productDiscount)}</span>
          </div>
        )}
        {couponDiscount > 0 && (
          <div className="text-muted-foreground flex justify-between pl-3 text-xs">
            <span>쿠폰·프로모션 할인</span>
            <span>- {formatPrice(couponDiscount)}</span>
          </div>
        )}
      </div>

      <hr className="border-border" />

      <div className="flex items-center justify-between">
        <span className="text-price text-[15px] font-bold">결제 예정금액</span>
        <span className="text-price text-2xl font-extrabold">
          {formatPrice(finalAmount)}
        </span>
      </div>

      {/* 재계산 중에는 이전 금액이 보이므로 결제 불가 */}
      <button
        type="button"
        disabled={isPaying || isRefreshing}
        onClick={onPay}
        className="bg-primary text-primary-foreground h-[52px] w-full rounded-lg text-[15px] font-bold disabled:pointer-events-none disabled:opacity-50"
      >
        {isPaying ? "결제 진행 중..." : `${formatPrice(finalAmount)} 결제하기`}
      </button>
    </aside>
  );
}
