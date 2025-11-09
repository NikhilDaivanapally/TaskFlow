import { Request, Response } from "express";
import { Task } from "../models/task.model";
import { AuthenticatedRequest } from "../types/requests/auth.type";
import { ApiResponse } from "../utils/ApiResponse";
import { ObjectId } from "bson";
// CREATE TASK
export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req?.user?._id;
    const { _id, title, description, status, dueDate, priority } = req.body;
    console.log(_id, title, description, status, dueDate, priority);

    const task = await Task.create({
      _id,
      title,
      description,
      status,
      dueDate,
      priority,
      user: userId,
    });

    res.status(201).json(ApiResponse(201, task, "Task created successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json(ApiResponse(500, null, "Failed to create task"));
  }
};

// GET TASKS
export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req?.user?._id;

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const { query, status, priority } = req.query;
    const filter: Record<string, any> = { user: userId };

    if (status && status !== "all") {
      filter.status = status;
    }

    if (priority && priority !== "all") {
      filter.priority = priority;
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    // Fetch tasks
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total count for pagination
    const totalTasks = await Task.countDocuments(filter);
    const totalPages = Math.ceil(totalTasks / limit);

    res.status(200).json(
      ApiResponse(
        200,
        {
          tasks,
          pagination: {
            totalTasks,
            totalPages,
            currentPage: page,
            pageSize: limit,
          },
        },
        "Tasks fetched successfully"
      )
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(ApiResponse(500, null, "Failed to fetch tasks"));
  }
};

// UPDATE TASK
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json(ApiResponse(404, null, "Task not found"));
    }

    Object.assign(task, {
      title: req.body.title ?? task.title,
      description: req.body.description ?? task.description,
      status: req.body.status ?? task.status,
      priority: req.body.priority ?? task.priority,
      dueDate: req.body.dueDate ?? task.dueDate,
    });

    const updatedTask = await task.save();

    res
      .status(200)
      .json(ApiResponse(200, updatedTask, "Task updated successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json(ApiResponse(500, null, "Failed to update task"));
  }
};

// DELETE TASK
export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json(ApiResponse(404, null, "Task not found"));
    }

    await task.deleteOne();

    res.status(200).json(ApiResponse(200, null, "Task deleted successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json(ApiResponse(500, null, "Failed to delete task"));
  }
};

export const getTaskStats = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json(ApiResponse(401, null, "Unauthorized"));
    }

    // Fetch all tasks for the user
    const tasks = await Task.find({ user: userId });

    // Calculate stats
    const totalTasks = tasks.length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const overdue = tasks.filter(
      (t) =>
        t.status !== "completed" &&
        t.dueDate &&
        Date.parse(new Date(t.dueDate).toISOString().split("T")[0]) <
          Date.parse(new Date().toISOString().split("T")[0])
    ).length;

    return res.status(200).json(
      ApiResponse(
        200,
        {
          total: totalTasks,
          pending,
          inProgress,
          completed,
          overdue,
        },
        "stats fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching task stats:", error);
    return res
      .status(500)
      .json(ApiResponse(500, null, "Failed to fetch task statistics"));
  }
};

export const getRecentTasks = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req?.user?._id;
    if (!userId) {
      return res.status(401).json(ApiResponse(401, null, "Unauthorized"));
    }

    const recentTasks = await Task.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    return res
      .status(200)
      .json(
        ApiResponse(200, { recentTasks }, "Recent tasks fetched successfully")
      );
  } catch (error) {
    console.error("Error fetching recent tasks:", error);
    return res
      .status(500)
      .json(ApiResponse(500, null, "Internal Server Error"));
  }
};
