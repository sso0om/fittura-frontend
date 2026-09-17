import Axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'sonner';

// 백엔드 RsData 응답 래퍼 형태 (에러 처리용 최소 형태만 정의)
interface ApiErrorResponse {
  code?: string;
  message?: string;
  data?: unknown;
}

const DEFAULT_ERROR_MESSAGE =
  '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  paramsSerializer: { indexes: null },
});

// API 에러 발생 시 해당 인터셉터에서 공통으로 토스트 처리
// - /admin 경로: message + data 노출
// - 그 외(고객 화면): message만 노출
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // React StrictMode(개발 모드)의 mount-unmount-mount 재실행으로 react-query가 첫 번째(가짜) 마운트의 요청을 취소하는 경우 
    // —> 실제 에러가 아니므로 토스트 없이 통과
    if (Axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const rsData = error.response?.data;
    const message = rsData?.message ?? DEFAULT_ERROR_MESSAGE;
    const isAdminPage =
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/admin');

    // code가 없는 네트워크 에러는 메시지 자체를 dedup 키로 사용
    // -> 같은 원인으로 여러 쿼리가 동시에 실패해도 토스트 1개로 합쳐짐
    const toastId = rsData?.code ?? message;

    if (isAdminPage && rsData?.data != null) {
      toast.error(message, {
        id: toastId,
        description: JSON.stringify(rsData.data),
      });
    } else {
      toast.error(message, { id: toastId });
    }

    return Promise.reject(error);
  },
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => source.cancel('Query was cancelled');
  return promise;
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
