import "./App.css";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { Task } from "./types";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useTasks } from "./useTasks";

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
  const { data, fetchNextPage, hasNextPage } = useTasks(q);
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
          {task.title}: {`${task.completed}`}
        </li>
      ))}
    </ul>
  );
}

export default App;
