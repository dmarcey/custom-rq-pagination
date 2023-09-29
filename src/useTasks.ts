import {
  UseQueryOptions,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { GetTasksResponse } from "./types";

export function useTasks(qProp: string) {
  const [lastPageIndex, setLastPageIndex] = useState(0);
  const [q, setQ] = useState(qProp);
  const queryClient = useQueryClient();

  let derivedLastPageIndex = lastPageIndex;
  if (q !== qProp) {
    setQ(qProp);
    setLastPageIndex(0);
    derivedLastPageIndex = 0;
  }

  const queries = useMemo(() => {
    const options: UseQueryOptions<GetTasksResponse>[] = [];
    for (let i = 0; i <= derivedLastPageIndex; i++) {
      const queryData = queryClient.getQueryData<GetTasksResponse>([
        "tasks",
        q,
        i - 1,
      ]);
      const after = queryData ? queryData.pageInfo.cursor : 0;
      options.push({
        queryKey: ["tasks", q, i],
        queryFn: async (_context) => {
          let url = `/tasks?after=${after}&q=${q}`;
          const response = await fetch(url);
          const data = (await response.json()) as GetTasksResponse;
          return data;
        },
        staleTime: Infinity,
      });
    }
    return options;
  }, [derivedLastPageIndex, q]);

  const pageQueries = useQueries({
    queries,
  });
  const data = useMemo(
    () => pageQueries.flatMap((q) => q.data?.items || []),
    [pageQueries]
  );

  const fetchNextPage = useCallback(() => {
    setLastPageIndex((v) => v + 1);
  }, []);

  const hasNextPage =
    !!pageQueries[derivedLastPageIndex].data?.pageInfo.hasNextPage;

  const isFetching = pageQueries.some((query) => query.isFetching);
  const isRefetching = pageQueries.some((query) => query.isRefetching);
  return {
    isFetching,
    isRefetching,
    data,
    fetchNextPage,
    hasNextPage,
    queries,
  };
}
