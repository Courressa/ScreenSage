import { fulfillOrder } from "../services/orderService.js";
import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
    try {
        const {
            items,
            paymentMethod = "demo",
            customerEmail,
            status = "completed",
        } = req.body;

        // Only allow free demo fulfillment from this public endpoint
        if (paymentMethod !== "demo") {
            return res.status(400).json({
                message:
                    "Use the payment provider endpoints for real payments (e.g. PayPal).",
            });
        }

        const result = await fulfillOrder({
            items,
            customerEmail,
            paymentMethod: "demo",
            status,
        });

        res.status(201).json({
            message: "Order placed successfully.",
            order: result.order,
            emailSent: result.emailSent,
            emailMessage: result.emailMessage,
            downloads: result.downloads,
        });
    } catch (error) {
        console.error("Error creating order: ", error.message);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message:
                error.statusCode
                    ? error.message
                    : "Failed to create order. Internal server error.",
        });
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
