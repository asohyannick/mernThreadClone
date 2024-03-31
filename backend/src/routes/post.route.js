import express from "express";
import post from "../controllers/post.controller.js";
import protectedRoute from "../middlewares/protectedRoute.js";
const router = express.Router();
router.get("/getPost/:id", post.getPost);
router.get("/feedPost", protectedRoute, post.feedPost);
router.post("/create", protectedRoute, post.createPost);
router.post("/likePost/:id", protectedRoute, post.likePost);
router.post("/unlikePost/:id", protectedRoute, post.unLikePost);
router.delete("/deletePost/:id", protectedRoute, post.deletePost);
router.post("/replyToPost/:id", protectedRoute, post.replyToPost);
export default router;