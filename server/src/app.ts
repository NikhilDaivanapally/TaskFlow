import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Request, Response } from "express";
import { FRONTEND_URL } from "./config";
import authRoute from "./routes/auth.routes";

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL, // Frontend origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow cookies and Authorization headers
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/auth", authRoute);

// Root health check route
app.use("/", (_: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Your backend is working fine 👍🏼",
  });
});
export { app };
