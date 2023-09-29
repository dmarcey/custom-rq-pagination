import { rest } from "msw";
import { GetTasksResponse, Task } from "../types";

const tasks: Task[] = [];
for (let i = 0; i < 100; i++) {
  tasks.push({
    id: i,
    title: `Title ${i}`,
    completed: i % 2 === 0,
  });
}

export const handlers = [
  // Handles a GET /tasks request
  rest.get("/tasks", (req, res, ctx) => {
    const q = req.url.searchParams.get("q") || "all";
    const start = parseInt(req.url.searchParams.get("after") || "0");
    const filtered =
      q === "all"
        ? tasks
        : tasks.filter(
            (t) =>
              (t.completed && q === "completed") ||
              (!t.completed && q === "uncompleted")
          );
    const slice = filtered.slice(start, start + 10);
    const hasNextPage = start + 10 < filtered.length;
    const cursor = start + 10;
    const response: GetTasksResponse = {
      items: slice,
      pageInfo: {
        cursor,
        hasNextPage,
      },
    };
    return res(ctx.status(200), ctx.json(response));
  }),
];
