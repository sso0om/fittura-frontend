import Axios, { AxiosRequestConfig, AxiosError } from 'axios';

// 에러 안내는 QueryClient 전역 onError(app/providers.tsx)가 처리
export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  paramsSerializer: { indexes: null },
});

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

  // @ts-expect-error orval 취소 연동용으로 Promise에 cancel을 붙임
  promise.cancel = () => source.cancel('Query was cancelled');
  return promise;
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
