import Product from "../models/Product.js";
import Order from "../models/Order.js";
import {
    createCheckoutSession,
    retrieveCheckoutSession,
    isStripeConfigured,
} from "../services/stripeService.js";
import {
    normalizeOrderItems,
    fulfillOrder,
    EMAIL_REGEX,
} from "../services/orderService.js";

/**
 * POST /api/v1/payments/stripe/create
 * Body: { items, customerEmail }
 * Returns: { url, sessionId } — redirect browser to url
 */
export const createStripeCheckout = async (req, res) => {
    try {
        if (!isStripeConfigured()) {
            return res.status(503).json({
                message: "Stripe is not configured on the server.",
            });
        }

        const { items, customerEmail } = req.body;
        const email = String(customerEmail || "").trim().toLowerCase();

        if (!email || !EMAIL_REGEX.test(email)) {
            return res.status(400).json({
                message: "Enter a valid email before paying with Stripe.",
            });
        }

        const { normalizedItems, totalAmount } = await normalizeOrderItems(items);

        if (totalAmount <= 0) {
            return res.status(400).json({ message: "Order total must be greater than zero." });
        }

        const session = await createCheckoutSession({
            normalizedItems,
            customerEmail: email,
            totalAmount,
        });

        if (!session.url) {
            return res.status(500).json({ message: "Stripe did not return a checkout URL." });
        }

        res.status(201).json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (error) {
        console.error("Stripe create checkout error:", error.message);
        const status = error.statusCode || 500;
        res.status(status).json({
            message: error.message || "Failed to start Stripe checkout.",
        });
    }
};

/**
 * Rebuild cart lines from Stripe session metadata (slugs only → live DB prices).
 */
async function itemsFromSessionMetadata(session) {
    let cart = [];
    try {
        cart = JSON.parse(session.metadata?.cart || "[]");
    } catch {
        cart = [];
    }

    if (!Array.isArray(cart) || cart.length === 0) {
        const err = new Error("Stripe session is missing cart details.");
        err.statusCode = 400;
        throw err;
    }

    const items = [];
    for (const row of cart) {
        const slug = row.slug;
        if (!slug) continue;
        const product = await Product.findOne({ slug }).lean();
        if (!product) {
            const err = new Error(`Product not found for slug: ${slug}`);
            err.statusCode = 400;
            throw err;
        }
        items.push({
            productId: product.id,
            slug: product.slug,
            title: product.title,
            price: product.price,
            quantity: Number(row.quantity) > 0 ? Number(row.quantity) : 1,
            fullGallery: product.fullGallery || [],
            coverImage: product.coverImage || "",
        });
    }

    if (!items.length) {
        const err = new Error("No valid items on Stripe session.");
        err.statusCode = 400;
        throw err;
    }

    return items;
}

function orderResponsePayload(order, message = "Order already completed.") {
    const downloads = (order.items || []).flatMap((item) =>
        (item.fullGallery || []).map((url, index) => ({
            title: item.title,
            slug: item.slug,
            url,
            filename: `${item.slug}-${index + 1}`,
        }))
    );
    return {
        message,
        order,
        emailSent: order.emailSent,
        emailMessage: order.emailMessage,
        downloads,
    };
}

/** In-process lock so concurrent confirms for the same session share one fulfill */
const stripeConfirmInFlight = new Map();

/**
 * POST /api/v1/payments/stripe/confirm
 * Body: { sessionId }
 * Verifies payment succeeded, then fulfills ScreenSage order + email.
 * Safe to call multiple times for the same session (idempotent).
 */
export const confirmStripeCheckout = async (req, res) => {
    try {
        if (!isStripeConfigured()) {
            return res.status(503).json({
                message: "Stripe is not configured on the server.",
            });
        }

        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ message: "Missing Stripe session id." });
        }

        // Fast path: already fulfilled
        const existing = await Order.findOne({ stripeSessionId: sessionId }).lean();
        if (existing) {
            return res.status(200).json(orderResponsePayload(existing));
        }

        // Serialize concurrent confirms (React Strict Mode / double fetch)
        if (stripeConfirmInFlight.has(sessionId)) {
            await stripeConfirmInFlight.get(sessionId);
            const afterWait = await Order.findOne({ stripeSessionId: sessionId }).lean();
            if (afterWait) {
                return res.status(200).json(orderResponsePayload(afterWait));
            }
        }

        let release;
        const gate = new Promise((resolve) => {
            release = resolve;
        });
        stripeConfirmInFlight.set(sessionId, gate);

        try {
            // Re-check after acquiring gate
            const existingAgain = await Order.findOne({ stripeSessionId: sessionId }).lean();
            if (existingAgain) {
                return res.status(200).json(orderResponsePayload(existingAgain));
            }

            const session = await retrieveCheckoutSession(sessionId);

            if (session.payment_status !== "paid") {
                return res.status(402).json({
                    message: `Stripe payment not completed (status: ${session.payment_status}).`,
                });
            }

            const email = (
                session.metadata?.customerEmail ||
                session.customer_email ||
                session.customer_details?.email ||
                ""
            )
                .trim()
                .toLowerCase();

            if (!email || !EMAIL_REGEX.test(email)) {
                return res.status(400).json({
                    message: "Stripe session is missing a valid customer email.",
                });
            }

            const items = await itemsFromSessionMetadata(session);
            const { totalAmount: expectedTotal } = await normalizeOrderItems(items);

            // amount_total is in cents
            const paid = Number(session.amount_total || 0) / 100;
            if (Math.abs(paid - expectedTotal) > 0.02) {
                console.error(
                    `Stripe amount mismatch: paid=${paid} expected=${expectedTotal} session=${sessionId}`
                );
                return res.status(400).json({
                    message: "Payment amount did not match cart total. Contact support.",
                });
            }

            let result;
            try {
                result = await fulfillOrder({
                    items,
                    customerEmail: email,
                    paymentMethod: "stripe",
                    status: "completed",
                    stripeSessionId: sessionId,
                });
            } catch (err) {
                // Unique index race: another request inserted first
                if (err?.code === 11000 || err?.message?.includes("duplicate key")) {
                    const raced = await Order.findOne({ stripeSessionId: sessionId }).lean();
                    if (raced) {
                        return res.status(200).json(orderResponsePayload(raced));
                    }
                }
                throw err;
            }

            res.status(201).json({
                message: "Order placed successfully.",
                order: result.order,
                emailSent: result.emailSent,
                emailMessage: result.emailMessage,
                downloads: result.downloads,
            });
        } finally {
            release?.();
            stripeConfirmInFlight.delete(sessionId);
        }
    } catch (error) {
        console.error("Stripe confirm error:", error.message);
        const status = error.statusCode || 500;
        res.status(status).json({
            message: error.message || "Failed to complete Stripe payment.",
        });
    }
};
