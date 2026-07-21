import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendPurchaseEmail } from "./emailService.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalize cart lines against live product prices/galleries in the DB.
 * @param {Array} items
 * @returns {Promise<{ normalizedItems: Array, totalAmount: number }>}
 */
export async function normalizeOrderItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        const err = new Error("Order must include at least one item.");
        err.statusCode = 400;
        throw err;
    }

    const normalizedItems = [];

    for (const item of items) {
        const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
        const price = Number(item.price);
        const slug = item.slug;

        if (!slug || !item.title || Number.isNaN(price)) {
            const err = new Error("Each item requires slug, title, and a valid price.");
            err.statusCode = 400;
            throw err;
        }

        const product = await Product.findOne({ slug }).lean();
        const fullGallery = product?.fullGallery?.length
            ? product.fullGallery
            : Array.isArray(item.fullGallery)
              ? item.fullGallery
              : [];

        normalizedItems.push({
            productId: item.productId ?? item.id ?? product?.id,
            slug,
            title: product?.title || item.title,
            price: product?.price != null ? Number(product.price) : price,
            quantity,
            fullGallery,
            coverImage: product?.coverImage || item.coverImage || "",
        });
    }

    const totalAmount = normalizedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return { normalizedItems, totalAmount };
}

/**
 * Persist order, link user, send delivery email, build download list.
 */
export async function fulfillOrder({
    items,
    customerEmail,
    paymentMethod = "demo",
    status = "completed",
    paypalOrderId = null,
}) {
    const email = String(customerEmail || "").trim().toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) {
        const err = new Error(
            "A valid email is required so we can deliver your wallpapers."
        );
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

export { EMAIL_REGEX };
