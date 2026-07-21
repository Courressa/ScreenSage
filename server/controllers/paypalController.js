import {
    createPayPalOrder,
    capturePayPalOrder,
    getCapturedAmount,
    isPayPalConfigured,
} from "../services/paypalService.js";
import {
    normalizeOrderItems,
    fulfillOrder,
    EMAIL_REGEX,
} from "../services/orderService.js";
import Order from "../models/Order.js";

/**
 * POST /api/v1/payments/paypal/create
 * Body: { items: [...], customerEmail }
 * Returns: { id } — PayPal order id for the JS SDK
 */
export const createPaypalCheckout = async (req, res) => {
    try {
        if (!isPayPalConfigured()) {
            return res.status(503).json({
                message: "PayPal is not configured on the server.",
            });
        }

        const { items, customerEmail } = req.body;
        const email = String(customerEmail || "").trim().toLowerCase();

        if (!email || !EMAIL_REGEX.test(email)) {
            return res.status(400).json({
                message: "Enter a valid email before paying with PayPal.",
            });
        }

        const { normalizedItems, totalAmount } = await normalizeOrderItems(items);

        if (totalAmount <= 0) {
            return res.status(400).json({ message: "Order total must be greater than zero." });
        }

        const titles = normalizedItems.map((i) => i.title).join(", ");
        const description =
            titles.length > 120 ? `${titles.slice(0, 117)}...` : titles;

        const paypalOrder = await createPayPalOrder({
            totalAmount,
            currency: "USD",
            description: description || "ScreenSage wallpapers",
        });

        res.status(201).json({
            id: paypalOrder.id,
            status: paypalOrder.status,
        });
    } catch (error) {
        console.error("PayPal create checkout error:", error.message);
        const status = error.statusCode || 500;
        res.status(status).json({
            message: error.message || "Failed to start PayPal checkout.",
        });
    }
};

/**
 * POST /api/v1/payments/paypal/capture
 * Body: { paypalOrderId, items, customerEmail }
 * Captures payment, then creates ScreenSage order + sends delivery email.
 */
export const capturePaypalCheckout = async (req, res) => {
    try {
        if (!isPayPalConfigured()) {
            return res.status(503).json({
                message: "PayPal is not configured on the server.",
            });
        }

        const { paypalOrderId, items, customerEmail } = req.body;
        const email = String(customerEmail || "").trim().toLowerCase();

        if (!paypalOrderId) {
            return res.status(400).json({ message: "Missing PayPal order id." });
        }
        if (!email || !EMAIL_REGEX.test(email)) {
            return res.status(400).json({
                message: "A valid email is required so we can deliver your wallpapers.",
            });
        }

        // Idempotency: if we already fulfilled this PayPal order, return it
        const existing = await Order.findOne({ paypalOrderId }).lean();
        if (existing) {
            const downloads = (existing.items || []).flatMap((item) =>
                (item.fullGallery || []).map((url, index) => ({
                    title: item.title,
                    slug: item.slug,
                    url,
                    filename: `${item.slug}-${index + 1}`,
                }))
            );
            return res.status(200).json({
                message: "Order already completed.",
                order: existing,
                emailSent: existing.emailSent,
                emailMessage: existing.emailMessage,
                downloads,
            });
        }

        const { totalAmount: expectedTotal } = await normalizeOrderItems(items);

        const captureResult = await capturePayPalOrder(paypalOrderId);
        const status = captureResult?.status;

        if (status !== "COMPLETED") {
            return res.status(402).json({
                message: `PayPal payment not completed (status: ${status || "unknown"}).`,
            });
        }

        const paid = getCapturedAmount(captureResult);
        // Allow 1 cent float tolerance
        if (Math.abs(paid - expectedTotal) > 0.02) {
            console.error(
                `PayPal amount mismatch: paid=${paid} expected=${expectedTotal} order=${paypalOrderId}`
            );
            return res.status(400).json({
                message: "Payment amount did not match cart total. Contact support.",
            });
        }

        const result = await fulfillOrder({
            items,
            customerEmail: email,
            paymentMethod: "paypal",
            status: "completed",
            paypalOrderId,
        });

        res.status(201).json({
            message: "Order placed successfully.",
            order: result.order,
            emailSent: result.emailSent,
            emailMessage: result.emailMessage,
            downloads: result.downloads,
        });
    } catch (error) {
        console.error("PayPal capture error:", error.message);
        const status = error.statusCode || 500;
        res.status(status).json({
            message: error.message || "Failed to complete PayPal payment.",
        });
    }
};
