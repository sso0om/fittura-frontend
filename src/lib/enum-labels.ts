import {
  AttributeKey,
  CategoryStatus,
  ProductStatus,
  ProductType,
  SkuStatus,
} from "@/api/model";

/**
 * 백엔드에서 enum 값이 추가/변경되면 이 파일도 같이 업데이트 필요
 */

export const categoryStatusLabel = {
  [CategoryStatus.ACTIVE]: "활성화",
  [CategoryStatus.DISABLED]: "비활성화",
  [CategoryStatus.ARCHIVED]: "삭제",
} satisfies Record<CategoryStatus, string>;

export const productStatusLabel = {
  [ProductStatus.ACTIVE]: "판매 중",
  [ProductStatus.DISABLED]: "비활성",
  [ProductStatus.DISCONTINUED]: "품절",
  [ProductStatus.ARCHIVED]: "삭제",
} satisfies Record<ProductStatus, string>;

export const productTypeLabel = {
  [ProductType.COMPLETE]: "완성품",
  [ProductType.COMPONENT]: "단품/부품",
} satisfies Record<ProductType, string>;

export const skuStatusLabel = {
  [SkuStatus.ACTIVE]: "판매 중",
  [SkuStatus.SOLDOUT]: "일시 품절",
  [SkuStatus.DISCONTINUED]: "품절",
  [SkuStatus.ARCHIVED]: "삭제",
} satisfies Record<SkuStatus, string>;

export const attributeKeyLabel = {
  [AttributeKey.SIZE_LABEL]: "SIZE",
} satisfies Record<AttributeKey, string>;
