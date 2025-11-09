import { Document, Types } from "mongoose";

export interface ITask extends Document {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed";
  priority: "urgent" | "high" | "medium" | "low";
  dueDate?: Date;
  user: Types.ObjectId;
  project: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
