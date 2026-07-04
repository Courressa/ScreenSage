import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js"

const router = express.Router();

//POST - /api/v1/auth/register - register a new user - PUBLIC
router.post("/register", registerUser);

//POST - /api/v1/auth/login - login a user - PUBLIC
router.post("/login", loginUser);

export default router;


