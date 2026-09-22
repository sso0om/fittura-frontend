"use client"

import * as React from "react"
import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import { cn } from "cn"
import { Minus, Plus } from "lucide-react"

/**
 * shadcn 레지스트리(base-nova)에 number-field가 없어 기존 ui/* 컨벤션에 맞춰 직접 작성
 * Base UI NumberField(Root/Group/Decrement/Input/Increment) 래핑
 */

function NumberField({ ...props }: NumberFieldPrimitive.Root.Props) {
  return <NumberFieldPrimitive.Root data-slot="number-field" {...props} />
}

function NumberFieldGroup({
  className,
  ...props
}: NumberFieldPrimitive.Group.Props) {
  return (
    <NumberFieldPrimitive.Group
      data-slot="number-field-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

const stepperButtonClassName =
  "flex size-7 shrink-0 items-center justify-center rounded-md border border-border outline-none select-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5"

function NumberFieldDecrement({
  className,
  children,
  ...props
}: NumberFieldPrimitive.Decrement.Props) {
  return (
    <NumberFieldPrimitive.Decrement
      data-slot="number-field-decrement"
      aria-label="감소"
      className={cn(stepperButtonClassName, className)}
      {...props}
    >
      {children ?? <Minus />}
    </NumberFieldPrimitive.Decrement>
  )
}

function NumberFieldIncrement({
  className,
  children,
  ...props
}: NumberFieldPrimitive.Increment.Props) {
  return (
    <NumberFieldPrimitive.Increment
      data-slot="number-field-increment"
      aria-label="증가"
      className={cn(stepperButtonClassName, className)}
      {...props}
    >
      {children ?? <Plus />}
    </NumberFieldPrimitive.Increment>
  )
}

function NumberFieldInput({
  className,
  ...props
}: NumberFieldPrimitive.Input.Props) {
  return (
    <NumberFieldPrimitive.Input
      data-slot="number-field-input"
      className={cn(
        "h-7 w-10 min-w-0 rounded-md bg-transparent text-center text-sm tabular-nums outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

interface NumberFieldStepperProps
  extends Omit<
    NumberFieldPrimitive.Root.Props,
    "value" | "defaultValue" | "onValueChange" | "onValueCommitted"
  > {
  value: number
  /** 확정된 값이 기존 value와 다를 때만 호출 (버튼 뗄 때 / 입력 후 blur / 키보드) */
  onValueCommit: (value: number) => void
}

/**
 * −/입력/+ 조합 스테퍼
 * - 입력 중 값은 내부 draft로만 관리하고, 확정(commit) 시점에만 부모에 알림
 *   -> 서버 반영(API 호출)이 필요한 곳에서도 타이핑마다 호출되지 않음
 * - 비우거나 min 미만으로 확정하면 기존 value로 되돌림
 * - 부모 value가 바뀌면(재조회 등) draft를 동기화
 */
function NumberFieldStepper({
  value,
  onValueCommit,
  min,
  className,
  "aria-label": ariaLabel,
  ...props
}: NumberFieldStepperProps) {
  const [draft, setDraft] = React.useState<number | null>(value)
  const [syncedValue, setSyncedValue] = React.useState(value)

  if (value !== syncedValue) {
    setSyncedValue(value)
    setDraft(value)
  }

  function handleValueCommitted(next: number | null) {
    if (next == null || (min != null && next < min)) {
      setDraft(value)
      return
    }
    if (next !== value) onValueCommit(next)
  }

  return (
    <NumberField
      value={draft}
      min={min}
      onValueChange={setDraft}
      onValueCommitted={handleValueCommitted}
      {...props}
    >
      <NumberFieldGroup className={className}>
        <NumberFieldDecrement />
        {/* 스크린리더가 읽는 대상은 input(spinbutton)이라 aria-label은 input에 전달 */}
        <NumberFieldInput aria-label={ariaLabel} />
        <NumberFieldIncrement />
      </NumberFieldGroup>
    </NumberField>
  )
}

export {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldStepper,
}
