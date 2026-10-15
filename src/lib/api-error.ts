import Axios from "axios";

// 백엔드 RsData 응답 래퍼 형태 (에러 처리용 최소 형태만 정의)
export interface ApiErrorResponse {
  code?: string;
  message?: string;
  data?: unknown;
}

export interface ApiErrorInfo {
  message: string;
  /** /admin 화면에서만 채워지는 상세 (RsData.data) */
  detail?: string;
}

const DEFAULT_ERROR_MESSAGE =
  "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

export interface ParsedApiError extends ApiErrorResponse {
  /** 서버 응답 자체가 없음 (네트워크 오류·타임아웃) */
  noResponse: boolean;
}

/** 화면이 에러 코드로 직접 분기해야 할 때 사용 - axios 에러가 아니면 null */
export function parseApiError(error: unknown): ParsedApiError | null {
  if (!Axios.isAxiosError<ApiErrorResponse>(error)) return null;
  return { ...error.response?.data, noResponse: error.response == null };
}

/**
 * 에러를 사용자에게 보여줄 정보로 변환
 */
export function toApiErrorInfo(error: unknown): ApiErrorInfo | null {
  if (Axios.isCancel(error)) {
    return null;
  }

  if (!Axios.isAxiosError<ApiErrorResponse>(error)) {
    console.error(error);
    return { message: DEFAULT_ERROR_MESSAGE };
  }

  const rsData = error.response?.data;
  const isAdminPage =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin");

  return {
    message: rsData?.message ?? DEFAULT_ERROR_MESSAGE,
    detail:
      isAdminPage && rsData?.data != null
        ? JSON.stringify(rsData.data)
        : undefined,
  };
}
