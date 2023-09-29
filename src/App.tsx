import "./App.css";
import {
  QueryClient,
  QueryClientProvider,
  UseQueryOptions,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import { GetTasksResponse, Task } from "./types";
import { useCallback, useMemo, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Tasks />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function Tasks() {
  const [q, setQ] = useState("all");
  const { data, fetchNextPage, hasNextPage, queries } = useTasks(q);
  const queryClient = useQueryClient();

  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} />
      <Tasklist tasks={data} />
      <button
        disabled={!hasNextPage}
        onClick={() => {
          fetchNextPage();
        }}
      >
        Fetch Next
      </button>
      <button
        disabled={!hasNextPage}
        onClick={() => {
          queryClient.refetchQueries({ queryKey: ["tasks", q, 0] });
        }}
      >
        Invalidate Page 0
      </button>
      <button
        disabled={!hasNextPage}
        onClick={() => {
          queryClient.refetchQueries({ queryKey: ["tasks", q, 1] });
        }}
      >
        Invalidate Page 1
      </button>
    </div>
  );
}

function Tasklist({ tasks }: { tasks: Array<Task> }) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          {task.title}: {task.completed}
        </li>
      ))}
    </ul>
  );
}

function useTasks(qProp: string) {
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

  const refetchAndInvalidate = useCallback((_pageIndex: number) => {}, []);

  const refetch = useCallback((_pageIndex: number) => {}, []);

  const hasNextPage =
    !!pageQueries[derivedLastPageIndex].data?.pageInfo.hasNextPage;

  const isFetching = pageQueries.some((query) => query.isFetching);
  const isRefetching = pageQueries.some((query) => query.isRefetching);
  return {
    isFetching,
    isRefetching,
    data,
    fetchNextPage,
    refetchAndInvalidate,
    refetch,
    hasNextPage,
    queries,
  };
}

export default App;
