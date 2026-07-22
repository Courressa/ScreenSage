import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        productId: { type: Number },
        slug: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1, min: 1 },
        // Snapshot of downloadable assets at purchase time (for email + re-download)
        fullGallery: [{ type: String }],
        coverImage: { type: String },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => Array.isArray(items) && items.length > 0,
                message: "Order must include at least one item",
            },
        },
        totalAmount: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["completed", "pending", "cancelled"],
            default: "completed",
        },
        paymentMethod: {
            type: String,
            // "demo" kept for historical orders only — public free checkout removed
            enum: ["demo", "stripe", "paypal"],
            required: true,
        },
        /** PayPal Checkout order id (for capture + idempotency) */
        paypalOrderId: { type: String, default: null },
        /** Stripe Checkout Session id (for confirm + idempotency) */
        stripeSessionId: { type: String, default: null },
        customerEmail: { type: String, required: true, trim: true, lowercase: true },
        // Optional link for signed-in users / future “My library”
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        emailSent: { type: Boolean, default: false },
        emailMessage: { type: String },
    },
    {
        timestamps: true,
    }
);

// One ScreenSage order per payment session (prevents double-fulfill from React remounts)
orderSchema.index(
    { stripeSessionId: 1 },
    {
        unique: true,
        partialFilterExpression: { stripeSessionId: { $type: "string" } },
    }
);
orderSchema.index(
    { paypalOrderId: 1 },
    {
        unique: true,
        partialFilterExpression: { paypalOrderId: { $type: "string" } },
    }
);

export default mongoose.model("Order", orderSchema);
