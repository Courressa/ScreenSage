import express from "express";
import {
    createPaypalCheckout,
    capturePaypalCheckout,
} from "../controllers/paypalController.js";

const router = express.Router();

// POST /api/v1/payments/paypal/create — start PayPal Checkout (sandbox or live)
router.post("/paypal/create", createPaypalCheckout);

// POST /api/v1/payments/paypal/capture — capture payment + fulfill order
router.post("/paypal/capture", capturePaypalCheckout);

export default router;
