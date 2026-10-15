"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useCallback, useState, type ReactNode } from "react";

import { ApiErrorDialog } from "@/components/common/api-error-dialog";
import { toApiErrorInfo, type ApiErrorInfo } from "@/lib/api-error";

export default function Providers({ children }: { children: ReactNode }) {
  const [apiError, setApiError] = useState<ApiErrorInfo | null>(null);
  const closeApiError = useCallback(() => setApiError(null), []);

  const [queryClient] = useState(() => {
    // 쿼리·뮤테이션 에러 공통 처리 (쿼리는 재시도가 모두 끝난 뒤 1번 호출)
    // 팝업이 열려 있는 동안 도착한 에러는 무시 - 같은 원인으로 여러 요청이 동시에 실패해도 팝업 1개
    const handleError = (error: unknown) => {
      const info = toApiErrorInfo(error);
      if (info) setApiError((prev) => prev ?? info);
    };

    return new QueryClient({
      queryCache: new QueryCache({ onError: handleError }),
      mutationCache: new MutationCache({
        onError: (error, _variables, _onMutateResult, mutation) => {
          if (mutation.meta?.skipGlobalError) return;
          handleError(error);
        },
      }),
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ApiErrorDialog error={apiError} onClose={closeApiError} />
    </QueryClientProvider>
  );
}
