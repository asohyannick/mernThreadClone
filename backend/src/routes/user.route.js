import express from "express";
import user from "../controllers/user.controller.js";
import { authToken } from "../middlewares/authToken.js";
import protectedRoute from "../middlewares/protectedRoute.js";
const router = express.Router();
router.get("/profile/:id", user.getUserProfile);
router.post("/signup", user.signup);
router.post("/signin", authToken, user.signin);
router.post("/logout", authToken, user.logout);
router.post("/follow/:id", protectedRoute, user.followUser);
router.post("/unfollow/:id", protectedRoute, user.unFollowUser);
router.put("/update/:id", protectedRoute, user.updateUser);
router.delete("/delete/:id", protectedRoute, user.deleteUser);
export default router;