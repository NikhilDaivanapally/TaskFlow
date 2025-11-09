import express from "express";
import {
  createTask,
  deleteTask,
  getRecentTasks,
  getTasks,
  getTaskStats,
  updateTask,
} from "../controllers/task.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", verifyJWT, createTask);
router.get("/", verifyJWT, getTasks);
router.patch("/:id", verifyJWT, updateTask);
router.delete("/:id", verifyJWT, deleteTask);
router.get("/stats", verifyJWT, getTaskStats);
router.get("/recent", verifyJWT, getRecentTasks);

export default router;
