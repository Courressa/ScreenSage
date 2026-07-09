import express from "express";
import { getHealth } from "../controllers/healthController.js";

const router = express.Router();

//GET - /api/v1/health - status check
router.get("/health", getHealth);

export default router;