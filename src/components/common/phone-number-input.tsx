"use client";

import { cn } from "cn";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPhoneBody } from "@/lib/format";
import { PHONE_PREFIXES, splitPhoneNumber } from "@/lib/validation";

export interface PhoneNumberInputProps {
  /** 숫자만 이어 붙인 전체 번호 (예: 01012345678) - 서버로 보내는 형태 그대로 */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  ref?: React.Ref<HTMLInputElement>;
  invalid?: boolean;
  className?: string;
}

/**
 * 휴대폰 번호 입력 - 앞자리 선택 + 나머지 번호
 * - 값은 숫자만 보관, 화면에는 하이픈을 붙여 표시 (1234-5678)
 * - react-hook-form에서는 Controller의 field를 그대로 넘겨 사용
 */
export function PhoneNumberInput({
  value,
  onChange,
  onBlur,
  name,
  ref,
  invalid = false,
  className,
}: PhoneNumberInputProps) {
  const { prefix, body } = splitPhoneNumber(value);
  const fieldClassName = "bg-muted/40 rounded-md";

  return (
    <div className={cn("flex gap-2", className)}>
      <Select
        items={PHONE_PREFIXES.map((p) => ({ value: p, label: p }))}
        value={prefix}
        onValueChange={(nextPrefix) => {
          if (nextPrefix != null) onChange(nextPrefix + body);
        }}
      >
        <SelectTrigger
          aria-label="휴대폰 번호 앞자리"
          className={cn(fieldClassName, "w-28 px-4 data-[size=default]:h-11")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PHONE_PREFIXES.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        name={name}
        ref={ref}
        value={formatPhoneBody(body)}
        onChange={(e) =>
          onChange(prefix + e.target.value.replace(/\D/g, "").slice(0, 8))
        }
        onBlur={onBlur}
        inputMode="numeric"
        placeholder="번호를 입력해주세요."
        aria-invalid={invalid}
        className={cn(fieldClassName, "h-11 flex-1 px-4")}
      />
    </div>
  );
}
