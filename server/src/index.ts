import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./db/connectDB";
import { app } from "./app";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is Running on ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed", err);
  });
