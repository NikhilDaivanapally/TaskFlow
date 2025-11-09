import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CheckCircle2, Clock, AlertCircle, ListChecks } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import DashboardSkeleton from "../../components/loaders/DashboardSkeleton";
import {
  useGetRecentTasksQuery,
  useGetStatsQuery,
} from "../../store/api/tasksApi";
import type { Task } from "@/types";

const Dashboard = () => {
  const { isLoading: recentLoading, data: recentData } = useGetRecentTasksQuery(
    {}
  );
  const {
    data: statsData,
    isLoading: statsLoading,
    isError,
  } = useGetStatsQuery({});

  if (recentLoading || statsLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !statsData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground text-sm">
          Failed to load dashboard data. Please try again later.
        </p>
      </div>
    );
  }

  // ✅ Extract stats data safely
  const { total, inProgress, completed, overdue } = statsData;

  const stats = [
    {
      title: "Total Tasks",
      value: total ?? 0,
      icon: ListChecks,
      color: "text-primary",
    },
    {
      title: "In Progress",
      value: inProgress ?? 0,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      title: "Completed",
      value: completed ?? 0,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "Overdue",
      value: overdue ?? 0,
      icon: AlertCircle,
      color: "text-red-500",
    },
  ];

  // ✅ Use real data from API
  const recentTasks = recentData?.recentTasks ?? [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "in-progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "medium":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "low":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-muted-foreground">
          Here's an overview of your tasks today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tasks */}
      {/* Tasks Table (Desktop) */}
      <div className="my-2 font-semibold text-lg">Recent Tasks</div>
      <div className="hidden md:block border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTasks.map((task: Task) => (
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Task Cards (Mobile) */}
      <div className="md:hidden space-y-4">
        {recentTasks.map((task: Task) => (
          <div key={task._id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold">{task.title}</h3>
              <div className="flex gap-2">
                {/* <Button
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
                </Button> */}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{task.description}</p>
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
    </div>
  );
};

export default Dashboard;
