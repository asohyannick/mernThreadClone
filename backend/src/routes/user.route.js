import express from "express";
import user from "../controllers/user.controller.js";
import protectedRoute from "../middlewares/protectedRoute.js";
const router = express.Router();
router.get("/profile/:query", user.getUserProfile);
router.get("/suggested", protectedRoute, user.getSuggestedUsers);
router.post("/signup", user.signup);
router.post("/signin",  user.signin);
router.post("/logout",  user.logout);
router.post("/follow/:id", protectedRoute, user.followUnFollowUser);
router.put("/update/:id", protectedRoute, user.updateUser);
router.put("/freeze", protectedRoute, user.freezeAccount);
router.delete("/delete/:id", protectedRoute, user.deleteUser);
export default router;
