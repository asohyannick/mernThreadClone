import express from 'express';
import post  from '../controllers/post.controller.js';
const router = express.Router();
router.post('/create', post.createPost);
export default router;