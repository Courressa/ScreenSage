import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true },
        type: { type:String, required: true, enum: ['collection', 'individual'] },
        slug: { type:String, required: true, unique: true },
        title: { type:String, required: true },
        contributor: { type: String },
        category: { type:String, required: true },
        mood: [{ type:String }],
        tags: [{ type:String }],
        description: { type:String, required: true },
        price: { type: Number, required: true },
        imageCount: { type: Number, required: true },
        hasVideo: { type: Boolean, required: true },
        coverImage: { type:String, required: true },

        devicePreviews: {
            phone: [{ type: String }],
            tablet: [{ type: String }],
            desktop: [{ type: String }]
        },
    
        fullGallery: [{ type: String }],
    
        devices: [{ type: String, enum:['phone', 'tablet', 'desktop'] }],
        resolutions: [{ type: String }],
        stripePriceId: { type: String },
        paypalProductId: { type: String }
    }, {
        timestamps: true
    }
);

export default mongoose.model("Product", productSchema);