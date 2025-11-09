import { Schema, model } from "mongoose";
import { ITask } from "../types/models/task.type";

const taskSchema = new Schema<ITask>(
  {
    _id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [3, "Task title must be at least 3 characters long"],
      maxlength: [150, "Task title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
      required: true,
    },
    priority: {
      type: String,
      enum: ["urgent", "high", "medium", "low"],
      default: "medium",
      required: true,
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          if (!value) return true;
          const now = new Date();
          // Normalize both dates to ignore time zone differences
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          const due = new Date(
            value.getFullYear(),
            value.getMonth(),
            value.getDate()
          );
          return due >= today;
        },
        message: "Due date cannot be in the past",
      },
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);

// Indexes
taskSchema.index({ user: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });

export const Task = model<ITask>("Task", taskSchema);
