import { splitPhoneNumber } from "@/lib/validation";

export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(price)}원`;
}

/**
 * 휴대폰 번호 앞자리를 뺀 나머지에 하이픈 추가 (입력 중에도 사용)
 * - 7자리 이하: 123-4567 / 8자리: 1234-5678
 */
export function formatPhoneBody(digits: string): string {
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

/** 저장된 휴대폰 번호(숫자만) -> 010-1234-5678 */
export function formatPhoneNumber(phoneNumber: string | undefined): string {
  const { prefix, body } = splitPhoneNumber(phoneNumber);
  if (!body) return phoneNumber ?? "";
  return `${prefix}-${formatPhoneBody(body)}`;
}
