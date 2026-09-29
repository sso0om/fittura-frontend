import { z } from "zod";

import type { MemberAddressResDto } from "@/api/model";
import {
  addressDetailSchema,
  phoneNumberSchema,
  plainText,
  zipCodeSchema,
} from "@/lib/validation";

/** 주소 별칭 프리셋 - 그 외 값은 직접입력 */
export const PRESET_NAMES = ["우리집", "회사"] as const;

export const addressFormSchema = z.object({
  addressName: z.string().trim().min(1, "주소 별칭을 입력해주세요.").max(50),
  zipCode: zipCodeSchema,
  address: z.string().min(1),
  sido: z.string().min(1),
  sigungu: z.string().min(1),
  addressDetail: addressDetailSchema,
  defaultAddress: z.boolean(),
  receiverName: plainText({
    max: 100,
    requiredMessage: "받는 분을 입력해주세요.",
  }),
  phoneNumber: phoneNumberSchema,
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;

/** 등록은 빈 값, 수정은 기존 배송지 값으로 폼 초기값 생성 */
export function toFormValues(address?: MemberAddressResDto): AddressFormValues {
  return {
    addressName: address?.addressName ?? PRESET_NAMES[0],
    zipCode: address?.zipCode ?? "",
    address: address?.address ?? "",
    sido: address?.sido ?? "",
    sigungu: address?.sigungu ?? "",
    addressDetail: address?.addressDetail ?? "",
    defaultAddress: address?.defaultAddress ?? false,
    receiverName: address?.receiverName ?? "",
    phoneNumber: address?.phoneNumber ?? "",
  };
}
