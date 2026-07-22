import express from "express";
import {
    createPaypalCheckout,
    capturePaypalCheckout,
} from "../controllers/paypalController.js";
import {
    createStripeCheckout,
    confirmStripeCheckout,
} from "../controllers/stripeController.js";

const router = express.Router();

// POST /api/v1/payments/paypal/create — start PayPal Checkout (sandbox or live)
router.post("/paypal/create", createPaypalCheckout);

// POST /api/v1/payments/paypal/capture — capture payment + fulfill order
router.post("/paypal/capture", capturePaypalCheckout);

// POST /api/v1/payments/stripe/create — start Stripe Checkout (test or live)
router.post("/stripe/create", createStripeCheckout);

// POST /api/v1/payments/stripe/confirm — verify session + fulfill order
router.post("/stripe/confirm", confirmStripeCheckout);

export default router;
