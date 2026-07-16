import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
    try {
        const { items, paymentMethod = "demo", customerEmail, status = "completed" } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Order must include at least one item." });
        }

        const normalizedItems = items.map((item) => {
            const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
            const price = Number(item.price);

            return {
                productId: item.productId ?? item.id,
                slug: item.slug,
                title: item.title,
                price,
                quantity,
            };
        });

        for (const item of normalizedItems) {
            if (!item.slug || !item.title || Number.isNaN(item.price)) {
                return res.status(400).json({
                    message: "Each item requires slug, title, and a valid price.",
                });
            }
        }

        const totalAmount = normalizedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const order = new Order({
            items: normalizedItems,
            totalAmount,
            status,
            paymentMethod,
            customerEmail,
        });

        await order.save();

        res.status(201).json({ message: "Order created successfully", order });
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
