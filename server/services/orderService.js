import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendPurchaseEmail } from "./emailService.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_QUANTITY_PER_LINE = 10;

/**
 * Default product lookup (overridable in unit tests).
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
async function defaultFindProduct(slug) {
    return Product.findOne({ slug }).lean();
}

/**
 * Normalize cart lines against live product prices/galleries in the DB.
 * Never trusts client price or fullGallery — product must exist.
 *
 * @param {Array} items
 * @param {{ findProduct?: (slug: string) => Promise<object|null> }} [options]
 * @returns {Promise<{ normalizedItems: Array, totalAmount: number }>}
 */
export async function normalizeOrderItems(items, options = {}) {
    const findProduct = options.findProduct || defaultFindProduct;

    if (!Array.isArray(items) || items.length === 0) {
        const err = new Error("Order must include at least one item.");
        err.statusCode = 400;
        throw err;
    }

    const normalizedItems = [];

    for (const item of items) {
        const slug = item?.slug;
        if (!slug || typeof slug !== "string") {
            const err = new Error("Each item requires a product slug.");
            err.statusCode = 400;
            throw err;
        }

        const product = await findProduct(slug);
        if (!product) {
            const err = new Error(`Product not found for slug: ${slug}`);
            err.statusCode = 400;
            throw err;
        }

        const rawQty = Number(item.quantity);
        const quantity =
            Number.isFinite(rawQty) && rawQty > 0
                ? Math.min(Math.floor(rawQty), MAX_QUANTITY_PER_LINE)
                : 1;

        const price = Number(product.price);
        if (!Number.isFinite(price) || price < 0) {
            const err = new Error(`Invalid price on product: ${slug}`);
            err.statusCode = 400;
            throw err;
        }

        normalizedItems.push({
            productId: product.id,
            slug: product.slug,
            title: product.title,
            price,
            quantity,
            fullGallery: Array.isArray(product.fullGallery)
                ? product.fullGallery
                : [],
            coverImage: product.coverImage || "",
        });
    }

    const totalAmount = normalizedItems.reduce(
        (sum, line) => sum + line.price * line.quantity,
        0
    );

    return { normalizedItems, totalAmount };
}

/**
 * Persist order, link user, send delivery email, build download list.
 * paymentMethod must be provided explicitly (no free "demo" default).
 */
export async function fulfillOrder({
    items,
    customerEmail,
    paymentMethod,
    status = "completed",
    paypalOrderId = null,
    stripeSessionId = null,
}) {
    const email = String(customerEmail || "").trim().toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) {
        const err = new Error(
            "A valid email is required so we can deliver your wallpapers."
        );
        err.statusCode = 400;
        throw err;
    }

    if (!paymentMethod || !["stripe", "paypal", "demo"].includes(paymentMethod)) {
        const err = new Error("A valid payment method is required.");
        err.statusCode = 400;
        throw err;
    }

    const { normalizedItems, totalAmount } = await normalizeOrderItems(items);

    let userId = null;
    const existingUser = await User.findOne({ email }).select("_id").lean();
    if (existingUser) {
        userId = existingUser._id;
    }

    const order = new Order({
        items: normalizedItems,
        totalAmount,
        status,
        paymentMethod,
        customerEmail: email,
        user: userId,
        paypalOrderId: paypalOrderId || undefined,
        stripeSessionId: stripeSessionId || undefined,
    });

    await order.save();

    if (userId) {
        await User.findByIdAndUpdate(userId, {
            $addToSet: { orderHistory: order._id },
        });
    }

    const emailResult = await sendPurchaseEmail({
        to: email,
        order,
        items: normalizedItems,
    });

    order.emailSent = emailResult.sent;
    order.emailMessage = emailResult.message;
    await order.save();

    const downloads = normalizedItems.flatMap((item) =>
        (item.fullGallery || []).map((url, index) => ({
            title: item.title,
            slug: item.slug,
            url,
            filename: `${item.slug}-${index + 1}`,
        }))
    );

    return {
        order,
        emailSent: emailResult.sent,
        emailMessage: emailResult.message,
        downloads,
        totalAmount,
    };
}

export { EMAIL_REGEX, MAX_QUANTITY_PER_LINE };
