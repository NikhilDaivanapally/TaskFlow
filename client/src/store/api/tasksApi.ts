// src/redux/api/tasksApi.ts
import { apiSlice } from "./apiSlice";
import type { RootState } from "../store";
import type { Task } from "@/types";
type Pagination = {
  totalTasks: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export const tasksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🧩 1. GET TASKS
    getTasks: builder.query<
      { tasks: Task[]; pagination: Pagination },
      {
        page?: number;
        limit?: number;
        status?: string;
        priority?: string;
        query?: string;
      }
    >({
      query: ({
        page = 1,
        limit = 10,
        status = "all",
        priority = "all",
        query = "",
      }) => ({
        url: "/tasks",
        params: {
          page,
          limit,
          ...(status !== "all" && { status }),
          ...(priority !== "all" && { priority }),
          ...(query && { query }),
        },
      }),
      // 🧠 unwrap the backend response
      transformResponse: (response: {
        statusCode: number;
        data: { tasks: Task[]; pagination: Pagination };
        message: string;
      }) => response.data,

      providesTags: (result, _, { page }) =>
        result
          ? [
              ...result.tasks.map(({ _id }: { _id: string }) => ({
                type: "Task" as const,
                id: _id,
              })),
              { type: "Task", id: `PAGE-${page}` },
            ]
          : [{ type: "Task", id: `PAGE-${page}` }],
      keepUnusedDataFor: 300,
    }),

    // 🧩 2. GET SINGLE TASK
    getTaskById: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      transformResponse: (response: {
        statusCode: number;
        data: Task;
        message: string;
      }) => response.data,
    }),

    // 🧩 3. CREATE TASK
    createTask: builder.mutation<Task, Partial<Task>>({
      query: (data) => ({
        url: "/tasks",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: {
        statusCode: number;
        data: Task;
        message: string;
      }) => response.data,
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: newTask } = await queryFulfilled;

          const state = getState() as RootState;
          const allQueries = tasksApi.util.selectInvalidatedBy(state, [
            { type: "Task" },
          ]);

          for (const {
            endpointName,
            originalArgs,
          } of allQueries) {
            if (endpointName !== "getTasks") continue;
            dispatch(
              tasksApi.util.updateQueryData(
                "getTasks",
                originalArgs as any,
                (draft) => {
                  if (!draft?.tasks) return;
                  draft.tasks.unshift(newTask);
                }
              )
            );
          }
        } catch (error) {
          console.error("❌ Failed to add new task to cache", error);
        }
      },
    }),

    // 🧩 4. UPDATE TASK
    updateTask: builder.mutation<Task, Partial<Task> & { _id: string }>({
      query: ({ _id, ...data }) => ({
        url: `/tasks/${_id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: {
        statusCode: number;
        data: Task;
        message: string;
      }) => response.data,
      async onQueryStarted(
        { _id, ...patch },
        { dispatch, queryFulfilled, getState }
      ) {
        const state = getState() as RootState;
        const allQueries = tasksApi.util.selectInvalidatedBy(state, [
          { type: "Task" },
        ]);

        const patchResults = allQueries.map(({ originalArgs }) =>
          dispatch(
            tasksApi.util.updateQueryData(
              "getTasks",
              originalArgs as any,
              (draft) => {
                const task = draft?.tasks?.find((t) => t._id === _id);
                if (task) Object.assign(task, patch);
              }
            )
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((res) => res.undo());
        }
      },
    }),

    // 🧩 5. DELETE TASK
    deleteTask: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        statusCode: number;
        data: { success: boolean; id: string };
        message: string;
      }) => response.data,
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const state = getState() as RootState;
        const allQueries = tasksApi.util.selectInvalidatedBy(state, [
          { type: "Task" },
        ]);

        const patchResults = allQueries.map(({ originalArgs }) =>
          dispatch(
            tasksApi.util.updateQueryData(
              "getTasks",
              originalArgs as any,
              (draft) => {
                if (!draft?.tasks) return;
                draft.tasks = draft.tasks.filter((t) => t._id !== id);
              }
            )
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((res) => res.undo());
        }
      },
    }),

    // GET TASK STATS
    getStats: builder.query({
      query: () => "/tasks/stats",
      transformResponse: (response: {
        statusCode: number;
        data: {
          total: number;
          pending: number;
          inProgress: number;
          completed: number;
          overdue: number;
        };
        message: string;
      }) => response.data,
    }),

    // GET RECENT TASKS
    getRecentTasks: builder.query({
      query: () => "/tasks/recent",
      transformResponse: (response: {
        statusCode: number;
        data: { recentTasks: Task[] };
        message: string;
      }) => response.data,
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetStatsQuery,
  useGetRecentTasksQuery
} = tasksApi;
