import { z } from "zod";

/**
 * 폼 공통 검증 규칙 (zod)
 * - 백엔드 요청 DTO 검증과 같은 기준을 유지
 */

// ========== 일반 텍스트 ==========

/** 문자(모든 언어), 숫자, 공백만 허용 - 특수문자 불가 */
const PLAIN_TEXT_PATTERN = /^[\p{L}\p{N}\s]+$/u;

/**
 * 특수문자 없는 필수 텍스트
 * - 외국어 이름, 띄어쓰기 포함 닉네임 등을 받기 위해 한글/영어로 제한하지 않음
 * - 앞뒤 공백 제거 후 빈 값이면 필수 오류
 */
export function plainText({
  max,
  requiredMessage,
}: {
  max: number;
  requiredMessage: string;
}) {
  return z
    .string()
    .trim()
    .min(1, requiredMessage)
    .max(max, `${max}자 이하로 입력해주세요.`)
    .regex(PLAIN_TEXT_PATTERN, "특수문자는 입력할 수 없어요.");
}

// ========== 휴대폰 번호 ==========

export const PHONE_PREFIXES = ["010", "011", "016", "017", "018", "019"];

/** 숫자만 이어 붙인 전체 번호 - 앞자리(목록 중 하나) + 7~8자리 */
export const phoneNumberSchema = z
  .string()
  .regex(
    new RegExp(`^(${PHONE_PREFIXES.join("|")})\\d{7,8}$`),
    "7~8자리 번호를 입력해주세요.",
  );

/** 번호를 앞자리/나머지로 분리 - 앞자리가 목록에 없으면 기본 앞자리 */
export function splitPhoneNumber(phoneNumber: string | undefined): {
  prefix: string;
  body: string;
} {
  const phone = phoneNumber ?? "";
  const prefix = PHONE_PREFIXES.find((p) => phone.startsWith(p));
  return prefix
    ? { prefix, body: phone.slice(prefix.length) }
    : { prefix: PHONE_PREFIXES[0], body: "" };
}

// ========== 주소 ==========

export const zipCodeSchema = z
  .string()
  .regex(/^\d{5}$/, "우편번호를 검색해주세요.");

export const addressDetailSchema = z.string().max(255);
