/* global process */
import Stripe from "stripe";

let stripeClient = null;

export function isStripeConfigured() {
    return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
    if (!isStripeConfigured()) {
        throw new Error(
            "Stripe is not configured. Set STRIPE_SECRET_KEY on the server."
        );
    }
    if (!stripeClient) {
        stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripeClient;
}

/**
 * Public site URL for success/cancel redirects (no trailing slash).
 */
export function getFrontendBaseUrl() {
    const raw =
        process.env.FRONTEND_URL ||
        process.env.CLIENT_URL ||
        "http://localhost:5173";
    return String(raw).replace(/\/$/, "");
}

/**
 * Create a Stripe Checkout Session for a one-time cart payment.
 * @param {{
 *   normalizedItems: Array,
 *   customerEmail: string,
 *   totalAmount: number,
 * }} params
 */
export async function createCheckoutSession({
    normalizedItems,
    customerEmail,
    totalAmount,
}) {
    const stripe = getStripe();
    const base = getFrontendBaseUrl();

    const line_items = normalizedItems.map((item) => {
        const unitAmount = Math.round(Number(item.price) * 100);
        if (!Number.isFinite(unitAmount) || unitAmount < 50) {
            // Stripe minimum is typically $0.50 USD
            throw Object.assign(
                new Error(
                    `Price for "${item.title}" is too low for Stripe (min $0.50).`
                ),
                { statusCode: 400 }
            );
        }

        const productData = {
            name: item.title,
        };
        if (item.coverImage && /^https?:\/\//i.test(item.coverImage)) {
            productData.images = [item.coverImage];
        }

        return {
            quantity: item.quantity,
            price_data: {
                currency: "usd",
                unit_amount: unitAmount,
                product_data: productData,
            },
        };
    });

    // Compact cart for metadata (500 char limit per value)
    const cartMeta = JSON.stringify(
        normalizedItems.map((i) => ({
            slug: i.slug,
            quantity: i.quantity,
        }))
    );

    if (cartMeta.length > 500) {
        throw Object.assign(
            new Error("Cart is too large for Stripe metadata. Remove some items."),
            { statusCode: 400 }
        );
    }

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: customerEmail,
        line_items,
        success_url: `${base}/cart?stripe_session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/cart?stripe_cancelled=1`,
        metadata: {
            customerEmail,
            cart: cartMeta,
            expectedTotal: Number(totalAmount).toFixed(2),
        },
        payment_intent_data: {
            metadata: {
                customerEmail,
            },
        },
    });

    return session;
}

export async function retrieveCheckoutSession(sessionId) {
    const stripe = getStripe();
    return stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent"],
    });
}
