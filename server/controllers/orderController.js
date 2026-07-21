import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendPurchaseEmail } from "../services/emailService.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createOrder = async (req, res) => {
    try {
        const {
            items,
            paymentMethod = "demo",
            customerEmail,
            status = "completed",
        } = req.body;

        const email = String(customerEmail || "").trim().toLowerCase();
        if (!email || !EMAIL_REGEX.test(email)) {
            return res.status(400).json({
                message: "A valid email is required so we can deliver your wallpapers.",
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Order must include at least one item." });
        }

        const normalizedItems = [];

        for (const item of items) {
            const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
            const price = Number(item.price);
            const slug = item.slug;

            if (!slug || !item.title || Number.isNaN(price)) {
                return res.status(400).json({
                    message: "Each item requires slug, title, and a valid price.",
                });
            }

            // Prefer live product data so fullGallery is always current
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

        // Link to account when email matches a registered user (future library)
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

        res.status(201).json({
            message: "Order placed successfully.",
            order,
            emailSent: emailResult.sent,
            emailMessage: emailResult.message,
            downloads,
        });
    } catch (error) {
        console.error("Error creating order: ", error.message);
        res.status(500).json({ message: "Failed to create order. Internal server error." });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders: ", error.message);
        res.status(500).json({ message: "Failed to fetch orders. Internal server error." });
    }
};

export const getOrderStats = async (req, res) => {
    try {
        const completedMatch = { status: "completed" };

        const [totals] = await Order.aggregate([
            { $match: completedMatch },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 },
                },
            },
        ]);

        const [mostPopular] = await Order.aggregate([
            { $match: completedMatch },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.slug",
                    title: { $first: "$items.title" },
                    unitsSold: { $sum: "$items.quantity" },
                },
            },
            { $sort: { unitsSold: -1 } },
            { $limit: 1 },
        ]);

        res.status(200).json({
            totalSales: totals?.totalSales ?? 0,
            orderCount: totals?.orderCount ?? 0,
            mostPopularProduct: mostPopular
                ? {
                      slug: mostPopular._id,
                      title: mostPopular.title,
                      unitsSold: mostPopular.unitsSold,
                  }
                : null,
        });
    } catch (error) {
        console.error("Error fetching order stats: ", error.message);
        res.status(500).json({ message: "Failed to fetch order stats. Internal server error." });
    }
};
