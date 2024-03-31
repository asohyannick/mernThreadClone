import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { StatusCodes } from "http-status-codes";
import connectDB from "./db/connectDB.js";
import usersRoutes from "./routes/user.route.js";
import postsRoutes from "./routes/post.route.js";
import path from "path";
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Routes
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/posts", postsRoutes);
const port = process.env.PORT || 8000;
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});
// custom middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal  Server Error";
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});
app.listen(port, async function () {
  try {
    await connectDB();
    console.log(`Server is running on port ${port}...`);
  } catch (error) {
    console.log(error);
  }
});
