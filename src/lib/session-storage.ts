/**
 * sessionStorage 안전 접근
 * - SSR(window 없음)이나 저장소 접근이 막힌 환경(시크릿 모드 등)에서는 예외 없이 읽기는 null, 쓰기·삭제는 무시
 * - 저장 실패해도 기능에 영향 없는 값에만 사용
 */
export function readSession(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSession(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // 저장 실패 시 무시
  }
}

export function removeSession(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // 무시
  }
}
