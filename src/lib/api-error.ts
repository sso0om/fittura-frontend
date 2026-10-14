import Axios from "axios";

// 백엔드 RsData 응답 래퍼 형태 (에러 처리용 최소 형태만 정의)
interface ApiErrorResponse {
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

/**
 * 에러를 사용자에게 보여줄 정보로 변환 - 보여주지 않을 에러는 null
 * - 취소된 요청: React StrictMode(개발 모드)의 mount-unmount-mount 재실행으로
 *   react-query가 첫 번째(가짜) 마운트의 요청을 취소하는 경우라 실제 에러가 아님
 * - axios를 거치지 않은 에러(응답 필드 누락 등): 구체 메시지는 개발자용이라 콘솔에만 남기고 일반 문구 노출
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
