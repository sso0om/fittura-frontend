import type { OrderSkuReqDto } from "@/api/model";

/**
 * 주문서 진입 소스
 * 값 검증은 서버가 다시 하므로(소유권·재고·가격) 여기서는 형식만 확인
 */
export type OrderSource =
  | { type: "cart"; cartItemIds: number[] }
  | { type: "direct"; orderSkus: OrderSkuReqDto[] };

export const ORDER_PATH = "/order";

const MAX_QUANTITY = 999;

export function buildOrderUrl(source: OrderSource): string {
  const params = new URLSearchParams({ type: source.type });

  if (source.type === "cart") {
    params.set("cartItemIds", source.cartItemIds.join(","));
  } else {
    params.set(
      "skus",
      source.orderSkus.map((s) => `${s.skuId}:${s.quantity}`).join(","),
    );
  }

  return `${ORDER_PATH}?${params.toString()}`;
}

export function parsePositiveInt(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

/** 형식이 잘못됐거나 비어 있으면 null */
export function parseOrderSource(params: {
  get(name: string): string | null;
}): OrderSource | null {
  const type = params.get("type");

  if (type === "cart") {
    const raw = params.get("cartItemIds");
    if (!raw) return null;

    const ids = raw.split(",").map(parsePositiveInt);
    if (ids.some((id) => id === null)) return null;
    return { type: "cart", cartItemIds: ids as number[] };
  }

  if (type === "direct") {
    const raw = params.get("skus");
    if (!raw) return null;

    const orderSkus: OrderSkuReqDto[] = [];
    for (const token of raw.split(",")) {
      const [skuRaw, quantityRaw, ...rest] = token.split(":");
      if (rest.length > 0 || skuRaw == null || quantityRaw == null) return null;

      const skuId = parsePositiveInt(skuRaw);
      const quantity = parsePositiveInt(quantityRaw);
      if (skuId === null || quantity === null || quantity > MAX_QUANTITY) {
        return null;
      }
      orderSkus.push({ skuId, quantity });
    }
    return { type: "direct", orderSkus };
  }

  return null;
}
