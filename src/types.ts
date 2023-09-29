export type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export type GetTasksResponse = {
  items: Task[];
  pageInfo: {
    hasNextPage: boolean;
    cursor: number;
  };
};
