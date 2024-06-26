import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { StatusCodes } from "http-status-codes";
import connectDB from "./db/connectDB.js";
import usersRoutes from "./routes/user.route.js";
import postsRoutes from "./routes/post.route.js";
import messageRoute from './routes/message.route.js'
import {v2 as cloudinary} from "cloudinary";
import path from "path";
import {app, server} from './socket/socket.js';
import job from './cron/cron.js';
app.use(cors());
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Routes
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/posts", postsRoutes);
app.use('/api/v1/messages', messageRoute);
const port = process.env.PORT || 8000;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});
// custom middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});
server.listen(port, async function () {
  job.start();
  try {
    await connectDB();
    console.log(`Server is running on port ${port}...`);
  } catch (error) {
    console.log(error);
  }
});
