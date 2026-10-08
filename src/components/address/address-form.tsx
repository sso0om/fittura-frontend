"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SearchIcon } from "lucide-react";
import { cn } from "cn";

import {
  useCreateMemberAddress,
  useUpdateMemberAddress,
} from "@/api/generated/memberaddress-v1/memberaddress-v1";
import type { MemberAddressResDto } from "@/api/model";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/common/phone-number-input";
import { AddressDeleteButton } from "@/components/address/address-delete-button";
import {
  PRESET_NAMES,
  addressFormSchema,
  toFormValues,
  type AddressFormValues,
} from "@/components/address/address-form-schema";
import { useInvalidateAddresses } from "@/components/address/use-invalidate-addresses";

// TODO: 우편번호 검색(Daum 우편번호) 연동 전까지 검색 버튼은 고정 주소를 채움
const TEMP_SEARCHED_LOCATION = {
  zipCode: "04524",
  address: "서울특별시 중구 서소문로 127",
  sido: "서울특별시",
  sigungu: "중구",
};

export interface AddressFormProps {
  /** 없으면 등록, 있으면 수정 */
  address?: MemberAddressResDto;
  /** 등록된 배송지가 하나도 없는 상태의 등록 - 들어오는 화면이 판단해서 넘김 */
  isFirstAddress?: boolean;
  /** 수정 대상이 유일한 배송지인지 - 기본 배송지라도 마지막 하나면 삭제 가능 */
  isOnlyAddress?: boolean;
  /** 저장/삭제 후 */
  onSaved: () => void;
  onDeleted?: (addressId: number) => void;
}

/** 배송지 등록/수정 폼 */
export function AddressForm({
  address,
  isFirstAddress = false,
  isOnlyAddress = false,
  onSaved,
  onDeleted = () => {},
}: AddressFormProps) {
  const addressId = address?.addressId;
  const isEdit = addressId != null;

  // 서버 규칙과 동일: 다른 배송지가 있으면 기본 배송지는 삭제 불가
  const canDelete = !address?.defaultAddress || isOnlyAddress;

  /**
   * 기본 배송지 체크 고정 사유 - 서버 규칙(기본 배송지는 항상 1개)을 화면에 미리 반영
   * - 첫 배송지: 서버가 기본 배송지로 저장
   * - 기존 기본 배송지 수정: 해제 불가 (다른 배송지를 기본으로 지정해야 해제됨)
   */
  const defaultLockReason = isFirstAddress
    ? "첫 배송지는 기본 배송지로 저장돼요."
    : address?.defaultAddress
      ? "다른 배송지를 기본으로 지정하면 해제돼요."
      : null;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    mode: "onChange",
    defaultValues: toFormValues(address),
  });

  // 별칭: 프리셋 버튼 또는 직접입력
  const [isCustomName, setIsCustomName] = useState(
    address?.addressName != null &&
      !PRESET_NAMES.some((name) => name === address.addressName),
  );
  const [addressName, zipCode, roadAddress] = useWatch({
    control,
    name: ["addressName", "zipCode", "address"],
  });

  function selectPresetName(name: string) {
    setIsCustomName(false);
    setValue("addressName", name, { shouldValidate: true });
  }

  function selectCustomName() {
    setIsCustomName(true);
    setValue("addressName", "", { shouldValidate: true });
  }

  function handleSearchAddress() {
    for (const [key, value] of Object.entries(TEMP_SEARCHED_LOCATION)) {
      setValue(key as keyof typeof TEMP_SEARCHED_LOCATION, value, {
        shouldValidate: true,
      });
    }
  }

  const invalidateAddresses = useInvalidateAddresses();
  const mutationOptions = {
    mutation: {
      onSuccess: async () => {
        await invalidateAddresses();
        onSaved();
      },
    },
  };
  const { mutate: createAddress, isPending: isCreating } =
    useCreateMemberAddress(mutationOptions);
  const { mutate: updateAddress, isPending: isUpdating } =
    useUpdateMemberAddress(mutationOptions);
  const isSaving = isCreating || isUpdating;

  function onSubmit(values: AddressFormValues) {
    const data = {
      ...values,
      defaultAddress: defaultLockReason != null || values.defaultAddress,
    };

    if (isEdit) {
      updateAddress({ addressId, data });
      return;
    }
    createAddress({ data });
  }

  const inputClassName = "bg-muted/40 h-11 rounded-md px-4";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* 주소 별칭 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[15px] font-bold">주소 별칭</h3>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_NAMES.map((name) => (
            <NameButton
              key={name}
              selected={!isCustomName && addressName === name}
              onClick={() => selectPresetName(name)}
            >
              {name}
            </NameButton>
          ))}
          <NameButton selected={isCustomName} onClick={selectCustomName}>
            직접입력
          </NameButton>
        </div>
        {isCustomName && (
          <Input
            {...register("addressName")}
            placeholder="주소 별칭을 입력해주세요."
            maxLength={50}
            className={inputClassName}
          />
        )}
      </section>

      {/* 배송 주소 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[15px] font-bold">배송 주소</h3>
        <button
          type="button"
          onClick={handleSearchAddress}
          className="bg-muted/40 border-input flex h-11 items-center justify-between rounded-md border px-4 text-sm"
        >
          <span className={cn(!zipCode && "text-muted-foreground")}>
            {zipCode || "우편번호 검색"}
          </span>
          <SearchIcon className="size-5" />
        </button>
        <Input
          value={roadAddress}
          readOnly
          tabIndex={-1}
          placeholder="주소"
          className={inputClassName}
        />
        <Input
          {...register("addressDetail")}
          placeholder="건물명, 동, 층, 호수 등의 상세주소를 입력해주세요."
          maxLength={255}
          className={inputClassName}
        />
        <Controller
          control={control}
          name="defaultAddress"
          render={({ field }) => (
            <label className="flex w-fit items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={defaultLockReason != null || field.value}
                disabled={defaultLockReason != null}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
              />
              기본 배송지로 저장
            </label>
          )}
        />
        {defaultLockReason && (
          <p className="text-muted-foreground -mt-1 text-xs">
            {defaultLockReason}
          </p>
        )}
      </section>

      {/* 받는 분 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[15px] font-bold">받는 분</h3>
        <Input
          {...register("receiverName")}
          placeholder="특수문자는 입력할 수 없어요."
          maxLength={100}
          aria-invalid={errors.receiverName != null}
          className={inputClassName}
        />
        <FieldError message={errors.receiverName?.message} />
      </section>

      {/* 휴대폰 번호 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[15px] font-bold">휴대폰 번호</h3>
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field }) => (
            <PhoneNumberInput {...field} invalid={errors.phoneNumber != null} />
          )}
        />
        <FieldError message={errors.phoneNumber?.message} />
      </section>

      <div className="flex flex-col gap-2">
        <div
          className={cn(
            "grid gap-2",
            isEdit ? "grid-cols-[1fr_2fr]" : "grid-cols-1",
          )}
        >
          {isEdit && (
            <AddressDeleteButton
              addressId={addressId}
              disabled={!canDelete}
              onDeleted={onDeleted}
              onDone={onSaved}
            />
          )}
          <button
            type="submit"
            disabled={!isValid || isSaving}
            className="bg-foreground text-background disabled:bg-muted disabled:text-muted-foreground h-12 w-full rounded-md text-base font-bold"
          >
            저장
          </button>
        </div>
        {isEdit && !canDelete && (
          <p className="text-muted-foreground text-xs">
            기본 배송지는 삭제할 수 없어요. 다른 배송지를 기본으로 지정한 뒤
            삭제해 주세요.
          </p>
        )}
      </div>
    </form>
  );
}

function NameButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-input h-11 rounded-md border text-sm font-semibold",
        selected
          ? "bg-foreground text-background border-foreground"
          : "text-muted-foreground bg-background",
      )}
    >
      {children}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive -mt-1 text-xs">{message}</p>;
}
