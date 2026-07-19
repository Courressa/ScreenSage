import express from "express";
import { getAllUsers } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// GET /api/v1/users — list users (admin only)
router.get("/", authMiddleware, adminMiddleware, getAllUsers);

export default router;
