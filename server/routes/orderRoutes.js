import express from "express";
import {
    createOrder,
    getAllOrders,
    getOrderStats,
} from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// POST /api/v1/orders — create order (public for demo checkout)
router.post("/", createOrder);

// GET /api/v1/orders/stats — sales stats (admin only)
// Must be registered before /:id-style routes if added later
router.get("/stats", authMiddleware, adminMiddleware, getOrderStats);

// GET /api/v1/orders — list orders (admin only)
router.get("/", authMiddleware, adminMiddleware, getAllOrders);

export default router;
