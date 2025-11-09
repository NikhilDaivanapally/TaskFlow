import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/store/api/tasksApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import TaskDialog from "@/components/TaskDialog";
import PaginationControls from "@/components/PaginationControls";
import type { Task } from "@/types";
import TasksSkeleton from "@/components/loaders/TaskTableSkeleton";

const Tasks = () => {
  // Filters + pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query); // 👈 debounced value
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 🔹 Debounce Effect: only update query after delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1); // reset to page 1 when searching
    }, 500); // 500 ms debounce delay
    return () => clearTimeout(handler);
  }, [query]);

  // RTK Query call uses debounced value
  const { data, isLoading, isFetching } = useGetTasksQuery({
    page,
    limit,
    status,
    priority,
    query: debouncedQuery,
  });

  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const tasks = data?.tasks ?? [];
  const pagination = data?.pagination ?? { totalPages: 1 };

  // Handlers
  const handleAddTask = useCallback(() => {
    setEditingTask(null);
    setDialogOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  }, []);

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      try {
        await deleteTask(taskId).unwrap();
        toast.success("Task deleted successfully");
      } catch {
        toast.error("Failed to delete task");
      }
    },
    [deleteTask]
  );

  const handleSaveTask = useCallback(
    async (task: Task) => {
      try {
        if (editingTask) {
          await updateTask(task).unwrap();
          toast.success("Task updated successfully");
        } else {
          await createTask(task).unwrap();
          toast.success("Task created successfully");
        }
        setDialogOpen(false);
      } catch {
        toast.error("Something went wrong while saving the task");
      }
    },
    [editingTask, createTask, updateTask]
  );

  // Filters active?
  const isFilterActive = useMemo(
    () =>
      status !== "all" ||
      priority !== "all" ||
      (debouncedQuery && debouncedQuery.length > 0),
    [status, priority, debouncedQuery]
  );

  // Helper: colors
  const getStatusColor = useCallback((s: string) => {
    const map: Record<string, string> = {
      completed: "bg-green-100 text-green-700",
      "in-progress": "bg-blue-100 text-blue-700",
      pending: "bg-yellow-100 text-yellow-700",
    };
    return map[s] || "bg-gray-200 text-gray-700";
  }, []);

  const getPriorityColor = useCallback((p: string) => {
    const map: Record<string, string> = {
      urgent: "bg-red-100 text-red-700",
      high: "bg-orange-100 text-orange-700",
      medium: "bg-blue-100 text-blue-700",
      low: "bg-gray-200 text-gray-700",
    };
    return map[p] || "bg-gray-200 text-gray-700";
  }, []);

  // Loading skeleton
  if (isLoading) {
    return <TasksSkeleton />;
  }

  const noTasks = !isFetching && tasks.length === 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your tasks efficiently.
          </p>
        </div>
        <Button onClick={handleAddTask} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* No Tasks / Table */}
      {noTasks ? (
        <div className="text-center mt-20">
          <p className="text-xl font-semibold">
            {isFilterActive ? "No matching tasks found." : "No tasks yet."}
          </p>
          {!isFilterActive && (
            <Button className="mt-4" onClick={handleAddTask}>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Tasks Table (Desktop) */}
          <div className="hidden md:block border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Priority</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task: Task) => (
                  <TableRow key={task._id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {task.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(task.status)}
                      >
                        {task.status.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getPriorityColor(task.priority)}
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTask(task)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Task Cards (Mobile) */}
          <div className="md:hidden space-y-4">
            {tasks.map((task: Task) => (
              <div key={task._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{task.title}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTask(task)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className={getStatusColor(task.status)}
                  >
                    {task.status.replace("-", " ")}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={getPriorityColor(task.priority)}
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <PaginationControls
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default Tasks;
